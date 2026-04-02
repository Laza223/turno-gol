# DATABASE.md — TurnoGol

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// COMPLEJOS (multi-tenant root)
// ============================================

model Complex {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String
  slug          String   @unique
  phone         String?
  address       String?
  city          String?
  province      String?
  logoUrl       String?  @map("logo_url")

  // Horario de operación
  openTime         String  @default("14:00") @map("open_time")
  closeTime        String  @default("00:00") @map("close_time")
  slotStartMinute  Int     @default(0)       @map("slot_start_minute")

  // Reservas
  maxAdvanceDays   Int     @default(7) @map("max_advance_days")

  // Señas
  depositEnabled   Boolean @default(false) @map("deposit_enabled")
  depositType      String? @map("deposit_type")     // "percentage" | "fixed"
  depositValue     Int?    @map("deposit_value")     // 30 (%) o 8000 ($)

  // Datos para transferencia (complejos sin MP)
  transferAlias    String? @map("transfer_alias")
  transferCbu      String? @map("transfer_cbu")

  // Política de cancelación
  cancellationPolicy String @default("lose") @map("cancellation_policy")
  cancellationHours  Int?   @map("cancellation_hours")

  // MercadoPago del complejo (para cobrar señas)
  mpAccessToken      String?   @map("mp_access_token")
  mpRefreshToken     String?   @map("mp_refresh_token")
  mpTokenExpiresAt   DateTime? @map("mp_token_expires_at")
  mpUserId           String?   @map("mp_user_id")
  mpConnected        Boolean   @default(false) @map("mp_connected")

  // PIN de gestión
  pinHash            String? @map("pin_hash")
  pinFailedAttempts  Int     @default(0) @map("pin_failed_attempts")
  pinLockedUntil     DateTime? @map("pin_locked_until")

  // Suscripción al SaaS
  subscriptionPlan   String    @default("trial") @map("subscription_plan")
  subscriptionStatus String    @default("active") @map("subscription_status")
  trialEndsAt        DateTime? @map("trial_ends_at")
  subscriptionEndsAt DateTime? @map("subscription_ends_at")
  mpSubscriptionId   String?   @map("mp_subscription_id")

  // WhatsApp templates
  waTemplateConfirmation String? @map("wa_template_confirmation")
  waTemplateDeposit      String? @map("wa_template_deposit")
  waTemplateReminder     String? @map("wa_template_reminder")
  waTemplateCancellation String? @map("wa_template_cancellation")

  // Onboarding
  onboardingStep     Int     @default(0) @map("onboarding_step")
  onboardingComplete Boolean @default(false) @map("onboarding_complete")

  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt     @map("updated_at")

  courts     Court[]
  customers  Customer[]
  bookings   Booking[]
  fixedSlots FixedSlot[]
  payments   Payment[]

  @@map("complexes")
}

// ============================================
// CANCHAS
// ============================================

model Court {
  id           String  @id @default(uuid())
  complexId    String  @map("complex_id")
  name         String
  playerCount  Int     @map("player_count")
  surface      String  @default("sintetico")
  isRoofed     Boolean @default(false) @map("is_roofed")
  price        Int
  priceWeekend Int?    @map("price_weekend")
  sortOrder    Int     @default(0) @map("sort_order")
  isActive     Boolean @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt     @map("updated_at")

  complex    Complex    @relation(fields: [complexId], references: [id], onDelete: Cascade)
  bookings   Booking[]
  fixedSlots FixedSlot[]

  @@map("courts")
}

// ============================================
// CLIENTES
// ============================================

model Customer {
  id                 String   @id @default(uuid())
  complexId          String   @map("complex_id")
  name               String
  phone              String
  isBlocked          Boolean  @default(false) @map("is_blocked")
  blockReason        String?  @map("block_reason")
  totalBookings      Int      @default(0) @map("total_bookings")
  totalCancellations Int      @default(0) @map("total_cancellations")
  totalNoShows       Int      @default(0) @map("total_no_shows")
  lastBookingDate    String?  @map("last_booking_date")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt     @map("updated_at")

  complex    Complex    @relation(fields: [complexId], references: [id], onDelete: Cascade)
  bookings   Booking[]
  fixedSlots FixedSlot[]
  payments   Payment[]

  @@unique([complexId, phone])
  @@map("customers")
}

// ============================================
// RESERVAS
// ============================================

model Booking {
  id          String  @id @default(uuid())
  complexId   String  @map("complex_id")
  courtId     String  @map("court_id")
  customerId  String? @map("customer_id")

  bookingDate String  @map("booking_date")   // "2025-06-14"
  startTime   String  @map("start_time")     // "20:00"
  endTime     String  @map("end_time")       // "21:00"

  status      String  @default("confirmed")
  // "confirmed" | "completed" | "cancelled" | "no_show" | "blocked"

  source      String  @default("manual")
  // "manual" | "online" | "phone" | "fixed"

  price          Int
  depositAmount  Int?     @map("deposit_amount")
  depositPaid    Boolean  @default(false) @map("deposit_paid")
  isPaid         Boolean  @default(false) @map("is_paid")
  paymentMethod  String?  @map("payment_method")
  // "cash" | "transfer" | "mercadopago" | "debit" | "credit"

  fixedSlotId    String?  @map("fixed_slot_id")
  blockNote      String?  @map("block_note")
  mpPaymentId    String?  @map("mp_payment_id")
  notes          String?

  cancelledAt    DateTime? @map("cancelled_at")
  completedAt    DateTime? @map("completed_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt     @map("updated_at")

  complex    Complex    @relation(fields: [complexId], references: [id], onDelete: Cascade)
  court      Court      @relation(fields: [courtId], references: [id])
  customer   Customer?  @relation(fields: [customerId], references: [id])
  fixedSlot  FixedSlot? @relation(fields: [fixedSlotId], references: [id])
  payments   Payment[]

  // NO usar @@unique aquí. Ver nota sobre partial index abajo.
  @@map("bookings")
}

// ============================================
// TURNOS FIJOS
// ============================================

model FixedSlot {
  id          String  @id @default(uuid())
  complexId   String  @map("complex_id")
  courtId     String  @map("court_id")
  customerId  String  @map("customer_id")

  dayOfWeek   Int     @map("day_of_week")  // 0=dom, 1=lun, ..., 6=sab
  startTime   String  @map("start_time")   // "21:00"
  endTime     String  @map("end_time")     // "22:00"

  status      String  @default("active")
  // "active" | "paused" | "cancelled"

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt     @map("updated_at")

  complex    Complex   @relation(fields: [complexId], references: [id], onDelete: Cascade)
  court      Court     @relation(fields: [courtId], references: [id])
  customer   Customer  @relation(fields: [customerId], references: [id])
  bookings   Booking[]

  @@map("fixed_slots")
}

// ============================================
// PAGOS (movimientos de caja)
// ============================================

model Payment {
  id            String  @id @default(uuid())
  complexId     String  @map("complex_id")
  bookingId     String? @map("booking_id")
  customerId    String? @map("customer_id")

  type          String
  // "deposit" | "booking_payment" | "refund"

  amount        Int
  paymentMethod String  @map("payment_method")
  // "cash" | "transfer" | "mercadopago" | "debit" | "credit"

  description   String?
  reference     String?

  paymentDate   String  @map("payment_date")  // "2025-06-14"
  paymentTime   String  @map("payment_time")  // "20:30"
  createdAt     DateTime @default(now()) @map("created_at")

  complex    Complex   @relation(fields: [complexId], references: [id], onDelete: Cascade)
  booking    Booking?  @relation(fields: [bookingId], references: [id])
  customer   Customer? @relation(fields: [customerId], references: [id])

  @@map("payments")
}

// ============================================
// LOG DE ACTIVIDAD
// ============================================

model ActivityLog {
  id          String   @id @default(uuid())
  complexId   String   @map("complex_id")
  entityType  String   @map("entity_type")
  entityId    String   @map("entity_id")
  action      String
  details     Json?
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("activity_logs")
}
```

# Migración SQL manual (ejecutar después del prisma db push)

## Estas queries se deben ejecutar directamente en Supabase SQL Editor o via una migración manual, porque Prisma no soporta partial unique indexes ni CREATE INDEX con WHERE

-- Evitar doble reserva en el mismo slot
-- Solo cuenta reservas que NO están canceladas ni son no_show
CREATE UNIQUE INDEX idx_active_booking_per_slot
ON bookings(court_id, booking_date, start_time)
WHERE status NOT IN ('cancelled', 'no_show');

-- Índices para queries frecuentes
CREATE INDEX idx_bookings_complex_date ON bookings(complex_id, booking_date);
CREATE INDEX idx_bookings_court_date ON bookings(court_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(complex_id, status);
CREATE INDEX idx_payments_complex_date ON payments(complex_id, payment_date);
CREATE INDEX idx_fixed_slots_complex ON fixed_slots(complex_id, status);
CREATE INDEX idx_customers_complex_phone ON customers(complex_id, phone);
CREATE INDEX idx_customers_complex_name ON customers(complex_id, name);

# Seguridad de datos — Aislamiento por complejo

## Toda query en los services DEBE filtrar por complexId. El service recibe complexId como primer parámetro y lo usa en el WHERE de cada consulta. Nunca deducir el complexId de otro lugar.

Para Supabase Realtime, suscribirse con filtro:

channel.on('postgres_changes', {
event: '\*',
schema: 'public',
table: 'bookings',
filter: `complex_id=eq.${complexId}`
}, callback)

Esto garantiza que el canal de realtime solo recibe eventos del complejo autenticado.
