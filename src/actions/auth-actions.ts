"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/complex";
import { generateSlug } from "@/lib/utils/slug";
import { WA_TEMPLATES } from "@/lib/constants/wa-templates";
import type { ActionResult } from "@/lib/types";
import { addDays } from "date-fns";

// ==========================================
// Login
// ==========================================

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export async function loginAction(
  input: z.infer<typeof loginSchema>
): Promise<ActionResult> {
  try {
    const validated = loginSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { success: false, error: "Email o contraseña incorrectos." };
      }
      return { success: false, error: "Error al iniciar sesión. Intentá de nuevo." };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos." };
    }
    return { success: false, error: "Error inesperado. Intentá de nuevo." };
  }

  // Verificar si completó onboarding para decidir redirect
  redirect("/dashboard");
}

// ==========================================
// Register
// ==========================================

export async function registerAction(
  input: z.infer<typeof registerSchema>
): Promise<ActionResult> {
  try {
    const validated = registerSchema.parse(input);
    const supabase = await createClient();

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          onboarding_complete: false,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { success: false, error: "Este email ya está registrado." };
      }
      return { success: false, error: "No se pudo crear la cuenta. Intentá de nuevo." };
    }

    if (!authData.user) {
      return { success: false, error: "Error al crear el usuario." };
    }

    // Generar slug único
    let slug = generateSlug(validated.complexName);
    const existingSlug = await prisma.complex.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    // Crear Complex en DB con defaults
    await prisma.complex.create({
      data: {
        email: validated.email,
        name: validated.complexName,
        slug,
        subscriptionPlan: "trial",
        subscriptionStatus: "active",
        trialEndsAt: addDays(new Date(), 14),
        onboardingStep: 0,
        onboardingComplete: false,
        waTemplateConfirmation: WA_TEMPLATES.confirmation,
        waTemplateDeposit: WA_TEMPLATES.deposit,
        waTemplateReminder: WA_TEMPLATES.reminder,
        waTemplateCancellation: WA_TEMPLATES.cancellation,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos. Revisá los campos." };
    }
    return { success: false, error: "Error inesperado al crear la cuenta." };
  }

  redirect("/onboarding");
}

// ==========================================
// Logout
// ==========================================

export async function logoutAction(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: "Error al cerrar sesión." };
    }
  } catch {
    return { success: false, error: "Error inesperado." };
  }

  redirect("/login");
}
