import { z } from "zod";

const validSkill = [
  "acrobatics",
  "animal-handling",
  "arcana",
  "athletics",
  "deception",
  "history",
  "insight",
  "intimidation",
  "investigation",
  "medicine",
  "nature",
  "perception",
  "performance",
  "persuasion",
  "religion",
  "sleight-of-hand",
  "stealth",
  "survival",
] as const;

export const skillSchema = z.object({
  skill: z.enum(validSkill).describe("The character skill"),
});

export type SkillInput = z.infer<typeof skillSchema>;

export async function dndSkill({ skill: skillName }: SkillInput) {
  if (!validSkill.includes(skillName)) {
    throw new Error("Invalid skill");
  }

  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(
    `https://www.dnd5eapi.co/api/skills/${skillName}`,
    requestOptions
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch skill");
  }
}
