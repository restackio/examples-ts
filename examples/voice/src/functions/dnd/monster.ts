import { z } from "zod";

export const monsterSchema = z.object({
  challengeRating: z
    .number()
    .optional()
    .describe("The challenge rating of the monster"),
  monsterIndex: z.string().optional().describe("The index of the monster"),
});

export type MonsterInput = z.infer<typeof monsterSchema>;

export async function dndMonster({
  challengeRating,
  monsterIndex,
}: MonsterInput) {
  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  if (monsterIndex) {
    const response = await fetch(
      `https://www.dnd5eapi.co/api/monsters/${monsterIndex}`,
      requestOptions
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Failed to fetch monster");
    }
  }
  if (challengeRating) {
    const response = await fetch(
      `https://www.dnd5eapi.co/api/monsters?challenge_rating=${challengeRating}`,
      requestOptions
    );

    if (response.ok) {
      const data = await response.json();
      if (data.results.length === 0) {
        throw new Error("No monsters found for the given challenge rating");
      }
      const randomMonster =
        data.results[Math.floor(Math.random() * data.results.length)];
      return dndMonster({ monsterIndex: randomMonster.index });
    } else {
      throw new Error("Failed to fetch monsters list");
    }
  }
  throw new Error("Either challengeRating or monsterIndex must be provided");
}
