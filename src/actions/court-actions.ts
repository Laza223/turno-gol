"use server";

import { z } from "zod";
import { getAuthComplex } from "@/lib/supabase/server";
import { CourtService } from "@/lib/services/court-service";
import { createCourtSchema, updateCourtSchema } from "@/lib/validations/court";
import type { ActionResult } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function createCourtAction(
  input: z.infer<typeof createCourtSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };

    const valid = createCourtSchema.parse(input);
    const result = await CourtService.createCourt(complex.id, valid);

    revalidatePath("/dashboard/courts");
    return { success: true, data: { id: result.id } };
  } catch (err: any) {
    if (err instanceof z.ZodError) return { success: false, error: "Datos del formulario inválidos" };
    return { success: false, error: err.message || "Error al crear cancha" };
  }
}

export async function updateCourtAction(
  courtId: string,
  input: z.infer<typeof createCourtSchema> // Same form structure
): Promise<ActionResult<{ id: string }>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };

    const valid = createCourtSchema.parse(input);
    const result = await CourtService.updateCourt(complex.id, courtId, valid);

    revalidatePath("/dashboard/courts");
    return { success: true, data: { id: result.id } };
  } catch (err: any) {
    if (err instanceof z.ZodError) return { success: false, error: "Datos del formulario inválidos" };
    return { success: false, error: err.message || "Error al actualizar cancha" };
  }
}

export async function toggleCourtActiveAction(
  input: { courtId: string, isActive: boolean }
): Promise<ActionResult<boolean>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };

    await CourtService.toggleActive(complex.id, input.courtId, input.isActive);

    revalidatePath("/dashboard/courts");
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al cambiar estado de la cancha" };
  }
}
