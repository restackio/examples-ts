import { z } from "zod";

const validRace = [
  "dragonborn",
  "dwarf",
  "elf",
  "gnome",
  "half-elf",
  "half-orc",
  "halfling",
  "human",
  "tiefling",
] as const;

export const raceSchema = z.object({
  race: z.enum(validRace).describe("The character race"),
});
export type RaceInput = z.infer<typeof raceSchema>;

export async function dndRace({ race: raceName }: RaceInput) {
  if (!validRace.includes(raceName)) {
    throw new Error("Invalid race");
  }

  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(
    `https://www.dnd5eapi.co/api/races/${raceName}`,
    requestOptions
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch race");
  }
}
