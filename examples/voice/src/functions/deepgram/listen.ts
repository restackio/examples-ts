import { FunctionFailure, log } from "@restackio/restack-sdk-ts/function";
import { Buffer } from "node:buffer";
import "dotenv/config";
import { createClient } from "@deepgram/sdk";

export async function deepgramListen({
  streamSid,
  payload,
}: {
  streamSid: string;
  payload: string;
}) {
  if (!payload) {
    throw FunctionFailure.nonRetryable("No audio file");
  }

  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const decodedBuffer = Buffer.from(payload, "base64");

    const response = await deepgram.listen.prerecorded.transcribeFile(
      decodedBuffer,
      {
        detect_language: true,
        encoding: "mulaw",
        sample_rate: 8000,
        model: "nova-2",
        punctuate: true,
        interim_results: true,
        endpointing: 500,
        utterance_end_ms: 2000,
      }
    );

    if (response.error) {
      log.error("deepgramListen error", { error: response.error });
    }

    const results = response.result?.results;

    log.debug("deepgramListen results:  ", {
      results: results,
    });

    const transcript = results?.channels?.[0]?.alternatives?.[0]?.transcript;
    const language = results?.channels?.[0]?.detected_language;

    log.info("deepgramListen transcript: ", {
      transcript: transcript,
      language,
    });
    return {
      streamSid,
      finalResult: transcript ?? "",
      language: language ?? "",
    };
  } catch (error) {
    throw new Error(`Deepgram TTS error ${error}`);
  }
}
