# ARCHITECTURE.md — TurnoGol

## Decisiones de arquitectura

### Monolito con Next.js App Router

Todo en un solo proyecto Next.js. Frontend, Server Actions, API routes para webhooks y crons. Un repo, un deploy.

### Multi-tenancy

Una sola base de datos PostgreSQL. Cada tabla tiene `complexId`. Toda query filtra por el complejo autenticado. Los services reciben `complexId` como parámetro obligatorio.

### Service Layer

Toda lógica de negocio está en `lib/services/`. Los Server Actions son wrappers finos: verifican auth, validan con Zod, llaman al service, devuelven ActionResult. Cuando se construya la app nativa, se crearán API Routes que llamen a los mismos services.

## Flujos de datos

### Panel interno (dashboard)

Browser → Server Component → getAuthComplex() → Service → Prisma → PostgreSQL
(o Client Component → Server Action → Service → Prisma → PostgreSQL)

### Página pública (/[slug])

Browser → Server Component → findComplexBySlug() → Service → Prisma → PostgreSQL
(sin auth, filtra por slug)

### Crear reserva manual

Recepcionista toca slot → Formulario → Server Action
→ validate auth → parse Zod → bookingService.createBooking()
→ Prisma → DB → revalidatePath → UI se actualiza
→ Supabase Realtime notifica otras sesiones

### Reserva online con pago

Cliente elige slot → Formulario → Server Action
→ validate input → bookingService.createOnlineBooking()
→ Crea booking (confirmed, depositPaid: false)
→ Genera MercadoPago Checkout Pro → Redirect a MP
→ Cliente paga → MP redirige de vuelta a /[slug]/book?status=ok
→ MP webhook → /api/webhooks/mercadopago
→ Valida signature → paymentService.processDepositWebhook()
→ Marca depositPaid: true + crea Payment
→ Supabase Realtime → grilla se actualiza

### Cron de turnos fijos

Vercel Cron (lunes 03:00 AM) → /api/cron/generate-fixed-bookings
→ Valida CRON_SECRET → fixedSlotService.generateWeeklyBookings()
→ Para cada fijo activo: busca si ya existe booking para esa fecha
→ Si no existe: crea booking (confirmed, source: fixed)
→ Procesa en batches de 50 complejos

## Auth

### Registro

Form → authActions.register() → Supabase Auth signUp
→ Crear Complex en DB (trial, 14 días)
→ Redirect a /onboarding

### Login

Form → authActions.login() → Supabase Auth signInWithPassword
→ Redirect a /dashboard (o /onboarding si no completó)

### Middleware (middleware.ts)

Cada request:
/dashboard/_ → verificar session de Supabase
→ Si no hay session → redirect /login
→ Si onboardingComplete === false → redirect /onboarding
→ Si subscriptionStatus === "blocked" → inyectar flag
/onboarding → verificar session
→ Si onboardingComplete === true → redirect /dashboard
/[slug] → acceso libre
/api/webhooks/_ → acceso libre
/api/cron/\* → validar CRON_SECRET
/login, /register → si ya tiene session → redirect /dashboard

### Session

No hay límite de sesiones simultáneas. Supabase Auth maneja JWT tokens con refresh automático.

## PIN

Acceder a sección protegida (reportes, config precios, suscripción):
→ Modal de PIN → Input de 4-6 dígitos → Server Action
→ Verifica pinFailedAttempts < 5 (si no, bloqueo 5 min)
→ Compara hash con bcrypt
→ Si ok: setear flag en sessionStorage (expira en 30 min)
→ Si mal: incrementar pinFailedAttempts, si llega a 5 lockear

## Fechas y horas

### Convención fundamental

Las fechas y horas de reservas son **strings**, no objetos Date ni timestamps.

- `bookingDate`: `"2025-06-14"` (formato ISO date)
- `startTime`: `"20:00"` (formato HH:mm)
- `endTime`: `"21:00"` (formato HH:mm)

### ¿Por qué strings?

- Una reserva a las 20:00 es a las 20:00, sin importar timezone ni DST.
- No hay ambigüedad.
- Las comparaciones de disponibilidad son simples: igualdad de strings.
- Evita toda una clase de bugs de timezone.

### Operación post-medianoche

Si un complejo abre de 14:00 a 01:00:

- Los slots de 00:00 y 00:30 pertenecen al **día operativo anterior**.
- bookingDate del viernes a las 00:30 = `"2025-06-13"` (viernes).
- La grilla del viernes muestra hasta la 01:00.
- La grilla del sábado empieza a las 14:00.
- El precio se calcula según el día operativo (viernes), no el calendario (sábado).
- Para detectar cruce de medianoche: `closeTime < openTime`.

### Generación de slots

```typescript
function generateSlots(openTime: string, closeTime: string, startMinute: number) {
  // Si closeTime < openTime → cruza medianoche
  // Generar slots desde openTime hasta 23:xx, luego desde 00:xx hasta closeTime
  // Cada slot: { startTime: "20:00", endTime: "21:00" }
}

# Dinero

- Todos los campos de dinero son Int (pesos enteros).
- $25.000 se guarda como 25000.
- Formateo con formatARS(25000) → "$25.000".
- Nunca hacer cálculos con floating point.
- MercadoPago acepta pesos enteros.

# Rutas

PÚBLICAS (sin auth):
/                                → Landing page
/login                           → Login
/register                        → Registro
/[slug]                          → Página del complejo
/[slug]/book                     → Flujo de reserva
/api/webhooks/mercadopago        → Webhook MP
/api/cron/generate-fixed-bookings → Cron turnos fijos

PROTEGIDAS (requieren auth):
/onboarding                      → Wizard (solo si no completó)
/dashboard                       → Grilla de turnos
/dashboard/bookings              → Lista de reservas
/dashboard/courts                → Canchas
/dashboard/fixed-slots           → Turnos fijos
/dashboard/cash-register         → Caja diaria
/dashboard/customers             → Clientes
/dashboard/reports               → Reportes (+ PIN)
/dashboard/settings              → Configuración (parcial + PIN)
/dashboard/settings/mercadopago  → Conectar MP
/dashboard/settings/subscription → Suscripción

# Cron Jobs (Vercel)

Configurar en vercel.json:

{
  "crons": [
    {
      "path": "/api/cron/generate-fixed-bookings",
      "schedule": "0 6 * * 1"
    }
  ]
}
```

(6 UTC = 3 AM Argentina)

El endpoint valida Authorization: Bearer ${CRON_SECRET} (Vercel lo envía automáticamente).

Si hay muchos complejos, procesar en batches de 50 para no superar el timeout de 60 segundos (Vercel Pro).

Infraestructura
Servicio Plan Costo/mes
Vercel Pro $20
Supabase Pro $25
Resend Free (3k emails) $0
MercadoPago Sin costo fijo Variable
Total ~$45
Capacidad estimada: hasta 500-1000 complejos activos sin cambios de infra.
