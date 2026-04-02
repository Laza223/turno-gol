# PROMPTS.md — Secuencia de prompts para construir TurnoGol

## ⚠️ REGLA FUNDAMENTAL

**Después de ejecutar cada prompt, ANTES de pasar al siguiente:**

1. Leé todo el código generado.
2. Ejecutá la app y probá manualmente.
3. Si hay errores, corregí con el agente ANTES de avanzar.
4. **Nunca acumules prompts sin verificar.**

Si un prompt genera código que no funciona, NO pases al siguiente. Iterá hasta que funcione correctamente. Los errores se acumulan y después son imposibles de debuggear.

---

## FASE 0 — Setup del proyecto

### Prompt 0.1 — Inicialización

Inicializá el proyecto TurnoGol con Next.js 14 usando App Router.

Requisitos:

- pnpm como package manager
- TypeScript strict mode
- Tailwind CSS configurado con los colores custom de DESIGN_SYSTEM.md
  (green-primary, green-dark, navy, yellow-accent + toda la escala de grises)
- Inter como fuente principal via next/font/google
- Estructura de carpetas vacía según SKILLS.md (solo las carpetas, sin archivos de componentes aún)
- .env.example con todas las variables de README.md
- .gitignore apropiado
- Configurá shadcn/ui con el estilo "new-york" y los colores definidos
- Instalá: prisma, @prisma/client, zod, date-fns, lucide-react, sonner, @supabase/supabase-js, @supabase/ssr, bcryptjs, @types/bcryptjs
- Configurá Tailwind para que el default border-radius sea rounded-lg y la fuente por default sea Inter

No generes páginas ni componentes. Solo el setup limpio y funcional.
Verificá que pnpm dev arranca sin errores.

### Prompt 0.2 — Schema de base de datos

Creá el schema de Prisma exactamente como está definido en DATABASE.md.

Después:

1- Generá el Prisma client
2- Creá lib/supabase/client.ts (Supabase browser client)
3- Creá lib/supabase/server.ts (Supabase server client usando cookies y @supabase/ssr)
4- Creá middleware.ts de Next.js que:

- Proteja /dashboard/\* requiriendo auth de Supabase
- Redirija a /login si no hay sesión
- Redirija a /onboarding si el complejo no completó onboarding
- Permita acceso libre a: /, /login, /register, /[slug]
- Permita acceso libre a /api/webhooks/_ y /api/cron/_

5- Creá lib/prisma.ts con la instancia singleton de PrismaClient

Verificá que "pnpm prisma generate" funciona sin errores.

### Prompt 0.3 — Utilidades base

Creá todos los archivos de utilidades y constantes:

1- lib/utils/currency.ts — formatARS (como está en SKILLS.md)
2- lib/utils/dates.ts — formatBookingDate, isWeekendDate, getNextNDates,
formatDayOfWeek, todayDateString, currentTimeString.
Incluir la función generateSlots(openTime, closeTime, slotStartMinute)
que genera los slots de un día considerando cruce de medianoche
(como está explicado en ARCHITECTURE.md).
3- lib/utils/phone.ts — normalizePhone (limpiar y agregar código 54 si falta),
validateArgentinePhone (regex para formatos argentinos comunes)
4- lib/utils/whatsapp.ts — createWhatsAppLink, buildMessage (como está en SKILLS.md)
5- lib/utils/slug.ts — generateSlug(name: string): string (kebab-case, sin acentos, sin caracteres especiales)
6- lib/utils/pin.ts — hashPin(pin: string), verifyPin(pin: string, hash: string) usando bcryptjs
7- lib/utils/pricing.ts — getCourtPrice(court, dateStr) (como está en SKILLS.md)
8- lib/constants/booking-states.ts — objeto con los estados y sus labels/colores
9- lib/constants/payment-methods.ts — objeto con los métodos y sus labels/íconos
10- lib/constants/ui-texts.ts — mensajes de error comunes, labels, placeholders
11- lib/constants/wa-templates.ts — templates default de WhatsApp con variables
12- lib/types/index.ts — types de la aplicación (ActionResult, CreateBookingInput, etc.)
13- Todas las validaciones Zod: - lib/validations/booking.ts - lib/validations/court.ts - lib/validations/customer.ts - lib/validations/complex.ts (registro + onboarding) - lib/validations/fixed-slot.ts - lib/validations/payment.ts

Todos tipados. Sin any. Seguí las convenciones de SKILLS.md.

### Prompt 0.4 — Seed data

Creá prisma/seed.ts con datos de prueba realistas:

- 1 complejo: "Complejo El Gol", slug "el-gol", configuración completa
  (seña 30%, horario 14:00-01:00, slots a los :00, trial activo)

- 3 canchas:
  - Cancha 1 (Fútbol 5, sintético, techada, $25000, finde $32000)
  - Cancha 2 (Fútbol 5, sintético, no techada, $22000, finde $28000)
  - Cancha 3 (Fútbol 7, natural, no techada, $35000, sin precio finde)

- 10 clientes con nombres argentinos realistas
  (ej: Juan Pérez, Martín González, etc.)
  1 de ellos bloqueado con motivo

- 20 reservas distribuidas en la semana actual:
  - 10 confirmed (5 con seña, 5 sin seña)
  - 5 completed (con pago registrado)
  - 3 de turno fijo
  - 2 blocked
  - 3 turnos fijos activos (martes 21:00, jueves 20:00, sábado 18:00)

- 10 pagos registrados correspondientes a las reservas completadas y señas

Configurá el script en package.json como "prisma:seed".
Verificá que pnpm prisma db seed funciona.

## FASE 1 — Auth y onboarding

### Prompt 1.1 — Auth

Implementá el sistema de autenticación:

1- Layout de auth (/app/(auth)/layout.tsx):

- Centrado vertical y horizontal
- Logo "TurnoGol ⚽" arriba
- Fondo blanco, limpio
- Max-width 400px

2- Página /login:

- Formulario: email + contraseña
- Validación con Zod
- Server Action (auth-actions.ts) que usa Supabase Auth signInWithPassword
- Manejo de errores: credenciales inválidas, red, etc.
- Link a /register
- Redirect a /dashboard on success (o /onboarding si no completó)

3- Página /register:

- Formulario: nombre del complejo + email + contraseña
- Validación con Zod
- Server Action que:
  a Crea usuario en Supabase Auth
  b Crea Complex en DB con defaults (trial 14 días, slug generado)
  c Setea templates de WhatsApp default
- Link a /login
- Redirect a /onboarding on success

4- Server Action de logout en auth-actions.ts

Seguí DESIGN_SYSTEM.md para estilos. Mobile-first.

### Prompt 1.2 — Onboarding

Implementá el wizard de onboarding en /onboarding.

Es una página con pasos secuenciales. El complejo ya está creado (del registro).
El onboarding actualiza los datos del complejo paso a paso.

Pasos:

1- Datos del complejo: dirección, teléfono (WhatsApp), logo (upload a Supabase Storage),
horario de operación (selectores de hora apertura + cierre).
2- Canchas: formulario para agregar canchas una por una.
Lista de canchas agregadas con editar/borrar.
Campos: nombre, jugadores (select 5-11), superficie (select), techada (toggle),
precio, toggle "¿Precio diferente fines de semana?" → input precio finde.
Mínimo 1 cancha para continuar.
3- Horarios: "¿A qué minuto arrancan tus turnos?"
Radio: En punto (:00) ← default | Y cuarto (:15) | Y media (:30)
4- Señas: toggle "¿Cobrás seña?" → si sí: radio porcentaje/fijo + input valor.
Inputs: alias para transferencia, CBU (opcionales).
Botón "Conectar MercadoPago" (solo el botón, la integración real va después).
5- Política de cancelación: radio "La seña se pierde" (default) /
"Se devuelve si cancela con más de X horas" + input horas.
6- PIN: crear PIN de 4-6 dígitos + confirmar. Se hashea con bcrypt.
7- Éxito: "¡TurnoGol está listo!" + link a la página pública + botón "Ir a la grilla".
Cada paso tiene Siguiente/Anterior. Step indicator visual.
Server Actions para guardar cada paso (actualizar Complex).
Guardar onboardingStep para retomar si cierra. Al completar: onboardingComplete = true.

Mobile-first. DESIGN_SYSTEM.md.

---

## FASE 2 — Layout y grilla

### Prompt 2.1 — Layout del dashboard

Implementá el layout del dashboard (/app/(dashboard)/layout.tsx).

Desktop (>= 1024px):

Sidebar izquierdo fijo (ancho 256px, fondo navy):
Logo "TurnoGol ⚽" arriba (texto blanco)
Nombre del complejo debajo (text-sm, gray-400)
Nav links con íconos (Lucide):
📅 Grilla (home, /dashboard)
📋 Reservas (/dashboard/bookings) — NOTA: esto es futuro, dejá el link
🏟️ Canchas (/dashboard/courts)
🔄 Turnos fijos (/dashboard/fixed-slots)
💰 Caja (/dashboard/cash-register)
👥 Clientes (/dashboard/customers)
📊 Reportes (/dashboard/reports) — con ícono de candado
⚙️ Configuración (/dashboard/settings)
Link activo: fondo green-primary/20%, texto white
Links inactivos: texto gray-400, hover: texto white
Botón de logout abajo
Mobile (< 1024px):

Sin sidebar
Bottom navigation bar con 5 links:
📅 Grilla | 💰 Caja | 🔄 Fijos | 👥 Clientes | ☰ Más
"Más" abre un menú con el resto de links
Header top con nombre del complejo + fecha de hoy
Ambos:

Banner de trial/suscripción si aplica:
Trial: "Prueba gratuita: X días restantes" (amarillo)
Grace: "Tu suscripción venció. Renovar." (rojo)
Blocked: pantalla completa de bloqueo
Área de contenido: fondo gray-50, padding según DESIGN_SYSTEM.md.

text

### Prompt 2.2 — Grilla de turnos

Implementá la grilla de turnos — pantalla principal en /dashboard.

Esta es la pantalla MÁS IMPORTANTE del sistema.

Datos (Server Component):

Traer todas las canchas activas del complejo
Traer todos los bookings del día seleccionado
(donde status NO es 'cancelled' ni 'no_show')
Generar los slots del día usando generateSlots()
con openTime, closeTime y slotStartMinute del complejo
Considerar cruce de medianoche según ARCHITECTURE.md
También traer canchas INACTIVAS que tengan bookings para ese día
(mostrarlas con indicador visual de inactiva)
Header de la grilla:

Fecha de hoy con formato "Viernes 14 de junio"
Botones ← → para navegar días
Botón "Hoy" para volver al día actual
Desktop (>= 768px):

Columnas = canchas (encabezado: nombre + "Fútbol X")
Filas = slots horarios
Cada celda muestra según estado:
Vacío: fondo transparente, borde punteado gray-300.
Hover: fondo gray-50. Click → abre formulario de reserva.
Confirmado señado: fondo green/10%, borde green, nombre del cliente, 🟢
Confirmado sin señar: fondo orange/10%, borde orange, nombre del cliente, 🟡
Turno fijo: fondo blue/10%, borde blue, nombre del cliente, badge "FIJO"
Completado: fondo gray/8%, nombre tachado o grisado
Bloqueado: fondo navy/8%, "Bloqueado" + motivo
Mobile (< 768px):

Tabs horizontales para elegir cancha
Lista vertical de slots
Cada slot es un row con hora + nombre + indicador de estado
Tap → Sheet (bottom)
Realtime:

Suscribirse a cambios en bookings filtrado por complexId y bookingDate
Cuando llega un cambio, re-fetch los bookings del día
Usar un Client Component wrapper para el realtime,
con el Server Component para la carga inicial
Skeleton loading mientras cargan los datos.

text

---

## FASE 3 — Reservas manuales

### Prompt 3.1 — Crear reserva

Implementá el flujo de crear reserva manual.

Cuando se toca un slot vacío en la grilla:

Mobile: Sheet (bottom)
Desktop: Sheet lateral derecho
Formulario:

Cancha, fecha, horario: pre-seleccionados, solo lectura
Precio: auto-calculado con getCourtPrice(), solo lectura, formateado con formatARS()
Nombre del cliente: input con autocomplete
(busca en customers del complejo por nombre o teléfono, debounce 300ms)
Teléfono: input, se autocompleta si eligió cliente existente
Si depositEnabled: toggle "¿Señó?" con monto de seña calculado
Notas: textarea opcional
Botón "Confirmar reserva" (verde, primario)
Botón "Bloquear horario" (ghost, secundario)
Service (booking-service.ts):

Validar que el slot no esté ocupado (SELECT WHERE status NOT IN cancelled, no_show)
Si está ocupado → throw error "Este horario ya está reservado"
Buscar customer por phone+complexId. Si no existe, crear.
Calcular precio con getCourtPrice()
Calcular depositAmount si aplica
Crear booking
Crear payment si depositPaid
Actualizar stats del customer (totalBookings, lastBookingDate)
Crear ActivityLog
Return booking
Server Action (booking-actions.ts):

Wrapper que valida auth, parsea Zod, llama al service
Después de crear:

Toast de éxito
Botón "📱 Enviar confirmación por WhatsApp"
(usa createWhatsAppLink con el template de confirmación)
Cerrar sheet
La grilla se actualiza (revalidatePath + realtime)
text

### Prompt 3.2 — Detalle y acciones de reserva

Implementá el detalle de una reserva existente.

Cuando se toca un slot ocupado en la grilla:

Mobile: Sheet (bottom)
Desktop: Sheet lateral derecho
Muestra:

Datos: cancha, fecha, horario, precio (formateado)
Cliente: nombre + teléfono (link clickeable a wa.me)
Estado con color e ícono
Seña: señada/no señada con monto
Badge "FIJO" si es turno fijo
Origen (manual/online/fijo)
Notas si tiene
Acciones:

Si confirmada sin señar:
"Marcar señada" → service actualiza depositPaid, crea Payment
Si confirmada:
"Cobrar turno" → formulario:
Método de pago: radio (efectivo/transfer/MP/tarjeta)
Monto: pre-llenado con precio, editable
Confirmar → service crea Payment, marca isPaid+completed, actualiza stats
"Cancelar reserva" → confirm dialog → service marca cancelled,
actualiza stats (totalCancellations). Si es turno fijo: solo cancela ESTA reserva.
"No se presentó" → service marca no_show, actualiza stats (totalNoShows)
Botones WhatsApp:
📱 Recordar turno
📱 Pedir seña (si no señó)
📱 Avisar cancelación
Para slots bloqueados:

Mostrar motivo
Botón "Desbloquear" → service cancela el booking bloqueado
text

### Prompt 3.3 — Bloquear slot

Implementá la funcionalidad de bloquear un slot.

En el formulario de nueva reserva (el que se abre al tocar un slot vacío),
hay un botón secundario "Bloquear horario".

Al tocarlo:

Input opcional: motivo del bloqueo
Botón "Bloquear"
Service:

Crear booking con status "blocked", sin customerId
blockNote = motivo ingresado
El slot aparece en la grilla según los colores de DESIGN_SYSTEM.md.

text

---

## FASE 4 — Página pública (sin pago)

### Prompt 4.1 — Estructura y disponibilidad

Implementá la página pública del complejo en /[slug].

Server Component que:

Busca el complejo por slug
Si no existe → 404
Si está bloqueado (subscriptionStatus) → mensaje "Reservas deshabilitadas temporalmente"
Trae canchas activas y bookings del rango de fechas visible
Layout:

Header: logo del complejo (o "TurnoGol ⚽" si no tiene), nombre, dirección,
teléfono con ícono de WhatsApp (link a wa.me)
Selector de fecha: pills horizontales scrolleables con los próximos N días
(N = maxAdvanceDays del complejo). Cada pill muestra día de semana abreviado + fecha.
Pill seleccionada: fondo green-primary, texto white.
Al seleccionar día: lista de canchas, cada una con:
Nombre + "Fútbol X"
Lista de horarios. Cada horario muestra:
Hora
Precio (formateado, calculado según base/finde)
Estado: "Reservar" (botón verde) o "Ocupado" (gris, deshabilitado)
Footer: "Gestionado con TurnoGol ⚽" (link a /)
Mobile-first. Diseño limpio. Colores del design system de TurnoGol (no personalizables por complejo).

text

### Prompt 4.2 — Formulario de reserva online

Implementá el formulario de reserva online.

Cuando el cliente toca "Reservar" en un horario:

Mobile: Sheet (bottom)
Desktop: Dialog (modal centrado)
Contenido:

Resumen: cancha + fecha + hora + precio
Input: nombre (obligatorio)
Input: teléfono/WhatsApp (obligatorio)
Si el complejo cobra seña:
Mostrar monto de la seña
Si tiene MP conectado: "Al confirmar vas a pagar la seña de $X con MercadoPago"
(el pago real se implementa en Fase 8, por ahora solo el texto)
Si NO tiene MP: "Para confirmar, transferí $X al alias: [alias] / CBU: [cbu]
y contactá al complejo."
Si NO cobra seña: botón "Confirmar reserva"
Política de cancelación del complejo visible como texto chico
Términos: "Al reservar aceptás la política del complejo"
Validación:

Verificar que el teléfono no pertenezca a un cliente bloqueado
Si sí → mensaje "No se pudo procesar tu reserva. Contactá al complejo."
Verificar que el slot siga disponible (race condition)
Service (booking-service.ts → createOnlineBooking):

Buscar o crear customer
Verificar slot disponible
Crear booking (source: "online")
Si no cobra seña: status confirmed
Si cobra seña sin MP: status confirmed, depositPaid false
Si cobra seña con MP: (se completa en Fase 8)
Pantalla de confirmación:

"¡Tu cancha está reservada! ✅"
Resumen completo
"Te esperamos el [fecha] a las [hora]"
Botón "Agregar al calendario" (genera .ics) — opcional, nice to have
text

---

## FASE 5 — Turnos fijos

### Prompt 5.1 — CRUD y generación

Implementá el módulo de turnos fijos en /dashboard/fixed-slots.

Lista principal:

Tabla/lista de turnos fijos activos del complejo
Cada uno muestra: cliente, cancha, día de semana, horario, estado
Badge de color por estado: activo (verde), pausado (amarillo), cancelado (gris)
Botón "Nuevo turno fijo"
Crear turno fijo:

Formulario (Sheet/Dialog):
Cliente: autocomplete (nombre o teléfono)
Cancha: select
Día de la semana: select (Lunes a Domingo)
Horario: select (solo slots que NO tengan otro turno fijo activo
en esa cancha ese día)
Botón "Crear"
Service (fixed-slot-service.ts):

Validar que no haya otro fijo activo en mismo día/hora/cancha
Crear fixed_slot
Generar bookings para las próximas 4 semanas:
Para cada fecha futura que coincida con el dayOfWeek:
Si ya hay un booking activo en ese slot → skip (y avisar)
Si no → crear booking (confirmed, source: fixed, fixedSlotId)
Return fixedSlot + cantidad de bookings generados
Detalle del turno fijo:

Datos del fijo
Lista de próximas reservas generadas
Acciones:
"Pausar" → status paused, no genera más hasta reactivar
"Reactivar" → status active, genera bookings pendientes
"Cancelar definitivamente" → confirm → status cancelled,
cancelar todas las reservas futuras vinculadas
Cron job (/api/cron/generate-fixed-bookings/route.ts):

Proteger con CRON_SECRET (Vercel lo envía como Authorization header)
Buscar fixed_slots activos
Para cada uno, generar bookings de la próxima semana si no existen
Procesar en batches de 50 complejos
Configurar vercel.json con el cron schedule (lunes 6 UTC = 3 AM AR)
text

---

## FASE 6 — Canchas y clientes

### Prompt 6.1 — Gestión de canchas

Implementá /dashboard/courts.

Lista:

Cards de canchas, ordenadas por sortOrder
Cada card: nombre, "Fútbol X", superficie, techada/no,
precio (+ precio finde si tiene), activa/inactiva
Toggle para activar/desactivar
No se puede desactivar si tiene turnos fijos activos
(mostrar error: "Esta cancha tiene turnos fijos activos")
Botón "Agregar cancha"
Formulario (crear/editar):

Mismo que el del onboarding
Service: court-service.ts (create, update, toggleActive)
No se puede borrar una cancha (solo desactivar)
text

### Prompt 6.2 — Gestión de clientes

Implementá /dashboard/customers.

Lista:

Tabla con búsqueda por nombre o teléfono (debounce 300ms)
Columnas: nombre, teléfono, reservas, última reserva, estado
Badge rojo si está bloqueado
Paginación simple (20 por página)
Detalle (Sheet/Dialog):

Nombre, teléfono, estadísticas
Últimas 10 reservas (lista simple)
Si bloqueado: motivo + "Desbloquear"
Si no bloqueado: "Bloquear" → input motivo → confirmar
Botón WhatsApp
Service: customer-service.ts (search, getDetail, block, unblock)

text

---

## FASE 7 — Caja diaria

### Prompt 7.1 — Caja

Implementá /dashboard/cash-register.

Vista principal:

Selector de fecha (hoy por default, navegación ← →)
Card principal: TOTAL del día en text-4xl bold, formateado con formatARS()
4 cards de desglose:
💵 Efectivo: $X
🏦 Transferencia: $X
📱 MercadoPago: $X
💳 Tarjeta: $X
Card de stats:
⚽ Turnos jugados: X (bookings completed del día)
✅ Señas cobradas: $X (payments type deposit del día)
⏳ Pendientes de cobro: X (bookings confirmed + no isPaid del día)
Lista de movimientos (protegida por PIN):

Componente envuelto en PinGuard
Cada movimiento: hora, tipo (Seña/Pago), cliente, monto, método
Click → ver reserva asociada
Service: cash-register-service.ts

getDailySummary(complexId, date)
getDailyMovements(complexId, date)
Queries optimizadas con GROUP BY para los totales
Implementar PinGuard:

Componente que muestra modal de PIN la primera vez
Valida contra pinHash del complejo (server action)
Si ok: guarda flag en sessionStorage con timestamp
Si el flag tiene más de 30 min: pide PIN de nuevo
Si 5 intentos fallidos: bloquea 5 min
Mostrar el bloqueo en la UI
text

---

## FASE 8 — MercadoPago

### Prompt 8.1 — OAuth (complejo conecta su cuenta)

Implementá la conexión de MercadoPago en /dashboard/settings/mercadopago.

Vista:

Si NO está conectado:
Explicación: "Conectá tu cuenta de MercadoPago para cobrar señas online"
Botón "Conectar MercadoPago"
Si está conectado:
Estado: "✅ MercadoPago conectado"
Info de la cuenta conectada (email de MP)
Botón "Desconectar" → confirm → limpiar tokens
OAuth flow:

Botón redirige a: https://auth.mercadopago.com/authorization
con client_id, redirect_uri, response_type=code
El dueño se loguea en SU cuenta de MP y autoriza
MP redirige a /dashboard/settings/mercadopago?code=XXX
El server intercepta el code, llama a /oauth/token con code + client_secret
Recibe access_token, refresh_token, expires_in, user_id
Guarda tokens encriptados en la DB
Marca mpConnected = true
Muestra "✅ Conectado"
Service: lib/mercadopago/oauth.ts

exchangeCodeForTokens(code)
refreshAccessToken(complexId)
disconnectMercadoPago(complexId)
Manejo de refresh:

Antes de cada operación MP, verificar mpTokenExpiresAt
Si faltan menos de 7 días: refresh automático
Si refresh falla: marcar mpConnected = false, avisar
text

### Prompt 8.2 — Checkout para señas

Actualización de la página pública para cobrar señas con MercadoPago.

Cuando un cliente reserva online en un complejo que:

Tiene depositEnabled = true
Tiene mpConnected = true
Flujo:

Cliente llena formulario y toca "Confirmar y pagar seña"
Server Action crea el booking (status: confirmed, depositPaid: false)
Server Action crea un MercadoPago Checkout Pro preference:
items: [{ title: "Seña - Cancha X - Fecha", quantity: 1, unit_price: depositAmount }]
payer: { name, phone }
back_urls: { success, failure, pending }
external_reference: bookingId
notification_url: /api/webhooks/mercadopago
Redirige al cliente al checkout de MP
Cliente paga
MP redirige de vuelta a /[slug]/book?status=approved&booking=ID
Mostrar pantalla de confirmación con "Seña pagada ✅"
Service: lib/mercadopago/client.ts

createCheckoutPreference(complexAccessToken, bookingData)
El dinero va directo a la cuenta del complejo.
TurnoGol no toca la plata.

text

### Prompt 8.3 — Webhook de MercadoPago

Implementá /api/webhooks/mercadopago/route.ts

Recibe notificaciones de MP cuando un pago se confirma.

Flow:

MP envía POST con { type: "payment", data: { id: "123" } }
Validar que el request viene de MP (x-signature header)
Buscar el payment en MP API por ID
Obtener external_reference (= bookingId)
Buscar el booking en la DB
Si status del pago es "approved":
Marcar depositPaid = true
Guardar mpPaymentId
Crear Payment en la tabla payments
Log en ActivityLog
Responder 200 OK a MP
Manejar idempotencia: si el booking ya tiene depositPaid = true, no duplicar.

Service: lib/mercadopago/webhooks.ts

text

### Prompt 8.4 — Suscripción del SaaS

Implementá /dashboard/settings/subscription.

Vista:

Plan actual + estado
Si trial: "Prueba gratuita — X días restantes"
Si activo: "Plan [Cancha/Complejo] — Próximo cobro: [fecha]"
Si grace/blocked: "Tu suscripción venció" + botón renovar
Botón "Suscribirse" o "Cambiar plan"
Flow de suscripción:

Crear un MercadoPago Suscripción (preapproval) con:
reason: "TurnoGol - Plan Cancha" (o Complejo)
auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: 47900 }
payer_email: email del complejo
back_url: /dashboard/settings/subscription
Redirige a MP para que el complejo autorice el débito
MP redirige de vuelta
Webhook de suscripción actualiza subscriptionStatus y subscriptionEndsAt
NOTA: la suscripción de MP se hace con TU cuenta de MP (la del SaaS),
no con la del complejo. Es un cobro que VOS le hacés al complejo.

Lógica de verificación diaria (se puede hacer en el middleware o en un cron):

Si trial y trialEndsAt < hoy → status = "grace"
Si grace y hace más de 3 días → status = "blocked"
Esto bloquea la operación del complejo según BLUEPRINT.md
text

---

## FASE 9 — Reportes

### Prompt 9.1 — Reportes y analíticas

Implementá /dashboard/reports.

Toda la página está protegida por PinGuard.

Tabs: Facturación | Ocupación | Operativo

TAB FACTURACIÓN:

Period selector: Hoy / Esta semana / Este mes
Número grande: total facturado en el periodo
Gráfico de barras (recharts): facturación por día
(últimos 7 días si es semana, últimos 30 si es mes)
Tabla: desglose por cancha (nombre, total, % del total)
Tabla: desglose por método de pago
TAB OCUPACIÓN:

Número grande: % de ocupación general
(slots con booking / slots totales del periodo)
Gráfico de barras: ocupación por día de la semana
Tabla: ocupación por cancha
Listas: top 5 horarios más pedidos / bottom 5 menos pedidos
TAB OPERATIVO:

Cards con: total reservas, cancelaciones (n + %),
no-shows (n + %), señas pendientes (n + $), turnos fijos activos
Comparativa simple: "vs. periodo anterior" con flechita ↑↓
Service: report-service.ts con queries optimizadas
Todos los cálculos server-side, no en el cliente.
Gráficos con Recharts (instalar). Usar colores del design system.

text

---

## FASE 10 — Settings

### Prompt 10.1 — Configuración

Implementá /dashboard/settings.

Secciones (tabs o sections scrolleables):

Mi complejo (sin PIN):

Nombre, dirección, teléfono, logo
Horario de operación
Editar y guardar
Señas y pagos (con PIN):

Toggle seña sí/no
Tipo y valor
Alias y CBU para transferencias
Estado de MercadoPago (link a /settings/mercadopago)
Reservas:

Anticipación máxima (select: 3, 5, 7, 10, 14 días)
Minuto de inicio: SOLO LECTURA, muestra el valor configurado
Texto: "Para cambiar esto, contactá soporte."
Política de cancelación:

Radio + input horas (igual que onboarding)
Mensajes de WhatsApp:

4 textareas con los templates
Preview con variables de ejemplo reemplazadas
Botón "Restaurar default" por cada template
PIN de gestión (con PIN actual para acceder):

Input PIN actual + nuevo + confirmar
Validar PIN actual antes de permitir cambio
Suscripción (link a /settings/subscription)

text

---

## FASE 11 — Landing page

### Prompt 11.1 — Landing

Implementá la landing page en / (root).

Secciones:

HERO:

"TurnoGol ⚽" (grande, navy)
"El sistema que ordena tu complejo de fútbol"
"Gestioná reservas, señas, turnos fijos y caja desde un solo lugar."
CTA: "Probalo gratis 14 días" → /register (botón amarillo accent)
Visual: mockup simplificado de la grilla (puede ser un div estilizado
con slots de colores, no necesita ser una captura real)
PROBLEMA:

"¿Te pasa esto?"
Lista con íconos: reservas por WhatsApp, doble reserva,
señas perdidas, turnos fijos en cuaderno, etc.
SOLUCIÓN:

"TurnoGol resuelve todo eso"
Grid 2x3 de features con ícono + título + bajada:
📅 Grilla de turnos | 💰 Señas con MercadoPago
🔄 Turnos fijos automáticos | 📱 WhatsApp integrado
💵 Caja diaria | 📊 Reportes claros
CÓMO FUNCIONA:

3 pasos: Registrate → Configurá → Empezá
PRECIOS:

2 cards lado a lado
Plan Cancha: $47.900/mes, 1-3 canchas, features
Plan Complejo: $73.900/mes, 4+ canchas, features
Badge "14 días gratis" en amarillo
CTA → /register
FAQ (5-6 preguntas con accordion shadcn)

FOOTER:

TurnoGol © 2025
Links placeholder: Términos, Privacidad, Contacto
Mobile-first. Design system. El hero puede usar fondo navy
con texto blanco para contrastar con el resto de la página.

text

---

## FASE 12 — QA y auditoría

### Prompt 12.1 — Auditoría de seguridad y calidad

Revisá toda la aplicación y:

Verificá que TODOS los services reciben complexId como parámetro
y que TODA query filtra por complexId.

Verificá que TODAS las Server Actions validan auth
con getAuthComplex() antes de cualquier operación.

Verificá que no haya ningún "any" en TypeScript.
Buscá "any" en todo el codebase.

Verificá que todos los formularios tengan validación
client-side (UX) Y server-side (seguridad con Zod).

Verificá que la grilla funcione correctamente con cruce
de medianoche (complejo que cierra a las 01:00).

Verificá que los mensajes de WhatsApp se generen bien
con todas las variables reemplazadas.

Verificá que el PIN funcione: hasheo, validación, lockout tras 5 intentos,
expiración a los 30 minutos.

Verificá que las reservas canceladas y no_show liberen el slot
(que el partial unique index permita crear nueva reserva en el mismo slot).

Verificá que las canchas inactivas con reservas futuras
sigan apareciendo en la grilla.

Verificá que el seed funcione y que la app se pueda usar
inmediatamente después de pnpm prisma db seed.

Listá todos los TODOs o features incompletas.

Listá posibles bugs o edge cases.

Proponé mejoras de rendimiento si hay queries ineficientes.
