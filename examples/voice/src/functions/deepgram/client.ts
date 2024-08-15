import { createClient, DeepgramClient } from "@deepgram/sdk";

let clientDeepgram: DeepgramClient;

export function deepgramClient() {
  if (!clientDeepgram) {
    clientDeepgram = createClient(process.env.DEEPGRAM_API_KEY);
  }
  return clientDeepgram;
}
