import { prisma } from "@/lib/prisma";

export class CashRegisterService {
  /**
   * Generar los datos sumariados del tablero frontal de la Caja (No sensible profundo)
   */
  static async getDailySummary(complexId: string, targetDate: string) {
     const payments = await prisma.payment.findMany({
        where: { complexId, paymentDate: targetDate }
     });

     let totalCash = 0;
     let totalTransfer = 0;
     let totalMP = 0;
     let totalCard = 0;
     let depositCollected = 0;

     payments.forEach(p => {
        if (p.paymentMethod === "cash") totalCash += p.amount;
        if (p.paymentMethod === "transfer") totalTransfer += p.amount;
        if (p.paymentMethod === "mercadopago") totalMP += p.amount;
        if (p.paymentMethod === "debit" || p.paymentMethod === "credit" || p.paymentMethod === "card") totalCard += p.amount;

        if (p.type === "deposit") depositCollected += p.amount;
     });

     const bookings = await prisma.booking.findMany({
        where: { complexId, bookingDate: targetDate, status: { notIn: ["cancelled"] } }
     });

     let completedTurns = 0;
     let pendingToPay = 0;

     bookings.forEach(b => {
        if (b.status === "completed") completedTurns++;
        if (b.status !== "no_show" && b.isPaid === false) pendingToPay++;
     });

     return {
        total: totalCash + totalTransfer + totalMP + totalCard,
        breakdown: { cash: totalCash, transfer: totalTransfer, mp: totalMP, card: totalCard },
        stats: { completedTurns, depositCollected, pendingToPay }
     };
  }

  /**
   * Generar Lista Desglosada para la Bóveda Protegida
   */
  static async getDailyMovements(complexId: string, targetDate: string) {
     return await prisma.payment.findMany({
        where: { complexId, paymentDate: targetDate },
        orderBy: { createdAt: "desc" },
        include: { 
           customer: { select: { id: true, name: true, phone: true } },
           booking: { select: { id: true, startTime: true, court: { select: { name: true } } } }
        }
     });
  }
}
