import { FunctionFailure, log } from "@restackio/restack-sdk-ts/function";
import "dotenv/config";
export async function cartesiaSend({
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
  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) {
    throw new Error("CARTESIA_API_KEY is not defined");
  }
  try {
    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript: text,
        model_id: "sonic-english",
        voice: {
          mode: "id",
          id: "c45bc5ec-dc68-4feb-8829-6e6b2748095d",
        },
        output_format: {
          container: "raw",
          encoding: "pcm_mulaw",
          sample_rate: 8000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Cartesia send error: ${response.statusText}`);
    }

    const content = await response.arrayBuffer();
    const base64String = Buffer.from(content).toString("base64");
    log.info("Cartesia: ", {
      audioLength: base64String.length,
    });
    return { streamSid, audio: base64String };
  } catch (error) {
    log.error("Cartesia send error", { error });
    throw new Error(`Cartesia send error ${error}`);
  }
}
