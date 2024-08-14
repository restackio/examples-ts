import {
  heartbeat,
  currentWorkflow,
  log,
} from "@restackio/restack-sdk-ts/function";
import { websocketConnect } from "./connect";
import Restack from "@restackio/restack-sdk-ts";
import {
  AudioIn,
  audioInEvent,
  streamEndEvent,
} from "../../workflows/stream/events";

type StreamInput = {
  streamSid: string;
};

export async function websocketListenMedia({ streamSid }: StreamInput) {
  return new Promise<void>(async (resolve) => {
    const ws = await websocketConnect();
    const restack = new Restack();
    const { workflowId, runId } = currentWorkflow().workflowExecution;
    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.streamSid === streamSid) {
        if (message.event === "media") {
          if (message.media.track === "inbound") {
            // Clean Twilio empty noise
            // const cleanedPayload = message.media.payload?.replace(
            //   /(\+\/[a-zA-Z0-9+\/]{2,}==)/g,
            //   ""
            // );
            // if (!cleanedPayload) {
            //   return;
            // }
            log.info("send payload", {
              streamSid,
              username: message.media.username,
              payload: message.media.payload.length,
            });
            const input: AudioIn = {
              streamSid,
              username: message.media.username,
              payload: message.media.payload,
            };
            restack.sendWorkflowEvent({
              workflowId,
              runId,
              eventName: audioInEvent.name,
              input,
            });
          }
        }
      }
      heartbeat(message.streamSid);
      if (message.event === "stop") {
        restack.sendWorkflowEvent({
          workflowId,
          runId,
          eventName: streamEndEvent.name,
        });
        resolve();
      }
    });
  });
}
