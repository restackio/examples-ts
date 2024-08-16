import OpenAI from "openai";
import "dotenv/config";
import { agentPrompt } from "./prompt";
import { currentWorkflow, log } from "@restackio/restack-sdk-ts/function";
import { Answer, answerEvent } from "../../workflows/stream/events";
import { ChatCompletionChunk } from "openai/resources/chat/completions.mjs";
import { toolCallEvent } from "../../workflows/agent/events";
import { aggregateStreamChunks } from "./utils/aggregateStream";
import { mergeToolCalls } from "./utils/mergeToolCalls";
import { ParentWorkflowInfo } from "@temporalio/workflow";
import Restack from "@restackio/restack-sdk-ts";
import { openaiClient } from "./client";

export async function openaiChat({
  streamSid,
  text,
  previousMessages,
  tools,
  workflowToUpdate,
}: {
  streamSid: string;
  text?: string;
  previousMessages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  workflowToUpdate?: ParentWorkflowInfo;
}) {
  const restack = new Restack();
  const { workflowId, runId } = currentWorkflow().workflowExecution;

  let messages = previousMessages ?? [];
  if (!previousMessages) {
    messages = [...agentPrompt];
  }

  if (text) {
    messages.push({
      role: "user",
      content: text,
    });
  }

  const openai = openaiClient();
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools,
    stream: true,
    user: streamSid,
  });

  let finishReason: ChatCompletionChunk.Choice["finish_reason"];
  let response: ChatCompletionChunk.Choice.Delta["content"] = "";

  const [stream1, stream2] = stream.tee();
  const readableStream = stream1.toReadableStream();
  const aggregatedStream = await aggregateStreamChunks(readableStream);

  for await (const chunk of stream2) {
    let content = chunk.choices[0]?.delta?.content || "";
    finishReason = chunk.choices[0].finish_reason;

    if (finishReason === "tool_calls") {
      const { toolCalls } = mergeToolCalls(aggregatedStream);

      await Promise.all(
        toolCalls.map((toolCall) => {
          log.info("Tool Call", { toolCall });

          const toolAnswer = `I am summoning ${toolCall?.function?.name}...`;
          const toolMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam =
            {
              content: toolAnswer,
              role: "assistant",
            };
          messages.push(toolMessage);
          const inputAnswer: Answer = {
            streamSid,
            response: toolAnswer,
            isLast: true,
          };
          log.info("inputAnswer", { inputAnswer });
          if (workflowToUpdate) {
            restack.sendWorkflowEvent({
              workflowId: workflowToUpdate.workflowId,
              runId: workflowToUpdate.runId,
              eventName: answerEvent.name,
              input: inputAnswer,
            });
          }

          log.info("functionArguments", {
            functionArguments: toolCall.function?.arguments,
          });
          const functionArguments = JSON.parse(
            toolCall.function?.arguments ?? ""
          );

          restack.sendWorkflowEvent({
            workflowId,
            runId,
            eventName: toolCallEvent.name,
            input: {
              ...toolCall,
              function: {
                name: toolCall.function?.name,
                arguments: functionArguments,
              },
            },
          });
        })
      );
      return {
        streamSid,
        messages,
      };
    } else {
      response += content;
      if (content.trim().slice(-1) === "•" || finishReason === "stop") {
        if (response.length) {
          const input: Answer = {
            streamSid,
            response: response,
            isLast: finishReason === "stop",
          };
          log.info("input", { input });
          if (workflowToUpdate) {
            restack.sendWorkflowEvent({
              workflowId: workflowToUpdate.workflowId,
              runId: workflowToUpdate.runId,
              eventName: answerEvent.name,
              input,
            });
          }
        }
      }

      if (finishReason === "stop") {
        const newMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
          content: response,
          role: "assistant",
        };

        messages.push(newMessage);

        return {
          streamSid,
          messages,
        };
      }
    }
  }
}
