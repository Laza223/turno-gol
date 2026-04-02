# SKILLS.md — Patrones técnicos y convenciones de TurnoGol

## Estructura de carpetas

src/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.tsx
│ │ ├── register/
│ │ │ └── page.tsx
│ │ └── layout.tsx
│ ├── (dashboard)/
│ │ ├── dashboard/
│ │ │ └── page.tsx # Grilla de turnos (home)
│ │ ├── bookings/
│ │ │ └── page.tsx # Lista de reservas
│ │ ├── courts/
│ │ │ └── page.tsx # Gestión de canchas
│ │ ├── fixed-slots/
│ │ │ └── page.tsx # Turnos fijos
│ │ ├── cash-register/
│ │ │ └── page.tsx # Caja diaria
│ │ ├── customers/
│ │ │ └── page.tsx # Clientes
│ │ ├── reports/
│ │ │ └── page.tsx # Reportes (protegido por PIN)
│ │ ├── settings/
│ │ │ ├── page.tsx # Configuración general
│ │ │ ├── mercadopago/
│ │ │ │ └── page.tsx # Conectar MP
│ │ │ └── subscription/
│ │ │ └── page.tsx # Suscripción
│ │ └── layout.tsx # Layout con sidebar/nav
│ ├── (public)/
│ │ └── [slug]/
│ │ ├── page.tsx # Página pública del complejo
│ │ └── book/
│ │ └── page.tsx # Flujo de reserva online
│ ├── onboarding/
│ │ └── page.tsx # Wizard post-registro
│ ├── api/
│ │ ├── webhooks/
│ │ │ └── mercadopago/
│ │ │ └── route.ts
│ │ └── cron/
│ │ └── generate-fixed-bookings/
│ │ └── route.ts
│ ├── layout.tsx # Root layout
│ └── page.tsx # Landing page
│
├── components/
│ ├── ui/ # shadcn/ui (generados)
│ ├── booking/
│ │ ├── booking-form.tsx
│ │ ├── booking-detail.tsx
│ │ ├── booking-card.tsx
│ │ └── block-slot-form.tsx
│ ├── court/
│ │ ├── court-form.tsx
│ │ └── court-card.tsx
│ ├── grid/
│ │ ├── booking-grid.tsx # Grilla principal
│ │ ├── grid-slot.tsx # Celda individual
│ │ ├── grid-header.tsx # Header con fecha/navegación
│ │ └── grid-mobile.tsx # Vista mobile
│ ├── cash/
│ │ ├── cash-summary.tsx
│ │ └── payment-list.tsx
│ ├── customer/
│ │ ├── customer-search.tsx
│ │ └── customer-detail.tsx
│ ├── fixed-slot/
│ │ ├── fixed-slot-form.tsx
│ │ └── fixed-slot-card.tsx
│ ├── reports/
│ │ ├── revenue-chart.tsx
│ │ └── occupancy-chart.tsx
│ ├── whatsapp/
│ │ └── whatsapp-buttons.tsx
│ ├── pin/
│ │ └── pin-guard.tsx
│ ├── layout/
│ │ ├── sidebar.tsx
│ │ ├── bottom-nav.tsx
│ │ ├── header.tsx
│ │ └── trial-banner.tsx
│ ├── onboarding/
│ │ ├── step-complex.tsx
│ │ ├── step-courts.tsx
│ │ ├── step-schedule.tsx
│ │ ├── step-deposits.tsx
│ │ ├── step-cancellation.tsx
│ │ ├── step-pin.tsx
│ │ └── step-success.tsx
│ └── shared/
│ ├── loading-skeleton.tsx
│ ├── empty-state.tsx
│ ├── confirm-dialog.tsx
│ └── date-picker.tsx
│
├── lib/
│ ├── supabase/
│ │ ├── client.ts # Browser client
│ │ ├── server.ts # Server client (cookies)
│ │ └── middleware.ts # Auth helper para middleware
│ ├── mercadopago/
│ │ ├── client.ts # MP SDK config
│ │ ├── oauth.ts # OAuth flow helpers
│ │ └── webhooks.ts # Webhook validation + handlers
│ ├── services/ # **_ LÓGICA DE NEGOCIO _**
│ │ ├── booking-service.ts
│ │ ├── court-service.ts
│ │ ├── customer-service.ts
│ │ ├── fixed-slot-service.ts
│ │ ├── payment-service.ts
│ │ ├── complex-service.ts
│ │ ├── cash-register-service.ts
│ │ └── report-service.ts
│ ├── validations/
│ │ ├── booking.ts
│ │ ├── court.ts
│ │ ├── customer.ts
│ │ ├── complex.ts
│ │ ├── fixed-slot.ts
│ │ └── payment.ts
│ ├── utils/
│ │ ├── dates.ts
│ │ ├── currency.ts
│ │ ├── phone.ts
│ │ ├── whatsapp.ts
│ │ ├── slug.ts
│ │ ├── pin.ts
│ │ └── pricing.ts # Calcula precio según cancha + día
│ ├── constants/
│ │ ├── booking-states.ts
│ │ ├── payment-methods.ts
│ │ ├── ui-texts.ts
│ │ └── wa-templates.ts # Templates default de WhatsApp
│ └── types/
│ └── index.ts # Types de la aplicación
│
├── actions/ # Server Actions (wrappers finos)
│ ├── booking-actions.ts
│ ├── court-actions.ts
│ ├── customer-actions.ts
│ ├── fixed-slot-actions.ts
│ ├── payment-actions.ts
│ ├── complex-actions.ts
│ └── auth-actions.ts
│
├── hooks/
│ ├── use-realtime-bookings.ts
│ └── use-pin-guard.ts
│
├── prisma/
│ ├── schema.prisma
│ ├── migrations/
│ └── seed.ts
│
└── middleware.ts

## Patrón Service Layer (OBLIGATORIO)

Toda lógica de negocio vive en `lib/services/`. Los Server Actions y API Routes son wrappers que validan auth, parsean input con Zod, y delegan al service.

```typescript
// =====================================================
// lib/services/booking-service.ts — LÓGICA DE NEGOCIO
// =====================================================
import { prisma } from "@/lib/prisma";
import type { CreateBookingInput } from "@/lib/types";

export async function createBooking(
  complexId: string,
  input: CreateBookingInput,
) {
  // 1. Verificar que el slot no esté ocupado
  const existingBooking = await prisma.booking.findFirst({
    where: {
      courtId: input.courtId,
      bookingDate: input.bookingDate,
      startTime: input.startTime,
      status: { notIn: ["cancelled", "no_show"] },
    },
  });

  if (existingBooking) {
    throw new Error("Este horario ya está reservado");
  }

  // 2. Crear o buscar cliente
  // 3. Calcular precio
  // 4. Crear booking
  // 5. Crear payment si señó
  // 6. Return booking

  return booking;
}

// =====================================================
// actions/booking-actions.ts — WRAPPER FINO
// =====================================================
("use server");

import { z } from "zod";
import { createBookingSchema } from "@/lib/validations/booking";
import { createBooking } from "@/lib/services/booking-service";
import { getAuthComplex } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createBookingAction(
  input: z.infer<typeof createBookingSchema>,
): Promise<ActionResult<{ bookingId: string }>> {
  try {
    // Auth
    const complex = await getAuthComplex();
    if (!complex) return { success: false, error: "No autenticado" };

    // Validación
    const validated = createBookingSchema.parse(input);

    // Delegar al service
    const booking = await createBooking(complex.id, validated);

    revalidatePath("/dashboard");
    return { success: true, data: { bookingId: booking.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos" };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error inesperado al crear la reserva" };
  }
}
```

¿Por qué Service Layer? Cuando se construya la app nativa en el futuro, se crearán API Routes que llamen a los MISMOS services. La lógica vive en UN solo lugar.

## Patrón ActionResult para Server Actions

// Siempre devolver este tipo desde Server Actions
type ActionResult<T = void> =
| { success: true; data: T }
| { success: false; error: string }

// En el componente:
import { toast } from "sonner"

const result = await createBookingAction(data)
if (result.success) {
toast.success("Reserva creada")
} else {
toast.error(result.error)
}

## Validaciones con Zod

// lib/validations/booking.ts
import { z } from "zod"

export const createBookingSchema = z.object({
courtId: z.string().uuid("Cancha inválida"),
customerName: z.string()
.min(2, "El nombre debe tener al menos 2 caracteres")
.max(100, "El nombre es demasiado largo"),
customerPhone: z.string()
.min(8, "Teléfono inválido")
.max(20, "Teléfono inválido")
.regex(/^[\d\s\-\+()]+$/, "Teléfono inválido"),
  bookingDate: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
"Fecha inválida"
),
startTime: z.string().regex(
/^([01]\d|2[0-3]):([0-5]\d)$/,
    "Hora inválida"
  ),
  endTime: z.string().regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
"Hora inválida"
),
depositPaid: z.boolean().default(false),
source: z.enum(["manual", "online", "phone"]).default("manual"),
notes: z.string().max(500).optional(),
})

## Manejo de moneda (Argentina)

// lib/utils/currency.ts

// Los precios se guardan como Int en la DB (pesos enteros)
// $25.000 se guarda como 25000

export function formatARS(amount: number): string {
return new Intl.NumberFormat("es-AR", {
style: "currency",
currency: "ARS",
minimumFractionDigits: 0,
maximumFractionDigits: 0,
}).format(amount)
}
// formatARS(25000) → "$25.000"

## Manejo de fechas y horas de reservas

// lib/utils/dates.ts
// Las fechas y horas de reservas son STRINGS, no Date objects.
// bookingDate: "2025-06-14"
// startTime: "20:00"
// Esto evita problemas de timezone.

import { format, parse, addDays, isWeekend } from "date-fns"
import { es } from "date-fns/locale"

export function formatBookingDate(dateStr: string): string {
const date = parse(dateStr, "yyyy-MM-dd", new Date())
return format(date, "EEEE d 'de' MMMM", { locale: es })
// → "viernes 14 de junio"
}

export function isWeekendDate(dateStr: string): boolean {
const date = parse(dateStr, "yyyy-MM-dd", new Date())
return isWeekend(date)
}

export function getNextNDates(n: number): string[] {
const dates: string[] = []
for (let i = 0; i < n; i++) {
dates.push(format(addDays(new Date(), i), "yyyy-MM-dd"))
}
return dates
}

## Links de WhatsApp

// lib/utils/whatsapp.ts
export function createWhatsAppLink(
phone: string,
message: string
): string {
const cleanPhone = phone.replace(/[^0-9]/g, "")
const phoneWithCountry = cleanPhone.startsWith("54")
? cleanPhone
: `54${cleanPhone}`
const encodedMessage = encodeURIComponent(message)
return `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`
}

export function buildMessage(
template: string,
variables: Record<string, string>
): string {
let message = template
for (const [key, value] of Object.entries(variables)) {
message = message.replaceAll(`{${key}}`, value)
}
return message
}

## Cálculo de precio

// lib/utils/pricing.ts
import { isWeekendDate } from "./dates"

interface Court {
price: number
priceWeekend: number | null
}

export function getCourtPrice(court: Court, dateStr: string): number {
if (court.priceWeekend && isWeekendDate(dateStr)) {
return court.priceWeekend
}
return court.price
}

## Convenciones de nombrado

Archivos: kebab-case → booking-card.tsx
Componentes: PascalCase → BookingCard
Funciones: camelCase → createBooking
Constantes: UPPER_SNAKE → BOOKING_STATES
Types/Interfaces: PascalCase → BookingStatus
Server Actions: camelCase+Action → createBookingAction
Services: camelCase → createBooking
Hooks: use + camelCase → useRealtimeBookings
Tablas DB: snake_case → fixed_slots
Columnas DB: snake_case → booking_date
Rutas URL: kebab-case → /fixed-slots

## Seguridad

- Toda Server Action verifica auth (getAuthComplex()) antes de ejecutar
- Toda query filtra por complexId del usuario autenticado
- Los services reciben complexId como parámetro, nunca lo deducen solos
- Prisma previene SQL injection por defecto
- Inputs validados con Zod ANTES de llegar al service
- PIN se hashea con bcrypt antes de guardar
- Tokens de MercadoPago se encriptan antes de guardar en la DB
- Webhooks de MP se validan con la signature
- Rate limiting en la ruta pública de reservas online
- CSRF protection built-in via Next.js Server Actions
- RLS de Supabase como segunda capa para Realtime
