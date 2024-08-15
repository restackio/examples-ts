import * as fal from "@fal-ai/serverless-client";
import { FunctionFailure, log } from "@restackio/restack-sdk-ts/function";

type ImageResults = {
  images: {
    url: string;
    width: number;
    height: number;
    content_type: string;
  }[];
  timings: {
    inference: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
};

export async function falImage({ prompt }: { prompt: string }) {
  if (!prompt) {
    throw FunctionFailure.nonRetryable("No prompt");
  }

  try {
    fal.config({
      credentials: process.env.FAL_API_KEY,
    });

    const result: ImageResults = await fal.run("fal-ai/flux/dev", {
      input: {
        prompt,
      },
    });

    log.info("result", { result });

    return result;
  } catch (error) {
    throw new Error(`Fal error ${error}`);
  }
}
