"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthComplex } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingComplexSchema,
  onboardingScheduleSchema,
  onboardingDepositSchema,
  onboardingCancellationSchema,
  onboardingPinSchema,
} from "@/lib/validations/complex";
import { createCourtSchema } from "@/lib/validations/court";
import { hashPin } from "@/lib/utils/pin";
import type { ActionResult } from "@/lib/types";

// ==========================================
// Helper: verificar auth y retornar complex
// ==========================================

async function requireComplex() {
  const complex = await getAuthComplex();
  if (!complex) throw new Error("unauthorized");
  return complex;
}

// ==========================================
// Step 1: Datos del complejo
// ==========================================

export async function saveOnboardingComplex(
  input: z.infer<typeof onboardingComplexSchema>
): Promise<ActionResult> {
  try {
    const complex = await requireComplex();
    const validated = onboardingComplexSchema.parse(input);

    await prisma.complex.update({
      where: { id: complex.id },
      data: {
        address: validated.address,
        phone: validated.phone,
        openTime: validated.openTime,
        closeTime: validated.closeTime,
        onboardingStep: Math.max(complex.onboardingStep, 1),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos. Revisá los campos." };
    }
    return { success: false, error: "Error al guardar los datos del complejo." };
  }
}

// ==========================================
// Step 1 extra: Upload logo
// ==========================================

export async function uploadLogo(
  formData: FormData
): Promise<ActionResult<string>> {
  try {
    const complex = await requireComplex();
    const file = formData.get("logo") as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: "No se seleccionó ningún archivo." };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "El archivo no puede superar 2MB." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "El archivo debe ser una imagen." };
    }

    const supabase = await createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `logos/${complex.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("complex-assets")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      return { success: false, error: "Error al subir el logo." };
    }

    const { data: urlData } = supabase.storage
      .from("complex-assets")
      .getPublicUrl(path);

    await prisma.complex.update({
      where: { id: complex.id },
      data: { logoUrl: urlData.publicUrl },
    });

    return { success: true, data: urlData.publicUrl };
  } catch {
    return { success: false, error: "Error inesperado al subir el logo." };
  }
}

// ==========================================
// Step 2: Canchas
// ==========================================

export async function addCourt(
  input: z.infer<typeof createCourtSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const complex = await requireComplex();
    const validated = createCourtSchema.parse(input);

    const courtCount = await prisma.court.count({
      where: { complexId: complex.id },
    });

    const court = await prisma.court.create({
      data: {
        complexId: complex.id,
        name: validated.name,
        playerCount: validated.playerCount,
        surface: validated.surface,
        isRoofed: validated.isRoofed,
        price: validated.price,
        priceWeekend: validated.priceWeekend,
        sortOrder: courtCount + 1,
      },
    });

    return { success: true, data: { id: court.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos de cancha inválidos." };
    }
    return { success: false, error: "Error al crear la cancha." };
  }
}

export async function deleteCourt(
  courtId: string
): Promise<ActionResult> {
  try {
    const complex = await requireComplex();

    await prisma.court.deleteMany({
      where: { id: courtId, complexId: complex.id },
    });

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al eliminar la cancha." };
  }
}

export async function saveCourtsStep(): Promise<ActionResult> {
  try {
    const complex = await requireComplex();

    const courtCount = await prisma.court.count({
      where: { complexId: complex.id, isActive: true },
    });

    if (courtCount === 0) {
      return { success: false, error: "Agregá al menos una cancha para continuar." };
    }

    await prisma.complex.update({
      where: { id: complex.id },
      data: { onboardingStep: Math.max(complex.onboardingStep, 2) },
    });

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al guardar." };
  }
}

// ==========================================
// Step 3: Horarios
// ==========================================

export async function saveOnboardingSchedule(
  input: z.infer<typeof onboardingScheduleSchema>
): Promise<ActionResult> {
  try {
    const complex = await requireComplex();
    const validated = onboardingScheduleSchema.parse(input);

    await prisma.complex.update({
      where: { id: complex.id },
      data: {
        slotStartMinute: validated.slotStartMinute,
        onboardingStep: Math.max(complex.onboardingStep, 3),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Seleccioná una opción válida." };
    }
    return { success: false, error: "Error al guardar los horarios." };
  }
}

// ==========================================
// Step 4: Señas
// ==========================================

export async function saveOnboardingDeposit(
  input: z.infer<typeof onboardingDepositSchema>
): Promise<ActionResult> {
  try {
    const complex = await requireComplex();
    const validated = onboardingDepositSchema.parse(input);

    await prisma.complex.update({
      where: { id: complex.id },
      data: {
        depositEnabled: validated.depositEnabled,
        depositType: validated.depositType,
        depositValue: validated.depositValue,
        transferAlias: validated.transferAlias,
        transferCbu: validated.transferCbu,
        onboardingStep: Math.max(complex.onboardingStep, 4),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos." };
    }
    return { success: false, error: "Error al guardar la configuración de señas." };
  }
}

// ==========================================
// Step 5: Cancelación
// ==========================================

export async function saveOnboardingCancellation(
  input: z.infer<typeof onboardingCancellationSchema>
): Promise<ActionResult> {
  try {
    const complex = await requireComplex();
    const validated = onboardingCancellationSchema.parse(input);

    await prisma.complex.update({
      where: { id: complex.id },
      data: {
        cancellationPolicy: validated.cancellationPolicy,
        cancellationHours: validated.cancellationHours,
        onboardingStep: Math.max(complex.onboardingStep, 5),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos." };
    }
    return { success: false, error: "Error al guardar la política de cancelación." };
  }
}

// ==========================================
// Step 6: PIN
// ==========================================

export async function saveOnboardingPin(
  input: z.infer<typeof onboardingPinSchema>
): Promise<ActionResult> {
  try {
    const complex = await requireComplex();
    const validated = onboardingPinSchema.parse(input);

    const hashed = await hashPin(validated.pin);

    await prisma.complex.update({
      where: { id: complex.id },
      data: {
        pinHash: hashed,
        onboardingStep: Math.max(complex.onboardingStep, 6),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "PIN inválido.",
      };
    }
    return { success: false, error: "Error al guardar el PIN." };
  }
}

// ==========================================
// Step 7: Completar onboarding
// ==========================================

export async function completeOnboarding(): Promise<ActionResult> {
  try {
    const complex = await requireComplex();

    await prisma.complex.update({
      where: { id: complex.id },
      data: {
        onboardingStep: 7,
        onboardingComplete: true,
      },
    });

    // Actualizar user_metadata en Supabase para que el middleware sepa
    const supabase = await createClient();
    await supabase.auth.updateUser({
      data: { onboarding_complete: true },
    });

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al completar el onboarding." };
  }
}
