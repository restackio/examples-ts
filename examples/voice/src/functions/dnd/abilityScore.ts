import { z } from "zod";

const validAbilityScore = ["cha", "con", "dex", "int", "str", "wis"] as const;

export const abilityScoreSchema = z.object({
  abilityScore: z.enum(validAbilityScore).describe("The ability score"),
});

export type AbilityInput = z.infer<typeof abilityScoreSchema>;

export async function dndAbilityScore({
  abilityScore: abilityScore,
}: AbilityInput) {
  if (!validAbilityScore.includes(abilityScore)) {
    throw new Error("Invalid ability score");
  }

  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(
    `https://www.dnd5eapi.co/api/ability-scores/${abilityScore}`,
    requestOptions
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch ability score");
  }
}
