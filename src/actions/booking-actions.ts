"use server";

import { z } from "zod";
import { getAuthComplex } from "@/lib/supabase/server";
import { BookingService } from "@/lib/services/booking-service";
import { 
  createBookingSchema, 
  blockSlotSchema,
  createOnlineBookingSchema
} from "@/lib/validations/booking";
import type { ActionResult, BookingWithRelations } from "@/lib/types";

export async function createBookingAction(
  input: z.infer<typeof createBookingSchema>
): Promise<ActionResult<BookingWithRelations>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) {
      return { success: false, error: "No autorizado" };
    }

    const validatedData = createBookingSchema.parse(input);

    const booking = await BookingService.createBooking(
      {
        id: complex.id,
        depositEnabled: complex.depositEnabled,
        depositType: complex.depositType,
        depositValue: complex.depositValue,
      },
      validatedData
    );

    return { success: true, data: booking };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos de reserva inválidos" };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error interno al crear reserva" };
  }
}

export async function createOnlineBookingAction(
  input: z.infer<typeof createOnlineBookingSchema>
): Promise<ActionResult<{ id: string, checkoutUrl?: string }>> {
  try {
    const validatedData = createOnlineBookingSchema.parse(input);

    const { booking, checkoutUrl } = await BookingService.createOnlineBooking(
      validatedData.complexId,
      {
        courtId: validatedData.courtId,
        bookingDate: validatedData.bookingDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        depositPaid: false,
        source: "online",
        notes: "",
      }
    );

    return { success: true, data: { id: booking.id, checkoutUrl } };
  } catch (error) {
    if (error instanceof z.ZodError) {
       return { success: false, error: "Datos del formulario inválidos" };
    }
    if (error instanceof Error) {
       return { success: false, error: error.message };
    }
    return { success: false, error: "Error al generar tu reserva. Intentá de nuevo." };
  }
}

export async function blockSlotAction(
  input: z.infer<typeof blockSlotSchema>
): Promise<ActionResult<BookingWithRelations>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) {
      return { success: false, error: "No autorizado" };
    }

    const validatedData = blockSlotSchema.parse(input);

    const blocked = await BookingService.blockSlot(
      complex.id,
      validatedData
    );

    return { success: true, data: blocked };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos de bloqueo inválidos" };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error interno al bloquear horario" };
  }
}

export async function markDepositPaidAction(input: { bookingId: string }): Promise<ActionResult<BookingWithRelations>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };
    const booking = await BookingService.markDepositPaid(complex.id, input.bookingId);
    return { success: true, data: booking };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al actualizar seña" };
  }
}

export async function collectBookingAction(input: { bookingId: string, amount: number, paymentMethod: string }): Promise<ActionResult<BookingWithRelations>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };
    const booking = await BookingService.collectBooking(complex.id, input.bookingId, input.amount, input.paymentMethod);
    return { success: true, data: booking };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al cobrar reserva" };
  }
}

export async function cancelBookingAction(input: { bookingId: string }): Promise<ActionResult<BookingWithRelations>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };
    const booking = await BookingService.cancelBooking(complex.id, input.bookingId);
    return { success: true, data: booking };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al cancelar reserva" };
  }
}

export async function noShowAction(input: { bookingId: string }): Promise<ActionResult<BookingWithRelations>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };
    const booking = await BookingService.markNoShow(complex.id, input.bookingId);
    return { success: true, data: booking };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al marcar cliente" };
  }
}

export async function unlockSlotAction(input: { bookingId: string }): Promise<ActionResult<boolean>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };
    await BookingService.unlockSlot(complex.id, input.bookingId);
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al desbloquear el slot" };
  }
}
