import { prisma } from "@/lib/prisma";

// Token provisto por el dueño del sistema, cobrador total del SaaS.
const SAAS_ACCESS_TOKEN = process.env.SAAS_MP_ACCESS_TOKEN || "";

export class SaasSubscriptionService {
  /**
   * Genera el Link de Pagaré Mensual.
   * La app redirigirá al cliente hacia MP, él aprueba el débito,
   * y sus status no se updatean hasta que MP no dispare el webhook.
   */
  static async createSubscriptionLink(complexId: string, planType: "cancha" | "complejo") {
     const complex = await prisma.complex.findUnique({
        where: { id: complexId }
     });

     if (!complex) throw new Error("Complejo no localizado.");
     
     // Costos definidos por el cliente en requerimientos o mock:
     // - Ej. Plan Único Completo: $47,900
     const amount = planType === "cancha" ? 22900 : 47900; 
     const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

     const payload = {
        reason: `TurnoGol - Plan ${planType.toUpperCase()}`,
        auto_recurring: {
           frequency: 1,
           frequency_type: "months",
           transaction_amount: amount,
           currency_id: "ARS"
        },
        back_url: `${appUrl}/dashboard/settings/subscription`,
        payer_email: complex.email,
        external_reference: complexId
     };

     const res = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${SAAS_ACCESS_TOKEN}`
        },
        body: JSON.stringify(payload)
     });

     if (!res.ok) {
        throw new Error("No se pudo conectar con MercadoPago SaaS API para generar el link de suscripción.");
     }

     const data = await res.json();
     return data.init_point;
  }
}
