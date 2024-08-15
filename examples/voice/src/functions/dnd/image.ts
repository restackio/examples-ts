import { z } from "zod";
import { falImage } from "../fal/image";

export const ImageSchema = z.object({
  prompt: z
    .string()
    .describe(
      "Prompt to generate image. Make sure to mention its about Dungeon and Dragon. Add add keyword suffixes like fantasy, high quality, 4k, etc."
    ),
});

export type ImageInput = z.infer<typeof ImageSchema>;

export async function dndImage({ prompt }: ImageInput) {
  if (!prompt) {
    throw new Error("Invalid prompt");
  }

  const response = await falImage({ prompt });

  return { prompt, url: response.images[0].url };
}
