import { z } from "zod";

const validClass = [
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard",
] as const;

export const classSchema = z.object({
  class: z.enum(validClass).describe("The character class"),
});

export type ClassInput = z.infer<typeof classSchema>;

export async function dndClass({ class: className }: ClassInput) {
  if (!validClass.includes(className)) {
    throw new Error("Invalid class");
  }

  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(
    `https://www.dnd5eapi.co/api/classes/${className}`,
    requestOptions
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch class");
  }
}
