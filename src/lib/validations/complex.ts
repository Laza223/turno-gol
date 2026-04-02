import { z } from "zod";

// ==========================================
// Registro
// ==========================================

export const registerSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email demasiado largo"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(72, "La contraseña es demasiado larga"),
  complexName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

// ==========================================
// Onboarding — Step 1: Datos del complejo
// ==========================================

export const onboardingComplexSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección es demasiado larga"),
  phone: z
    .string()
    .min(8, "Teléfono inválido")
    .max(20, "Teléfono inválido")
    .regex(/^[\d\s\-+()]+$/, "Teléfono inválido"),
  openTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  closeTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
});

export type OnboardingComplexSchema = z.infer<typeof onboardingComplexSchema>;

// ==========================================
// Onboarding — Step 3: Horarios
// ==========================================

export const onboardingScheduleSchema = z.object({
  slotStartMinute: z.union([z.literal(0), z.literal(15), z.literal(30)]),
});

export type OnboardingScheduleSchema = z.infer<typeof onboardingScheduleSchema>;

// ==========================================
// Onboarding — Step 4: Señas
// ==========================================

export const onboardingDepositSchema = z
  .object({
    depositEnabled: z.boolean(),
    depositType: z
      .enum(["percentage", "fixed"], {
        message: "Tipo de seña inválido",
      })
      .nullable()
      .default(null),
    depositValue: z
      .number()
      .int("Debe ser un número entero")
      .positive("Debe ser mayor a 0")
      .nullable()
      .default(null),
    transferAlias: z
      .string()
      .max(50, "Alias demasiado largo")
      .nullable()
      .default(null),
    transferCbu: z
      .string()
      .max(30, "CBU demasiado largo")
      .nullable()
      .default(null),
  })
  .refine(
    (data) => {
      if (data.depositEnabled) {
        return data.depositType !== null && data.depositValue !== null;
      }
      return true;
    },
    {
      message: "Si cobrás seña, completá el tipo y valor",
      path: ["depositType"],
    }
  );

export type OnboardingDepositSchema = z.infer<typeof onboardingDepositSchema>;

// ==========================================
// Onboarding — Step 5: Cancelación
// ==========================================

export const onboardingCancellationSchema = z
  .object({
    cancellationPolicy: z.enum(["lose", "refund"], {
      message: "Política inválida",
    }),
    cancellationHours: z
      .number()
      .int("Debe ser un número entero")
      .positive("Debe ser mayor a 0")
      .nullable()
      .default(null),
  })
  .refine(
    (data) => {
      if (data.cancellationPolicy === "refund") {
        return data.cancellationHours !== null;
      }
      return true;
    },
    {
      message: "Indicá las horas de anticipación",
      path: ["cancellationHours"],
    }
  );

export type OnboardingCancellationSchema = z.infer<
  typeof onboardingCancellationSchema
>;

// ==========================================
// Onboarding — Step 6: PIN
// ==========================================

export const onboardingPinSchema = z
  .object({
    pin: z
      .string()
      .min(4, "El PIN debe tener entre 4 y 6 dígitos")
      .max(6, "El PIN debe tener entre 4 y 6 dígitos")
      .regex(/^\d+$/, "El PIN debe contener solo números"),
    pinConfirmation: z.string(),
  })
  .refine((data) => data.pin === data.pinConfirmation, {
    message: "Los PINs no coinciden",
    path: ["pinConfirmation"],
  });

export type OnboardingPinSchema = z.infer<typeof onboardingPinSchema>;

// ==========================================
// Settings — General
// ==========================================

export const updateComplexSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo")
    .optional(),
  address: z.string().max(200).optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d\s\-+()]*$/, "Teléfono inválido")
    .optional(),
  depositEnabled: z.boolean().optional(),
  depositType: z
    .enum(["percentage", "fixed"])
    .nullable()
    .optional(),
  depositValue: z.number().int().positive().nullable().optional(),
  transferAlias: z.string().max(50).nullable().optional(),
  transferCbu: z.string().max(30).nullable().optional(),
  cancellationPolicy: z.enum(["lose", "refund"]).optional(),
  cancellationHours: z.number().int().positive().nullable().optional(),
  maxAdvanceDays: z.number().int().min(1).max(30).optional(),
});

export type UpdateComplexSchema = z.infer<typeof updateComplexSchema>;
