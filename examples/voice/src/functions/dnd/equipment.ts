import { z } from "zod";

export const equipmentSchema = z.object({
  equipmentIndex: z.string().describe("The equipment index"),
});
export type EquipmentInput = z.infer<typeof equipmentSchema>;

export async function dndEquipment({ equipmentIndex }: EquipmentInput) {
  if (!equipmentIndex) {
    throw new Error("Invalid equipment");
  }

  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(
    `https://www.dnd5eapi.co/api/equipment/${equipmentIndex}`,
    requestOptions
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch race");
  }
}
