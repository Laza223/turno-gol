import { z } from "zod";

export const createPaymentSchema = z.object({
  bookingId: z.string().uuid("Reserva inválida"),
  type: z.enum(["deposit", "booking_payment", "refund"], {
    message: "Tipo de pago inválido",
  }),
  amount: z
    .number()
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser mayor a 0"),
  paymentMethod: z.enum(
    ["cash", "transfer", "mercadopago", "debit", "credit"],
    { message: "Método de pago inválido" }
  ),
  description: z
    .string()
    .max(200, "La descripción es demasiado larga")
    .optional(),
});

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;
