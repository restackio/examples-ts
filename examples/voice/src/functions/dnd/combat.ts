import { z } from "zod";
import { dndMonster } from "./monster";

export const combatSchema = z.object({
  character: z.object({
    class: z.string(),
    level: z.number(),
    hitPoints: z.number(),
    attackBonus: z.number(),
    damage: z.string(),
    armor_class: z.number(),
  }),
  monster: z.string(),
  characterAttackRoll: z.number(),
  monsterAttackRoll: z.number(),
});

export type CombatInput = z.infer<typeof combatSchema>;

export async function dndCombat({
  character,
  monster,
  characterAttackRoll,
  monsterAttackRoll,
}: CombatInput) {
  const monsterData = await dndMonster({ monsterIndex: monster });

  let characterHitPoints = character.hitPoints;
  let monsterHitPoints = monsterData.hit_points;

  if (characterAttackRoll >= monsterData.armor_class) {
    const damageRoll = eval(character.damage);
    monsterHitPoints -= damageRoll;
  }

  if (monsterAttackRoll >= character.armor_class) {
    const damageRoll = eval(monsterData.damage);
    characterHitPoints -= damageRoll;
  }

  return {
    character: {
      ...character,
      hitPoints: characterHitPoints,
    },
    monster: {
      name: monster,
      hitPoints: monsterHitPoints,
    },
  };
}
