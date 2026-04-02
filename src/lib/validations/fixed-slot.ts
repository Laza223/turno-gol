import { z } from "zod";

export const createFixedSlotSchema = z.object({
  courtId: z.string().uuid("Cancha inválida"),
  customerName: z.string().min(2, "Nombre inválido"),
  customerPhone: z.string().min(8, "Teléfono inválido"),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
});

export type CreateFixedSlotSchema = z.infer<typeof createFixedSlotSchema>;
