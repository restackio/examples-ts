import { log } from "@restackio/restack-sdk-ts/function";
import { z } from "zod";

const validResources = [
  "ability-scores",
  "alignments",
  "backgrounds",
  "classes",
  "conditions",
  "damage-types",
  "equipment",
  "equipment-categories",
  "feats",
  "features",
  "languages",
  "magic-items",
  "magic-schools",
  "monsters",
  "proficiencies",
  "races",
  "rule-sections",
  "rules",
  "skills",
  "spells",
  "subclasses",
  "subraces",
  "traits",
  "weapon-properties",
] as const;

export const resourceSchema = z.object({
  resource: z.enum(validResources).describe("The resource"),
});

export type ResourceInput = z.infer<typeof resourceSchema>;

export async function dndResource({ resource }: ResourceInput) {
  if (!validResources.includes(resource)) {
    throw new Error("Invalid endpoint");
  }

  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(
    `https://www.dnd5eapi.co/api/${resource}`,
    requestOptions
  );

  log.info("response", { response });
  if (response.ok) {
    const data = response.body;
    log.info("response", { data });
    return data;
  } else {
    throw new Error("Failed to fetch resource");
  }
}
