import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import "dotenv/config";

let speechConfig: sdk.SpeechConfig | null = null;

export function azureSpeechClient() {
  if (!speechConfig) {
    const apiKey = process.env.AZURE_API_KEY;
    const region = process.env.AZURE_LOCATION;
    if (!apiKey || !region) {
      throw new Error("Azure subscription key or service region is missing");
    }
    speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
  }
  return speechConfig;
}
