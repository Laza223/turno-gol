"use server";

import { prisma } from "@/lib/prisma";
import { getAuthComplex } from "@/lib/supabase/server";
import { CustomerService } from "@/lib/services/customer-service";
import type { ActionResult } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function searchCustomersAction(query: string) {
  try {
    const complex = await getAuthComplex();
    if (!complex) return [];

    if (!query || query.length < 2) return [];

    const customers = await prisma.customer.findMany({
      where: {
        complexId: complex.id,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    return customers;
  } catch (error) {
    return [];
  }
}

export async function blockCustomerAction(input: { customerId: string; reason: string }): Promise<ActionResult<boolean>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };

    if (!input.reason?.trim()) {
       return { success: false, error: "El motivo es obligatorio." };
    }

    await CustomerService.blockCustomer(complex.id, input.customerId, input.reason);
    
    revalidatePath("/dashboard/customers");
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al bloquear cliente" };
  }
}

export async function unblockCustomerAction(input: { customerId: string }): Promise<ActionResult<boolean>> {
  try {
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autorizado" };

    await CustomerService.unblockCustomer(complex.id, input.customerId);
    
    revalidatePath("/dashboard/customers");
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al desbloquear cliente" };
  }
}
