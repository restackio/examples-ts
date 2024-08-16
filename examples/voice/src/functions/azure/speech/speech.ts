import { FunctionFailure, log } from "@restackio/restack-sdk-ts/function";
import { azureSpeechClient } from "./client";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { Buffer } from "node:buffer";

export async function azureSpeech({
  streamSid,
  text,
}: {
  streamSid: string;
  text: string;
}): Promise<{ streamSid: string; audio: string }> {
  if (!text.length) {
    log.error("Text is empty");
    throw FunctionFailure.nonRetryable("Text is empty");
  }

  try {
    const speechConfig = azureSpeechClient();
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Raw8Khz8BitMonoMULaw;

    speechConfig.speechSynthesisVoiceName = "en-US-DavisNeural";

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        async (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioData = Buffer.from(result.audioData);
            const base64String = audioData.toString("base64");
            log.info("azureSpeech: ", {
              audioLength: base64String.length,
            });
            resolve({ streamSid, audio: base64String });
          } else {
            log.error("Speech synthesis canceled", {
              errorDetails: result.errorDetails,
            });
            reject(
              new Error(`Speech synthesis canceled: ${result.errorDetails}`)
            );
          }
          synthesizer.close();
        },
        (err) => {
          log.error("Error during speech synthesis", { error: err });
          synthesizer.close();
          reject(new Error(`Error during speech synthesis: ${err}`));
        }
      );
    });
  } catch (error) {
    log.error("Azure Speech error", { error });
    throw new Error(`Azure Speech error ${error}`);
  }
}
