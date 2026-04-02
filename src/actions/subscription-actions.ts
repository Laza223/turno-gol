"use server";

import { getAuthComplex } from "@/lib/supabase/server";
import { SaasSubscriptionService } from "@/lib/services/saas-subscription-service";
import type { ActionResult } from "@/lib/types";

export async function generateSubscriptionAction(planType: "cancha" | "complejo"): Promise<ActionResult<string>> {
  try {
     const complex = await getAuthComplex();
     if (!complex) return { success: false, error: "No autorizado" };

     const url = await SaasSubscriptionService.createSubscriptionLink(complex.id, planType);
     return { success: true, data: url };
  } catch (err: any) {
     return { success: false, error: err.message || "Error al construir suscripción en MP" };
  }
}
