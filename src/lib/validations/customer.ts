import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  phone: z
    .string()
    .min(8, "Teléfono inválido")
    .max(20, "Teléfono inválido")
    .regex(/^[\d\s\-+()]+$/, "Teléfono inválido"),
});

export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;

export const blockCustomerSchema = z.object({
  customerId: z.string().uuid("Cliente inválido"),
  blockReason: z
    .string()
    .max(200, "El motivo es demasiado largo")
    .optional(),
});

export type BlockCustomerSchema = z.infer<typeof blockCustomerSchema>;

export const unblockCustomerSchema = z.object({
  customerId: z.string().uuid("Cliente inválido"),
});

export type UnblockCustomerSchema = z.infer<typeof unblockCustomerSchema>;
