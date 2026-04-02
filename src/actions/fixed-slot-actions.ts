"use server";

import { z } from "zod";
import { getAuthComplex } from "@/lib/supabase/server";
import { FixedSlotService } from "@/lib/services/fixed-slot-service";
import { createFixedSlotSchema } from "@/lib/validations/fixed-slot";
import type { ActionResult } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function createFixedSlotAction(
  input: z.infer<typeof createFixedSlotSchema>
): Promise<ActionResult<{ fixedSlotId: string; generatedCount: number }>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };

    const valid = createFixedSlotSchema.parse(input);
    const { fixedSlot, countGenerated } = await FixedSlotService.createFixedSlot(complex.id, valid);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/fixed-slots");

    return { 
       success: true, 
       data: { fixedSlotId: fixedSlot.id, generatedCount: countGenerated } 
    };
  } catch (err: any) {
    if (err instanceof z.ZodError) return { success: false, error: "Datos del formulario inválidos" };
    return { success: false, error: err.message || "Error al crear turno fijo" };
  }
}

export async function pauseFixedSlotAction(input: { id: string }): Promise<ActionResult<boolean>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };
    await FixedSlotService.pauseStatus(complex.id, input.id);
    revalidatePath("/dashboard/fixed-slots");
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reactivateFixedSlotAction(input: { id: string }): Promise<ActionResult<boolean>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };
    await FixedSlotService.reactivateStatus(complex.id, input.id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/fixed-slots");
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cancelFixedSlotAction(input: { id: string }): Promise<ActionResult<boolean>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };
    await FixedSlotService.cancelFixedSlot(complex.id, input.id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/fixed-slots");
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
