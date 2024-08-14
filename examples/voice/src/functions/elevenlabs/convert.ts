import { FunctionFailure, log } from "@restackio/restack-sdk-ts/function";
import { ElevenLabs, ElevenLabsClient } from "elevenlabs";
import "dotenv/config";

export async function elevenlabsConvert({
  streamSid,
  text,
  username,
  language,
}: {
  streamSid: string;
  text: string;
  username: string;
  language: string;
}): Promise<{ streamSid: string; audio: string }> {
  if (!text.length) {
    log.error("Text is empty");
    throw FunctionFailure.nonRetryable("Text is empty");
  }

  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const voiceId =
      language === "fr"
        ? "fnoOtHjtLbYs6mOpUSdr"
        : language === "hi"
        ? "50YSQEDPA2vlOxhCseP4"
        : "fCxG8OHm4STbIsWe4aT9";

    const response = await elevenlabs.textToSpeech
      .convert(voiceId, {
        model_id: "eleven_turbo_v2_5",
        language_code: language,
        optimize_streaming_latency: ElevenLabs.OptimizeStreamingLatency.Zero,
        output_format: ElevenLabs.OutputFormat.Ulaw8000,
        text,
        voice_settings: {
          stability: 0.1,
          similarity_boost: 0.3,
          style: 0.2,
        },
      })
      .finally();

    const chunks: Buffer[] = [];
    for await (const chunk of response) {
      chunks.push(chunk);
    }

    const content = Buffer.concat(chunks);

    const base64String = Buffer.from(content).toString("base64");

    log.info("Elevenlabs: ", {
      audioLength: base64String.length,
    });
    return { streamSid, audio: base64String };
  } catch (error) {
    log.error("Elevenlabs convert error", { error });
    throw new Error(`Elevenlabs convert error ${error}`);
  }
}
