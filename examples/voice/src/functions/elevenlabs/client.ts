import { ElevenLabsClient } from "elevenlabs";

let clientElevenlabs: ElevenLabsClient;

export function elevenlabsClient() {
  if (!clientElevenlabs) {
    clientElevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }
  return clientElevenlabs;
}
