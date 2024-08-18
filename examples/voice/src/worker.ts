import Restack from "@restackio/restack-sdk-ts";
import {
  workflowSendEvent,
  twilioCall,
  deepgramListen,
  deepgramSpeak,
  openaiChat,
  websocketListenMedia,
  websocketSendAudio,
  websocketSendEvent,
  elevenlabsConvert,
} from "./functions";

async function main() {
  const workflowsPath = require.resolve("./Workflows");

  try {
    const restack = new Restack();

    await Promise.all([
      restack.startService({
        taskQueue: "restack",
        workflowsPath,
        functions: { workflowSendEvent },
      }),
      restack.startService({
        taskQueue: "websocket",
        workflowsPath,
        functions: {
          websocketListenMedia,
          websocketSendAudio,
          websocketSendEvent,
        },
      }),
      restack.startService({
        taskQueue: "twilio",
        workflowsPath,
        functions: { twilioCall },
        rateLimit: 200,
      }),
      restack.startService({
        taskQueue: "openai",
        workflowsPath,
        functions: { openaiChat },
        rateLimit: 10000,
      }),
      restack.startService({
        taskQueue: "deepgram",
        workflowsPath,
        functions: { deepgramSpeak, deepgramListen },
        rateLimit: 10000,
      }),
      restack.startService({
        taskQueue: "elevenlabs",
        workflowsPath,
        functions: { elevenlabsConvert },
        rateLimit: 10000,
      }),
    ]);

    console.log("Workers running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
