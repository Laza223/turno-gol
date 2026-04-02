"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAuthComplex } from "@/lib/supabase/server";
import { SettingsService } from "@/lib/services/settings-service";
import type { ActionResult } from "@/lib/types";

const generalInfoSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  phone: z.string().min(8, "Mínimo 8 caracteres"),
  address: z.string().min(3, "Mínimo 3 caracteres"),
  openTime: z.string(),
  closeTime: z.string()
});

const financialsSchema = z.object({
  depositEnabled: z.boolean(),
  depositType: z.string().nullable().optional(),
  depositValue: z.number().nullable().optional(),
  transferAlias: z.string().nullable().optional(),
  transferCbu: z.string().nullable().optional()
});

const bookingRulesSchema = z.object({
  maxAdvanceDays: z.number().min(1).max(30),
  cancellationPolicy: z.enum(["loose", "strict", "none"]),
  cancellationHours: z.number().nullable().optional()
});

const whatsappSchema = z.object({
  waTemplateConfirmation: z.string().nullable(),
  waTemplateDeposit: z.string().nullable(),
  waTemplateReminder: z.string().nullable(),
  waTemplateCancellation: z.string().nullable()
});

const pinSchema = z.object({
  currentPin: z.string().length(4, "Debe tener 4 dígitos"),
  newPin: z.string().length(4, "Debe tener 4 dígitos")
});

export async function updateGeneralInfoAction(data: z.infer<typeof generalInfoSchema>): Promise<ActionResult<any>> {
  try {
    const session = await getAuthComplex();
    if (!session || !session.id) return { success: false, error: "No autorizado" };
    
    const parsed = generalInfoSchema.parse(data);
    await SettingsService.updateGeneralInfo(session.id, parsed);
    revalidatePath("/settings");
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFinancialsAction(data: z.infer<typeof financialsSchema>): Promise<ActionResult<any>> {
  try {
    const session = await getAuthComplex();
    if (!session || !session.id) return { success: false, error: "No autorizado" };
    
    const parsed = financialsSchema.parse(data);
    await SettingsService.updateFinancials(session.id, {
      depositEnabled: parsed.depositEnabled,
      depositType: parsed.depositType || null,
      depositValue: parsed.depositValue || null,
      transferAlias: parsed.transferAlias || null,
      transferCbu: parsed.transferCbu || null
    });
    revalidatePath("/settings");
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBookingRulesAction(data: z.infer<typeof bookingRulesSchema>): Promise<ActionResult<any>> {
  try {
    const session = await getAuthComplex();
    if (!session || !session.id) return { success: false, error: "No autorizado" };
    
    const parsed = bookingRulesSchema.parse(data);
    await SettingsService.updateBookingRules(session.id, {
       ...parsed,
       cancellationHours: parsed.cancellationHours || null
    });
    revalidatePath("/settings");
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWhatsappTemplatesAction(data: z.infer<typeof whatsappSchema>): Promise<ActionResult<any>> {
  try {
    const session = await getAuthComplex();
    if (!session || !session.id) return { success: false, error: "No autorizado" };
    
    const parsed = whatsappSchema.parse(data);
    await SettingsService.updateWhatsappTemplates(session.id, parsed);
    revalidatePath("/settings");
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePinAction(data: z.infer<typeof pinSchema>): Promise<ActionResult<any>> {
  try {
    const session = await getAuthComplex();
    if (!session || !session.id) return { success: false, error: "No autorizado" };
    
    const parsed = pinSchema.parse(data);
    await SettingsService.updatePin(session.id, parsed.currentPin, parsed.newPin);
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
