import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll puede fallar en Server Components (read-only).
            // Esto es esperado — solo funciona en Server Actions y Route Handlers.
          }
        },
      },
    }
  );
}

/**
 * Obtiene la sesión de Supabase y el complejo autenticado.
 * Retorna null si no hay sesión o no se encuentra el complejo.
 * Usar en Server Actions y Server Components protegidos.
 */
export async function getAuthComplex() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const complex = await prisma.complex.findUnique({
    where: { email: user.email! },
  });

  if (!complex) return null;

  return complex;
}
