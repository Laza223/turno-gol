import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ["/", "/login", "/register"];

function isPublicRoute(pathname: string): boolean {
  // Rutas públicas exactas
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  // Webhooks y cron jobs
  if (pathname.startsWith("/api/webhooks/")) return true;
  if (pathname.startsWith("/api/cron/")) return true;

  // Archivos estáticos de Next.js
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon.ico")) return true;

  return false;
}

function isDashboardRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

function isOnboardingRoute(pathname: string): boolean {
  return pathname === "/onboarding";
}

function isAuthRoute(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

/**
 * Determina si una ruta es una página pública de complejo (/[slug]).
 * Cualquier ruta de un solo segmento que no sea una ruta conocida es tratada como slug.
 */
function isSlugRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return false;
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/onboarding")) return false;
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/_next/")) return false;

  // /algo o /algo/book → rutas públicas de complejo
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 1 && segments.length <= 2) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas estáticas → pasar sin auth
  if (isPublicRoute(pathname)) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  // Rutas públicas de complejos (/[slug], /[slug]/book) → pasar sin auth
  if (isSlugRoute(pathname)) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  // Para rutas protegidas, obtener sesión
  const { supabaseResponse, user } = await updateSession(request);

  // Sin sesión → redirect a login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Con sesión en /login o /register → redirect a dashboard
  if (isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Verificar onboarding via header custom (seteado por el layout del dashboard)
  // Para el middleware, usamos los metadatos del user de Supabase
  const onboardingComplete =
    user.user_metadata?.onboarding_complete === true;

  // En /onboarding pero ya completó → redirect a dashboard
  if (isOnboardingRoute(pathname) && onboardingComplete) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // En /dashboard/* pero no completó onboarding → redirect a onboarding
  if (isDashboardRoute(pathname) && !onboardingComplete) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
