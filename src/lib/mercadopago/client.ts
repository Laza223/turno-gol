export class MercadoPagoClient {
   /**
    * Crea una "Preference" de MercadoPago a nombre de la cuenta del Complejo.
    * Devuelve el InitPoint (URL de pago) donde el cliente debe redirigirse.
    * Uses raw fetch to avoid importing heavy MercadoPago SDK adhering to project rules.
    */
   static async createCheckoutPreference(
      complexAccessToken: string, 
      booking: any, 
      depositAmount: number,
      customerData: { name: string, phone: string },
      courtName: string,
      appUrl: string,
      slug: string
   ): Promise<string> {
      
      const payload = {
         items: [{
            id: booking.id,
            title: `Seña - ${courtName} - ${booking.bookingDate}`,
            description: `Hora: ${booking.startTime}`,
            quantity: 1,
            currency_id: "ARS",
            unit_price: depositAmount
         }],
         payer: {
            name: customerData.name,
            phone: { area_code: "", number: customerData.phone }
         },
         external_reference: booking.id,
         back_urls: {
            success: `${appUrl}/${slug}/book/success?status=approved&booking=${booking.id}`,
            pending: `${appUrl}/${slug}/book/success?status=pending&booking=${booking.id}`,
            failure: `${appUrl}/${slug}/book/success?status=failure`
         },
         auto_return: "approved",
         notification_url: `${appUrl}/api/webhooks/mercadopago?complexId=${booking.complexId}`
      };

      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${complexAccessToken}`
         },
         body: JSON.stringify(payload)
      });

      if (!res.ok) {
         throw new Error("No se pudo crear la preferencia de pago en MercadoPago");
      }

      const data = await res.json();
      return data.init_point;
   }
}
