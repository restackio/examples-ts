import { z } from "zod";

const validAlignment = [
  "chaotic-neutral",
  "chaotic-evil",
  "chaotic-good",
  "lawful-neutral",
  "lawful-evil",
  "lawful-good",
  "neutral",
  "neutral-evil",
  "neutral-good",
] as const;

export const alignmentSchema = z.object({
  alignment: z.enum(validAlignment).describe("The character alignment"),
});

export type AlignmentInput = z.infer<typeof alignmentSchema>;

export async function dndAlignment({
  alignment: alignmentName,
}: AlignmentInput) {
  if (!validAlignment.includes(alignmentName)) {
    throw new Error("Invalid alignment");
  }

  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(
    `https://www.dnd5eapi.co/api/alignments/${alignmentName}`,
    requestOptions
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch alignment");
  }
}
