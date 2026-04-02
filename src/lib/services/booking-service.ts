import { prisma } from "@/lib/prisma";
import { CreateBookingInput, BlockSlotInput, BookingWithRelations } from "@/lib/types";
import { getCourtPrice } from "@/lib/utils/pricing";

interface ComplexBookingContext {
  id: string;
  depositEnabled: boolean;
  depositType: string | null;
  depositValue: number | null;
}

export class BookingService {
  /**
   * Crear una reserva manual
   */
  static async createBooking(
    complex: ComplexBookingContext,
    input: CreateBookingInput
  ): Promise<BookingWithRelations> {
    // 1. Validar que el slot no está ocupado
    const existing = await prisma.booking.findFirst({
      where: {
        courtId: input.courtId,
        bookingDate: input.bookingDate,
        status: { notIn: ["cancelled", "no_show"] },
        OR: [
          {
            startTime: { lt: input.endTime },
            endTime: { gt: input.startTime },
          },
        ],
      },
    });

    if (existing) {
      throw new Error("Este horario ya está reservado");
    }

    // 2. Obtener la cancha para calcular precios
    const court = await prisma.court.findUnique({
      where: { id: input.courtId },
    });

    if (!court) {
      throw new Error("Cancha no encontrada");
    }

    // 3. Buscar o crear cliente por teléfono
    const normalizedPhone = input.customerPhone.replace(/\D/g, "");
    let customer = await prisma.customer.findFirst({
      where: {
        complexId: complex.id,
        phone: { contains: normalizedPhone },
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          complexId: complex.id,
          name: input.customerName,
          phone: input.customerPhone,
        },
      });
    }

    // 4. Calcular precios
    const price = getCourtPrice(court, input.bookingDate);
    
    let depositAmount: number | null = null;
    if (complex.depositEnabled && input.depositPaid) {
      if (complex.depositType === "percentage" && complex.depositValue) {
        depositAmount = Math.round((price * complex.depositValue) / 100);
      } else if (complex.depositType === "fixed" && complex.depositValue) {
        depositAmount = complex.depositValue;
      }
    }

    // 5. Transacción para crear reserva, pago inicial (si aplica) y stats
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          complexId: complex.id,
          courtId: input.courtId,
          customerId: customer.id,
          bookingDate: input.bookingDate,
          startTime: input.startTime,
          endTime: input.endTime,
          status: "confirmed",
          source: input.source,
          price,
          depositAmount,
          depositPaid: input.depositPaid,
          isPaid: false,
          notes: input.notes,
        },
        include: { court: true, customer: true },
      });

      if (input.depositPaid && depositAmount) {
        await tx.payment.create({
          data: {
            complexId: complex.id,
            bookingId: booking.id,
            type: "deposit",
            amount: depositAmount,
            paymentMethod: "cash", // Señas manuales por defecto en efectivo (o MP después)
            description: "Seña de reserva manual",
            paymentDate: input.bookingDate,
            paymentTime: input.startTime,
          },
        });
      }

      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalBookings: { increment: 1 },
          lastBookingDate: input.bookingDate,
        },
      });

      await tx.activityLog.create({
        data: {
          complexId: complex.id,
          action: "booking_created",
          entityType: "booking",
          entityId: booking.id,
          details: { description: `Reserva manual creada para ${customer.name}` },
        },
      });

      return booking as unknown as BookingWithRelations;
    });
  }

  /**
   * Crear reserva Online (Pública)
   */
  static async createOnlineBooking(
    complexId: string,
    input: CreateBookingInput
  ): Promise<{ booking: BookingWithRelations, checkoutUrl?: string }> {
    // 1. Validar ocupación
    const existing = await prisma.booking.findFirst({
      where: {
        courtId: input.courtId,
        bookingDate: input.bookingDate,
        status: { notIn: ["cancelled", "no_show"] },
        OR: [
          {
            startTime: { lt: input.endTime },
            endTime: { gt: input.startTime },
          },
        ],
      },
    });

    if (existing) {
      throw new Error("Este horario ya no está disponible.");
    }

    const complex = await prisma.complex.findUnique({ where: { id: complexId } });
    if (!complex) throw new Error("Complejo no encontrado");

    // 2. Control de Cliente Bloqueado
    const normalizedPhone = input.customerPhone.replace(/\D/g, "");
    let customer = await prisma.customer.findFirst({
      where: {
        complexId,
        phone: { contains: normalizedPhone },
      },
    });

    if (customer && customer.isBlocked) {
       // Mensaje genérico para no dar detalles
       throw new Error("No se pudo procesar tu reserva. Contactá al complejo.");
    }

    const court = await prisma.court.findUnique({
      where: { id: input.courtId },
    });

    if (!court) throw new Error("Cancha no encontrada");
    const price = getCourtPrice(court, input.bookingDate);

    const finalBooking = await prisma.$transaction(async (tx) => {
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            complexId,
            name: input.customerName,
            phone: input.customerPhone,
          },
        });
      }

      const booking = await tx.booking.create({
        data: {
          complexId,
          courtId: input.courtId,
          customerId: customer.id,
          bookingDate: input.bookingDate,
          startTime: input.startTime,
          endTime: input.endTime,
          status: "confirmed",
          source: "online", // Always online
          price,
          depositPaid: false, // MP se implementará después
          isPaid: false,
        },
        include: { court: true, customer: true },
      });

      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalBookings: { increment: 1 },
          lastBookingDate: input.bookingDate,
        },
      });

      await tx.activityLog.create({
        data: {
          complexId,
          action: "booking_created",
          entityType: "booking",
          entityId: booking.id,
          details: { description: `Reserva online creada web para ${customer.name}` },
        },
      });

      return booking as unknown as BookingWithRelations;
    });

    let checkoutUrl;

    if (complex.depositEnabled && complex.mpConnected && complex.mpAccessToken) {
       // Refresh token safely if expires
       await import("@/lib/mercadopago/oauth").then(v => v.MercadoPagoOAuth.refreshAccessToken(complex as any));

       let depositAmount;
       if (complex.depositType === "percentage" && complex.depositValue) {
         depositAmount = Math.round((price * complex.depositValue) / 100);
       } else if (complex.depositType === "fixed" && complex.depositValue) {
         depositAmount = complex.depositValue;
       }

       if (depositAmount) {
         const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
         const mpClient = await import("@/lib/mercadopago/client").then(v => v.MercadoPagoClient);
         checkoutUrl = await mpClient.createCheckoutPreference(
            complex.mpAccessToken,
            finalBooking as any,
            depositAmount,
            { name: input.customerName, phone: input.customerPhone },
            court.name,
            appUrl,
            complex.slug
         );
       }
    }

    return { booking: finalBooking, checkoutUrl };
  }

  /**
   * Bloquear un slot horario
   */
  static async blockSlot(
    complexId: string,
    input: BlockSlotInput
  ): Promise<BookingWithRelations> {
    const existing = await prisma.booking.findFirst({
      where: {
        courtId: input.courtId,
        bookingDate: input.bookingDate,
        status: { notIn: ["cancelled", "no_show"] },
        OR: [
          {
            startTime: { lt: input.endTime },
            endTime: { gt: input.startTime },
          },
        ],
      },
    });

    if (existing) {
      throw new Error("Este horario ya tiene una reserva o bloqueo.");
    }

    const blocked = await prisma.booking.create({
      data: {
        complexId,
        courtId: input.courtId,
        bookingDate: input.bookingDate,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "blocked",
        source: "manual", // Default
        price: 0,
        depositPaid: false,
        isPaid: false,
        blockNote: input.blockNote,
      },
      include: { court: true, customer: true },
    });

    await prisma.activityLog.create({
      data: {
        complexId,
        action: "slot_blocked",
        entityType: "booking",
        entityId: blocked.id,
        details: { description: `Horario bloqueado: ${input.blockNote}` },
      },
    });

    return blocked as unknown as BookingWithRelations;
  }

  /**
   * Marcar seña pagada manualmente (si quedó pendiente)
   */
  static async markDepositPaid(
    complexId: string,
    bookingId: string
  ): Promise<BookingWithRelations> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, court: true }
    });

    if (!booking || booking.complexId !== complexId) {
      throw new Error("Reserva no encontrada");
    }
    if (booking.depositPaid) {
      throw new Error("La seña ya está pagada");
    }

    const complex = await prisma.complex.findUnique({
      where: { id: complexId },
      select: { depositType: true, depositValue: true }
    });

    let depositAmount = booking.depositAmount;
    if (!depositAmount && complex) {
       if (complex.depositType === "percentage" && complex.depositValue) {
         depositAmount = Math.round((booking.price * complex.depositValue) / 100);
       } else if (complex.depositType === "fixed" && complex.depositValue) {
         depositAmount = complex.depositValue;
       }
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { depositPaid: true, depositAmount },
        include: { court: true, customer: true }
      });

      if (depositAmount) {
        await tx.payment.create({
          data: {
            complexId,
            bookingId,
            customerId: booking.customerId,
            type: "deposit",
            amount: depositAmount,
            paymentMethod: "cash",
            description: "Adelanto de seña registrado",
            paymentDate: booking.bookingDate,
            paymentTime: booking.startTime,
          }
        });
      }

      await tx.activityLog.create({
        data: {
          complexId,
          action: "deposit_paid",
          entityType: "booking",
          entityId: bookingId,
          details: { description: "Se marcó la seña como pagada." }
        }
      });

      return updated as unknown as BookingWithRelations;
    });
  }

  /**
   * Cobrar turno completo y cerrarlo
   */
  static async collectBooking(
    complexId: string,
    bookingId: string,
    amount: number,
    paymentMethod: string
  ): Promise<BookingWithRelations> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true }
    });

    if (!booking || booking.complexId !== complexId) {
      throw new Error("Reserva no encontrada");
    }
    if (booking.status === "completed") {
      throw new Error("El turno ya está cobrado y completado");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "completed",
          isPaid: true,
          completedAt: new Date(),
        },
        include: { court: true, customer: true }
      });

      await tx.payment.create({
        data: {
          complexId,
          bookingId,
          customerId: booking.customerId,
          type: "booking_payment",
          amount,
          paymentMethod,
          description: "Cobro de turno completo",
          paymentDate: booking.bookingDate,
          paymentTime: booking.startTime,
        }
      });

      await tx.activityLog.create({
        data: {
          complexId,
          action: "booking_collected",
          entityType: "booking",
          entityId: bookingId,
          details: { description: `Cobro de ${amount} por ${paymentMethod}` }
        }
      });

      return updated as unknown as BookingWithRelations;
    });
  }

  /**
   * Cancelar reserva
   */
  static async cancelBooking(
    complexId: string,
    bookingId: string
  ): Promise<BookingWithRelations> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true }
    });

    if (!booking || booking.complexId !== complexId) {
      throw new Error("Reserva no encontrada");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
        include: { court: true, customer: true }
      });

      if (booking.customerId) {
        await tx.customer.update({
          where: { id: booking.customerId },
          data: { totalCancellations: { increment: 1 } }
        });
      }

      await tx.activityLog.create({
        data: {
          complexId,
          action: "booking_cancelled",
          entityType: "booking",
          entityId: bookingId,
          details: { description: "Reserva cancelada manualmente" }
        }
      });

      return updated as unknown as BookingWithRelations;
    });
  }

  /**
   * Marcar como No Show
   */
  static async markNoShow(
    complexId: string,
    bookingId: string
  ): Promise<BookingWithRelations> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.complexId !== complexId) {
      throw new Error("Reserva no encontrada");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "no_show" },
        include: { court: true, customer: true }
      });

      if (booking.customerId) {
        await tx.customer.update({
          where: { id: booking.customerId },
          data: { totalNoShows: { increment: 1 } }
        });
      }

      await tx.activityLog.create({
        data: {
          complexId,
          action: "booking_no_show",
          entityType: "booking",
          entityId: bookingId,
          details: { description: "Cliente no se presentó" }
        }
      });

      return updated as unknown as BookingWithRelations;
    });
  }

  /**
   * Desbloquear un slot
   */
  static async unlockSlot(
    complexId: string,
    bookingId: string
  ): Promise<boolean> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.complexId !== complexId || booking.status !== "blocked") {
      throw new Error("Bloqueo no encontrado");
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    });

    await prisma.activityLog.create({
      data: {
        complexId,
        action: "slot_unblocked",
        entityType: "booking",
        entityId: bookingId,
        details: { description: "Horario desbloqueado manualmente" }
      }
    });

    return true;
  }
}
