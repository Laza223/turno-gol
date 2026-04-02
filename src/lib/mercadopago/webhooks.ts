import { prisma } from "@/lib/prisma";

export class MercadoPagoWebhooks {
  /**
   * Process incoming IPN / Webhooks from MercadoPago
   */
  static async processPaymentWebhook(complexId: string, paymentId: string) {
    const complex = await prisma.complex.findUnique({
      where: { id: complexId }
    });

    if (!complex || !complex.mpAccessToken) {
      throw new Error("Complejo no localizado o sin credenciales de MercadoPago activas.");
    }

    // Fetch genuine payment data from MP API to avoid payload spoofing
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
       headers: {
         "Authorization": `Bearer ${complex.mpAccessToken}`
       }
    });

    if (!res.ok) {
       throw new Error("No se pudo obtener la información de pago en MercadoPago");
    }

    const paymentData = await res.json();
    const status = paymentData.status; // 'approved', 'pending', etc.
    const externalReference = paymentData.external_reference; // our booking ID
    const amount = paymentData.transaction_amount;

    if (status === "approved" && externalReference) {
       const booking = await prisma.booking.findUnique({
          where: { id: externalReference }
       });

       if (!booking) return false;

       // Manejo de idempotencia: Si ya estaba pagada, no duplicates el pago log.
       if (booking.depositPaid) {
          return true;
       }

       await prisma.$transaction(async (tx) => {
          // Update booking status
          await tx.booking.update({
             where: { id: booking.id },
             data: { depositPaid: true, depositAmount: amount }
          });

          // Register payment
          await tx.payment.create({
             data: {
                complexId: booking.complexId,
                bookingId: booking.id,
                customerId: booking.customerId,
                type: "deposit",
                amount: amount,
                paymentMethod: "mercadopago",
                description: "Seña online abonada vía MercadoPago",
                paymentDate: booking.bookingDate,
                paymentTime: booking.startTime
             }
          });

          // Add Activity Log
          await tx.activityLog.create({
             data: {
                complexId: booking.complexId,
                action: "deposit_paid",
                entityType: "booking",
                entityId: booking.id,
                details: { description: `Checkout webhook aprobado: Seña de $${amount} depositada` }
             }
          });
       });

       return true;
    }
    
    return false;
  }
}
