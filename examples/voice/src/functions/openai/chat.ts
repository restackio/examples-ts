import OpenAI from "openai";
import "dotenv/config";
import { agentPrompt } from "./prompt";
import { Message, messageEvent } from "../../workflows/stream/events";
import { ChatCompletionChunk } from "openai/resources/chat/completions.mjs";
import { ParentWorkflowInfo } from "@temporalio/workflow";
import Restack from "@restackio/restack-sdk-ts";
import { log } from "@restackio/restack-sdk-ts/function";
import { openaiClient } from "./client";

export async function openaiChat({
  streamSid,
  text,
  language,
  username,
  previousMessages,
  workflowToUpdate,
}: {
  streamSid: string;
  text?: string;
  username: string;
  language: string;
  previousMessages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  workflowToUpdate?: ParentWorkflowInfo;
}) {
  const restack = new Restack();

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
    stream: true,
    user: streamSid,
  });

  let finishReason: ChatCompletionChunk.Choice["finish_reason"];
  let response: ChatCompletionChunk.Choice.Delta["content"] = "";

  for await (const chunk of stream) {
    let content = chunk.choices[0]?.delta?.content || "";
    finishReason = chunk.choices[0].finish_reason;

    response += content;
    if (content.trim().slice(-1) === "•" || finishReason === "stop") {
      if (response.length) {
        const input: Message = {
          streamSid,
          username,
          response: response,
          language: language === "fr" ? "en" : "fr",
          isLast: finishReason === "stop",
        };
        log.info("input", { input });
        if (workflowToUpdate) {
          restack.sendWorkflowEvent({
            workflowId: workflowToUpdate.workflowId,
            runId: workflowToUpdate.runId,
            eventName: messageEvent.name,
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
