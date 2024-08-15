import z from "zod";

export const rollDiceSchema = z.object({
  sides: z.number().describe("Number of sides on the dice"),
});

export type RollDiceInput = z.infer<typeof rollDiceSchema>;

export async function dndRoleDice({ sides }: RollDiceInput) {
  if (!sides) {
    throw new Error("Invalid sides");
  }

  return Math.floor(Math.random() * sides) + 1;
}
