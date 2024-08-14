import { step, log, condition } from "@restackio/restack-sdk-ts/workflow";
import { onEvent } from "@restackio/restack-sdk-ts/event";
import * as functions from "../../functions";
import {
  Message,
  messageEvent,
  AudioIn,
  audioInEvent,
  streamEndEvent,
  StreamInfo,
  streamInfoEvent,
} from "./events";
import { workflowInfo } from "@restackio/restack-sdk-ts/workflow";

export async function streamWorkflow() {
  try {
    let currentstreamSid: string;
    let interactionCount = 0;
    let audioQueue: {
      streamSid: string;
      audio: string;
      text: string;
    }[] = [];
    let isSendingAudio = false;

    // Start long running websocket and stream welcome message to websocket.
    onEvent(streamInfoEvent, async ({ streamSid }: StreamInfo) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);
      step<typeof functions>({
        taskQueue: `websocket`,
        scheduleToCloseTimeout: "30 minutes",
      }).websocketListenMedia({ streamSid });

      currentstreamSid = streamSid;
      return { streamSid };
    });

    // Receives audio, transcribe it and send transcription to AI agent.

    onEvent(audioInEvent, async ({ streamSid, username, payload }: AudioIn) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);
      const { finalResult, language } = await step<typeof functions>({
        taskQueue: `deepgram`,
      }).deepgramListen({ streamSid, payload });

      interactionCount += 1;

      step<typeof functions>({
        taskQueue: `websocket`,
      }).websocketSendEvent({
        streamSid,
        eventName: messageEvent.name,
        data: { text: finalResult, language, username },
      });

      await step<typeof functions>({
        taskQueue: "openai",
      }).openaiChat({
        streamSid,
        text: finalResult,
        username,
        language,
        workflowToUpdate: {
          ...workflowInfo(),
        },
      });

      return { streamSid };
    });

    // Receives AI answer, generates audio and stream it to websocket.

    onEvent(
      messageEvent,
      async ({ streamSid, response, username, language, isLast }: Message) => {
        const { audio } = await step<typeof functions>({
          taskQueue: `elevenlabs`,
        }).elevenlabsConvert({
          streamSid,
          text: response,
          language,
          username,
        });

        audioQueue.push({ streamSid, audio, text: response });

        if (!isSendingAudio && isLast) {
          isSendingAudio = true;

          while (audioQueue.length > 0) {
            const { streamSid, audio } = audioQueue.shift()!;

            await step<typeof functions>({
              taskQueue: `websocket`,
            }).websocketSendAudio({ streamSid, audio, language, username });
          }

          await step<typeof functions>({
            taskQueue: `websocket`,
          }).websocketSendEvent({
            streamSid,
            eventName: messageEvent.name,
            data: { text: response, language, username },
          });

          isSendingAudio = false;
        }

        return { streamSid };
      }
    );

    // Terminates stream workflow.

    let ended = false;

    onEvent(streamEndEvent, async () => {
      log.info(`streamEnd received`);
      ended = true;
    });

    await condition(() => ended);

    return;
  } catch (error) {
    log.error("Error in streamWorkflow", { error });
    throw error;
  }
}
