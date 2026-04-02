"use server";

import { getAuthComplex } from "@/lib/supabase/server";
import { ReportService } from "@/lib/services/report-service";
import type { ActionResult } from "@/lib/types";

export async function fetchBillingStatsAction(period: "today" | "week" | "month"): Promise<ActionResult<any>> {
   const complex = await getAuthComplex();
   if (!complex) return { success: false, error: "No autorizado" };
   const data = await ReportService.getBillingStats(complex.id, period);
   return { success: true, data };
}

export async function fetchOccupancyStatsAction(period: "today" | "week" | "month"): Promise<ActionResult<any>> {
   const complex = await getAuthComplex();
   if (!complex) return { success: false, error: "No autorizado" };
   const data = await ReportService.getOccupancyStats(complex.id, period);
   return { success: true, data };
}

export async function fetchOperationalStatsAction(period: "today" | "week" | "month"): Promise<ActionResult<any>> {
   const complex = await getAuthComplex();
   if (!complex) return { success: false, error: "No autorizado" };
   const data = await ReportService.getOperationalStats(complex.id, period);
   return { success: true, data };
}
