import { z } from "zod";

export const createCourtSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre es demasiado largo"),
  playerCount: z
    .number()
    .int("Debe ser un número entero")
    .min(4, "Mínimo 4 jugadores")
    .max(22, "Máximo 22 jugadores"),
  surface: z.enum(["sintetico", "natural", "cemento"], {
    message: "Superficie inválida",
  }),
  isRoofed: z.boolean().default(false),
  price: z
    .number()
    .int("El precio debe ser un número entero")
    .positive("El precio debe ser mayor a 0"),
  priceWeekend: z
    .number()
    .int("El precio debe ser un número entero")
    .positive("El precio debe ser mayor a 0")
    .nullable()
    .default(null),
});

export type CreateCourtSchema = z.infer<typeof createCourtSchema>;

export const updateCourtSchema = createCourtSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateCourtSchema = z.infer<typeof updateCourtSchema>;
