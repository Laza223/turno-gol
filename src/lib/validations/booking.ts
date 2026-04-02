import { z } from "zod";

export const createBookingSchema = z.object({
  courtId: z.string().uuid("Cancha inválida"),
  customerName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  customerPhone: z
    .string()
    .min(8, "Teléfono inválido")
    .max(20, "Teléfono inválido")
    .regex(/^[\d\s\-+()]+$/, "Teléfono inválido"),
  bookingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  depositPaid: z.boolean().default(false),
  source: z.enum(["manual", "online", "phone"]).default("manual"),
  notes: z.string().max(500, "Las notas son demasiado largas").optional(),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;

export const blockSlotSchema = z.object({
  courtId: z.string().uuid("Cancha inválida"),
  bookingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  blockNote: z
    .string()
    .max(200, "El motivo es demasiado largo")
    .optional(),
});

export type BlockSlotSchema = z.infer<typeof blockSlotSchema>;

export const collectBookingSchema = z.object({
  bookingId: z.string().uuid("Reserva inválida"),
  paymentMethod: z.enum(
    ["cash", "transfer", "mercadopago", "debit", "credit"],
    { message: "Método de pago inválido" }
  ),
  amount: z
    .number()
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser mayor a 0"),
});

export type CollectBookingSchema = z.infer<typeof collectBookingSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid("Reserva inválida"),
});

export type CancelBookingSchema = z.infer<typeof cancelBookingSchema>;
