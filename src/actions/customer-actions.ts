"use server";

import { prisma } from "@/lib/prisma";
import { getAuthComplex } from "@/lib/supabase/server";

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
