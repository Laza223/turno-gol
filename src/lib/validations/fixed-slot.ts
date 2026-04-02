import { z } from "zod";

export const createFixedSlotSchema = z.object({
  courtId: z.string().uuid("Cancha inválida"),
  customerId: z.string().uuid("Cliente inválido"),
  dayOfWeek: z
    .number()
    .int("Día inválido")
    .min(0, "Día inválido")
    .max(6, "Día inválido"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
});

export type CreateFixedSlotSchema = z.infer<typeof createFixedSlotSchema>;

export const updateFixedSlotStatusSchema = z.object({
  fixedSlotId: z.string().uuid("Turno fijo inválido"),
  status: z.enum(["active", "paused", "cancelled"], {
    message: "Estado inválido",
  }),
});

export type UpdateFixedSlotStatusSchema = z.infer<
  typeof updateFixedSlotStatusSchema
>;
