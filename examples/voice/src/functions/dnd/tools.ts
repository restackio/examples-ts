import { zodFunction } from "openai/helpers/zod";
import { resourceSchema } from "./resource";
import { classSchema } from "./class";
import { raceSchema } from "./race";
import { abilityScoreSchema } from "./abilityScore";
import { skillSchema } from "./skill";
import { equipmentSchema } from "./equipment";
import { alignmentSchema } from "./alignement";
import { monsterSchema } from "./monster";
import { rollDiceSchema } from "./rollDice";
import { combatSchema } from "./combat";
import { ImageSchema } from "./image";

import { log } from "@restackio/restack-sdk-ts/function";

export async function dndTools() {
  try {
    return [
      zodFunction({
        name: "dndResource",
        description: "Get list of all available resources for an endpoint.",
        parameters: resourceSchema,
      }),
      zodFunction({
        name: "dndClass",
        description:
          "A character class is a fundamental part of the identity and nature of characters in the Dungeons & Dragons role-playing game. A character's capabilities, strengths, and weaknesses are largely defined by its class. A character's class affects a character's available skills and abilities.",
        parameters: classSchema,
      }),
      zodFunction({
        name: "dndRace",
        description:
          "Each race grants your character ability and skill bonuses as well as racial traits.",
        parameters: raceSchema,
      }),
      zodFunction({
        name: "dndAbilityScore",
        description:
          "Represents one of the six abilities that describes a creature's physical and mental characteristics. The three main rolls of the game - the ability check, the saving throw, and the attack roll - rely on the ability scores.",
        parameters: abilityScoreSchema,
      }),
      zodFunction({
        name: "dndSkill",
        description: "List and select skills for your character.",
        parameters: skillSchema,
      }),
      zodFunction({
        name: "dndEquipment",
        description: "List and select starting equipment for your character.",
        parameters: equipmentSchema,
      }),
      zodFunction({
        name: "dndAlignment",
        description: "Set and retrieve alignment for your character.",
        parameters: alignmentSchema,
      }),
      zodFunction({
        name: "dndMonster",
        description:
          "Retrieve information about a specific monster or search for monsters by challenge rating.",
        parameters: monsterSchema,
      }),
      zodFunction({
        name: "dndCombat",
        description: "Simulate a basic combat scenario against a monster.",
        parameters: combatSchema,
      }),
      zodFunction({
        name: "dndRoleDice",
        description: "Roll a dice with a specified number of sides.",
        parameters: rollDiceSchema,
      }),
      zodFunction({
        name: "dndImage",
        description: "Given a prompt, generate an image.",
        parameters: ImageSchema,
      }),
    ];
  } catch (error) {
    log.error("dndTools error:", { error });
    throw error;
  }
}
