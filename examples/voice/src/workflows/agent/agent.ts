import {
  step,
  log,
  workflowInfo,
  condition,
} from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../../functions";
import { onEvent } from "@restackio/restack-sdk-ts/event";
import { agentEnd, Reply, replyEvent, ToolCall, toolCallEvent } from "./events";
import { imageEvent } from "../stream/events";

export async function agentWorkflow({
  streamSid,
  message,
}: {
  streamSid: string;
  message: string;
}) {
  try {
    const parentWorkflow = workflowInfo().parent;
    if (!parentWorkflow) throw "no parent Workflow";

    let openaiChatMessages: any[] = [];

    // Get tools definition and start conversation.

    const tools = await step<typeof functions>({
      taskQueue: "dnd",
    }).dndTools();

    const initialMessages = await step<typeof functions>({
      taskQueue: "openai",
    }).openaiChat({
      streamSid,
      text: message,
      tools,
      workflowToUpdate: parentWorkflow,
    });

    if (initialMessages?.messages) {
      openaiChatMessages = initialMessages.messages;
    }

    // On user reply, send it to AI chat with previous messages to continue conversation.

    onEvent(replyEvent, async ({ streamSid, text }: Reply) => {
      const replyMessage = await step<typeof functions>({
        taskQueue: "openai",
      }).openaiChat({
        streamSid,
        text,
        tools,
        previousMessages: openaiChatMessages,
        workflowToUpdate: parentWorkflow,
      });

      if (replyMessage?.messages) {
        openaiChatMessages = replyMessage.messages;
      }

      return { text };
    });

    // When AI answer is a tool call, execute function and push results to conversation.

    onEvent(toolCallEvent, async ({ function: toolFunction }: ToolCall) => {
      log.info("toolCallEvent", { toolFunction });

      async function callERPFunction(toolFunction: ToolCall["function"]) {
        const dndStep = step<typeof functions>({
          taskQueue: "dnd",
        });

        switch (toolFunction.name) {
          case "dndAbilityScore":
            return dndStep.dndAbilityScore({
              ...toolFunction.arguments,
            });
          case "dndAlignment":
            return dndStep.dndAlignment({
              ...toolFunction.arguments,
            });
          case "dndClass":
            return dndStep.dndClass({
              ...toolFunction.arguments,
            });
          case "dndCombat":
            return dndStep.dndCombat({ ...toolFunction.arguments });
          case "dndEquipment":
            return dndStep.dndEquipment({ ...toolFunction.arguments });
          case "dndImage":
            const image = await dndStep.dndImage({ ...toolFunction.arguments });
            await step<typeof functions>({
              taskQueue: "websocket",
            }).websocketSendEvent({
              streamSid,
              eventName: imageEvent.name,
              data: { image },
            });
            return image;
          case "dndMonster":
            return dndStep.dndMonster({ ...toolFunction.arguments });
          case "dndRace":
            return dndStep.dndRace({
              ...toolFunction.arguments,
            });
          case "dndResource":
            return dndStep.dndResource({ ...toolFunction.arguments });
          case "dndRoleDice":
            return dndStep.dndRoleDice({ ...toolFunction.arguments });
          case "dndSkill":
            return dndStep.dndSkill({ ...toolFunction.arguments });

          default:
            throw new Error(`Unknown function name: ${toolFunction.name}`);
        }
      }

      const toolResult = await callERPFunction(toolFunction);

      openaiChatMessages.push({
        content: JSON.stringify(toolResult),
        role: "function",
        name: toolFunction.name,
      });

      const toolMessage = await step<typeof functions>({
        taskQueue: "openai",
      }).openaiChat({
        streamSid,
        previousMessages: openaiChatMessages,
        workflowToUpdate: parentWorkflow,
      });

      if (toolMessage?.messages) {
        openaiChatMessages = toolMessage.messages;
      }

      return { function: toolFunction };
    });

    // Terminate AI agent workflow.

    let ended = false;
    onEvent(agentEnd, async () => {
      log.info(`agentEnd received`);
      ended = true;
    });

    await condition(() => ended);

    return;
  } catch (error) {
    log.error("Error in agentWorkflow", { error });
    throw error;
  }
}
