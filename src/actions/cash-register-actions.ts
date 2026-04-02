"use server";

import { prisma } from "@/lib/prisma";
import { getAuthComplex } from "@/lib/supabase/server";
import { CashRegisterService } from "@/lib/services/cash-register-service";
import { verifyPin } from "@/lib/utils/pin";
import type { ActionResult } from "@/lib/types";

/**
 * Validar el PIN global del Complejo
 */
export async function validatePinAction(pinAttempt: string): Promise<ActionResult<boolean>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };

    const dbComplex = await prisma.complex.findUnique({ where: { id: complex.id } });
    if (!dbComplex) return { success: false, error: "No se encuentra el complejo" };

    if (!dbComplex.pinHash) {
       return { success: false, error: "No hay un código PIN configurado en tu Onboarding." };
    }

    // Verificar si está bajo estado de penalización (Lockout).
    if (dbComplex.pinLockedUntil && dbComplex.pinLockedUntil > new Date()) {
       const msLeft = dbComplex.pinLockedUntil.getTime() - new Date().getTime();
       const minsLeft = Math.ceil(msLeft / 60000);
       return { success: false, error: `Demasiados intentos fallidos. Bloqueado por ${minsLeft} minuto(s).` };
    }

    const isValid = await verifyPin(pinAttempt, dbComplex.pinHash);

    if (!isValid) {
       let attempts = dbComplex.pinFailedAttempts + 1;
       let lockDate = null;
       let errorMsg = "Código incorrecto.";

       if (attempts >= 5) {
          lockDate = new Date(new Date().getTime() + 5 * 60000); // 5 mins penalty
          attempts = 0;
          errorMsg = "Demasiados intentos. Bóveda bloqueada por 5 minutos.";
       } else {
          errorMsg = `Código incorrecto. Intento ${attempts}/5.`;
       }

       await prisma.complex.update({
          where: { id: dbComplex.id },
          data: { pinFailedAttempts: attempts, pinLockedUntil: lockDate }
       });

       return { success: false, error: errorMsg };
    }

    // PIN is correct, reset penalizations
    await prisma.complex.update({
       where: { id: dbComplex.id },
       data: { pinFailedAttempts: 0, pinLockedUntil: null }
    });

    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error interno validando el PIN" };
  }
}

/**
 * Traer lista bloqueada bajo validación (Aunque se llame localmente luego de la capa React)
 */
export async function getDailyMovementsAction(targetDate: string): Promise<ActionResult<any[]>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };

    const movements = await CashRegisterService.getDailyMovements(complex.id, targetDate);
    return { success: true, data: movements };
  } catch (err: any) {
    return { success: false, error: "Error de servidor leyendo transacciones." };
  }
}
