"use server";

import { getAuthComplex } from "@/lib/supabase/server";
import { MercadoPagoOAuth } from "@/lib/mercadopago/oauth";
import { revalidatePath } from "next/cache";

export async function generateMpAuthUrlAction() {
   return MercadoPagoOAuth.getAuthUrl();
}

export async function processMpCallbackAction(code: string) {
   try {
      const complex = await getAuthComplex();
      if (!complex) return { success: false, error: "No autorizado" };

      await MercadoPagoOAuth.exchangeCodeForTokens(code, complex.id);
      
      revalidatePath("/dashboard/settings/mercadopago");
      return { success: true };
   } catch (error: any) {
      return { success: false, error: error.message || "Error procesando el código de acceso" };
   }
}

export async function disconnectMpAction() {
   try {
      const complex = await getAuthComplex();
      if (!complex) return { success: false, error: "No autorizado" };

      await MercadoPagoOAuth.disconnectMercadoPago(complex.id);
      
      revalidatePath("/dashboard/settings/mercadopago");
      return { success: true };
   } catch (error: any) {
      return { success: false, error: "Error al desconectar MP" };
   }
}
