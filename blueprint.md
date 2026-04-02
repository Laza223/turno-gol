# TurnoGol

## Qué es TurnoGol

TurnoGol es un SaaS de gestión para complejos de fútbol en Argentina. Tiene dos caras:

- **Panel interno:** para que el dueño o recepcionista gestione reservas, caja, turnos fijos y clientes.
- **Página pública:** para que los clientes del complejo vean disponibilidad, reserven y paguen señas.

No es un marketplace. No es una app para que jugadores descubran canchas. Es el sistema interno del complejo con un canal de reservas directo.

## Modelo de negocio

- **Plan CANCHA** (1-3 canchas): $47.900/mes
- **Plan COMPLEJO** (4+ canchas): $73.900/mes
- **Trial gratuito:** 14 días con funcionalidad completa, sin tarjeta
- **Sin plan gratuito permanente**
- **Sin cobro de setup**
- **Cobro:** MercadoPago Suscripciones (pesos argentinos)
- **Fallback:** transferencia bancaria (gestión manual)

### Ciclo de suscripción

Registro → Trial 14 días → Vence trial → 3 días de gracia → Bloqueo
↓
Paga → Activo 30 días → Renueva automático

### Bloqueo por falta de pago

- **Trial vencido o suscripción vencida:** 3 días de gracia con banner de aviso.
- **Después de 3 días:** se bloquea. Puede ver datos pero no crear ni editar nada. La página pública muestra "Reservas deshabilitadas temporalmente".
- **Después de 60 días bloqueado:** se marca para eliminación (manual por ahora).
- **Si paga en cualquier momento:** se reactiva inmediatamente.

## Usuarios

- Una cuenta por complejo: email + contraseña.
- Sin límite artificial de sesiones simultáneas.
- **PIN de 4-6 dígitos** para proteger secciones sensibles:
  - Reportes y analíticas
  - Configuración de precios
  - Suscripción y facturación
- El PIN se hashea con bcrypt.
- Después de 5 intentos fallidos del PIN: bloqueo de 5 minutos.
- El PIN "desbloqueado" expira tras 30 minutos de inactividad o al cerrar pestaña.
- Sin roles ni múltiples cuentas de usuario por complejo.

## Canchas

Cada cancha tiene:

- **Nombre:** texto libre (ej: "Cancha 1", "La Principal")
- **Cantidad de jugadores:** número libre (5, 6, 7, 8, 9, 10, 11)
- **Superficie:** sintético / natural / cemento
- **Techada:** sí/no (solo informativo, no afecta ninguna lógica)
- **Precio base:** en pesos, número entero (ej: 25000)
- **Precio fin de semana:** opcional. Si se deja vacío, usa el precio base. Si se llena, sábado y domingo usan este precio.
- **Activa:** sí/no. Si se desactiva, no aparece en la grilla ni en la web pública para nuevas reservas, PERO si tiene reservas futuras, esas reservas siguen visibles en la grilla con indicador visual de cancha inactiva.

### Turnos

- Duración fija: **60 minutos**.
- **Minuto de inicio configurable en el onboarding:**
  - En punto (:00) ← default
  - Y cuarto (:15)
  - Y media (:30)
- **Una vez configurado, el minuto de inicio NO se puede cambiar** desde settings. Si necesitan cambiarlo, contactan soporte.
- El slot empieza en el minuto configurado: si es :15, los slots son 14:15-15:15, 15:15-16:15, etc.

### Horario de operación

- Un solo horario para todo el complejo: hora de apertura + hora de cierre.
- **Operación después de medianoche:** si closeTime < openTime, significa que cruza medianoche. Ejemplo: openTime "14:00", closeTime "01:00" → los slots de 00:00 y 00:15 (según config) pertenecen al DÍA ANTERIOR operativamente.
- Los slots de madrugada tienen bookingDate del día en que empezó la noche. El viernes a las 00:30 tiene bookingDate del viernes.
- El precio de esos slots se calcula según el día operativo (viernes), no el día calendario (sábado).
- La grilla del viernes muestra los slots hasta la hora de cierre (01:00). La grilla del sábado empieza en la hora de apertura (14:00).

## Reservas

### Estados de una reserva

| Estado      | Significado                  | Color en grilla                        |
| ----------- | ---------------------------- | -------------------------------------- |
| `confirmed` | Reserva activa, va a jugarse | Verde (si señó) / Naranja (si no señó) |
| `completed` | Se jugó, se cobró            | Gris                                   |
| `cancelled` | Cancelada                    | No visible (slot libre)                |
| `no_show`   | No se presentó               | No visible (slot libre)                |
| `blocked`   | Slot bloqueado sin reserva   | Gris oscuro                            |

Las reservas canceladas y no_show NO ocupan el slot. El slot queda libre para nuevas reservas.

### Indicador de seña (solo si el complejo usa seña)

- **Señada (🟢):** fondo verde claro, borde verde
- **Sin señar (🟡):** fondo naranja claro, borde naranja

### Turno fijo

- **Fondo azul claro, borde azul, badge "FIJO"**

### Reserva manual (recepcionista desde el panel)

1. Toca un slot libre en la grilla.
2. Se abre formulario (Sheet en mobile, panel lateral en desktop).
3. Campos:
   - Cancha: pre-seleccionada
   - Fecha: pre-seleccionada
   - Horario: pre-seleccionado
   - Precio: auto-calculado según cancha + día (base o finde). Solo lectura.
   - Nombre del cliente: input con autocomplete (busca en customers por nombre o teléfono). Si no existe, se crea automáticamente.
   - Teléfono: input, se autocompleta si eligió un cliente existente.
   - Si el complejo tiene seña activada: toggle "¿Señó?" con monto calculado.
   - Notas: texto libre opcional.
4. Confirma → reserva creada.
5. Después de crear: botón "📱 Enviar confirmación por WhatsApp".

### Reserva online (cliente desde la web pública)

1. Entra a turnogol.com/[slug].
2. Ve calendario con próximos N días (configurable, default 7).
3. Elige día → ve canchas con horarios disponibles y precios.
4. Elige cancha + horario.
5. Ingresa nombre + teléfono.
6. Si el complejo cobra seña y tiene MP conectado → paga por MercadoPago.
7. Si el complejo cobra seña sin MP → se confirma y le indica transferir a alias/CBU del complejo.
8. Si no cobra seña → confirma directo.
9. Ve pantalla de confirmación.
10. Si el teléfono pertenece a un cliente bloqueado → no puede completar, mensaje genérico "Contactá al complejo".

### Bloquear un slot

- Recepcionista puede bloquear un slot sin datos de cliente.
- Motivo opcional (texto libre).
- Aparece como gris oscuro con "Bloqueado" + motivo.
- Se desbloquea manualmente.

### Anticipación

- **Máxima:** 7 días (configurable por complejo).
- **Mínima:** sin mínimo (configurable por complejo). Default: sin restricción.

### Cancelar una reserva

- Recepcionista cancela manualmente desde el detalle.
- El slot se libera inmediatamente.
- Si tenía seña pagada por MP: NO hay reintegro automático en MVP. El complejo lo gestiona por fuera.
- La política de cancelación se muestra en la página pública como texto informativo, configurada por el complejo.

### Regla del precio

- El precio se fija al momento de crear la reserva. Si el complejo cambia precios después, las reservas existentes no cambian.

### Múltiples reservas

- Un cliente puede tener varias reservas activas sin restricción.

## Señas y pagos

### Configuración por complejo (en onboarding/settings)

- **¿Usa seña?** sí / no
- **Tipo:** porcentaje o monto fijo
- **Valor:** ej. 30 (para 30%) o 8000 (para $8.000)
- **¿Tiene MercadoPago conectado?** sí / no
- **Alias para transferencia:** texto libre (para complejos sin MP)
- **CBU para transferencia:** texto libre (para complejos sin MP)

### Escenarios

1. **Sin seña, sin MP:** reserva se confirma directo, paga todo en persona.
2. **Con seña, sin MP:** recepcionista marca señó/no señó manualmente. Si es reserva online, se le indica al cliente que transfiera al alias/CBU del complejo.
3. **Con seña, con MP:** reserva online paga por MP; reserva manual marca señó/no señó.
4. **Sin seña, con MP:** reserva se confirma directo (MP no se usa).

### Pago del turno completo

- Siempre en persona.
- Recepcionista abre la reserva → marca "Cobrado" → selecciona método de pago → ingresa monto (pre-llenado con precio, editable).
- Crea un registro de pago y marca la reserva como `completed`.

### MercadoPago para señas

- Complejo conecta su cuenta via OAuth (se hace una vez en settings).
- Dinero de las señas va directo a la cuenta del complejo.
- TurnoGol NO toca la plata.
- Comisión de MP la asume el complejo.
- Los tokens de MP se guardan encriptados.
- El refresh de tokens se maneja automáticamente: antes de cada operación, se verifica si el token está por expirar (menos de 7 días). Si sí, se renueva con el refresh_token.

### Política de cancelación

Configurable por complejo:

- **"La seña se pierde"** (default)
- **"Se devuelve si cancela con más de X horas de anticipación"** (configurable el X)
- Se muestra en la página pública antes de que el cliente confirme la reserva.
- El sistema NO ejecuta reintegros automáticos. Es información para el cliente y protección legal para el complejo.

## Turnos fijos

Un turno fijo es una reserva que se repite automáticamente todas las semanas.

### Datos

- Cliente (nombre + teléfono)
- Cancha
- Día de la semana (lunes, martes, etc.)
- Horario (inicio → fin)
- Estado: activo / pausado / cancelado

### Funcionamiento

- El complejo crea el turno fijo → el sistema genera reservas para las próximas 4 semanas.
- Un cron job (cada lunes a las 03:00 AM) genera las reservas de la semana siguiente para todos los fijos activos.
- Las reservas generadas tienen: status `confirmed`, source `fixed`, vinculadas al turno fijo.
- Pagan en persona cuando vienen, sin seña.
- Visual en la grilla: fondo azul claro, borde azul, badge "FIJO".

### Si el fijo no viene una semana

- El complejo cancela ESA reserva manualmente.
- El slot se libera.
- El turno fijo sigue activo, la semana siguiente se genera de nuevo.
- Si se olvidan de cancelar → es problema del complejo.

### Cancelar turno fijo definitivamente

- El complejo lo cancela desde la sección de turnos fijos.
- Se cancelan las reservas futuras ya generadas.
- No se generan más.

### Múltiples fijos del mismo cliente

- Si Juan juega martes y jueves, se crean 2 turnos fijos independientes.

## Lista negra de clientes

- En la ficha del cliente: botón "Bloquear" + motivo opcional.
- **Reserva manual:** recepcionista ve aviso "⚠️ Cliente bloqueado: [motivo]". Puede continuar si quiere (es aviso, no bloqueo duro).
- **Reserva online:** si el teléfono coincide con un cliente bloqueado, no permite completar. Mensaje: "No se pudo procesar tu reserva. Contactá al complejo."
- Se puede desbloquear en cualquier momento.

## Caja diaria

### Vista principal

- Fecha de hoy (navegación ← →).
- **Total del día** en número grande.
- Desglose por método de pago:
  - 💵 Efectivo
  - 🏦 Transferencia
  - 📱 MercadoPago
  - 💳 Tarjeta (débito/crédito)
- Stats:
  - ⚽ Turnos jugados hoy
  - ✅ Señas cobradas
  - ⏳ Turnos pendientes de cobro (confirmados pero no pagados)
- Lista de movimientos del día (cada pago registrado, con hora, tipo, cliente, monto, método).

### Qué NO incluye

- Buffet / cantina
- Alquileres de extras
- Gastos / egresos
- Apertura/cierre formal de caja

### Acceso

- Resumen y stats: sin PIN.
- Lista detallada de movimientos: protegida por PIN.

## WhatsApp (MVP)

Implementación: **copy-paste inteligente, sin API de WhatsApp.**

En cada reserva, botones que abren wa.me con el mensaje pre-armado:

- "📱 Enviar confirmación"
- "📱 Pedir seña" (con alias/CBU del complejo)
- "📱 Recordar turno"
- "📱 Avisar cancelación"

### Templates editables

- Cada complejo puede editar los templates desde settings.
- Variables disponibles: `{nombre}`, `{fecha}`, `{hora}`, `{cancha}`, `{precio}`, `{seña}`, `{complejo}`, `{alias}`, `{cbu}`
- Templates default incluidos al crear el complejo.

### Lo que NO hay en MVP

- Bot automático
- Envío masivo
- Lectura de respuestas
- Integración con API de WhatsApp

## Reportes y analíticas

Protegidos por PIN.

### Facturación

- Periodo: hoy / esta semana / este mes
- Total del periodo (número grande)
- Gráfico de barras: facturación por día
- Tabla: desglose por cancha
- Tabla: desglose por método de pago

### Ocupación

- Porcentaje general (número grande con %)
- Gráfico: ocupación por día de la semana
- Tabla: ocupación por cancha
- Top 5 horarios más pedidos / bottom 5 menos pedidos

### Operativo

- Total reservas del periodo
- Cancelaciones (cantidad + %)
- No-shows (cantidad + %)
- Señas pendientes (cantidad + monto)
- Turnos fijos activos

### Sin exportación en MVP (futuro)

## Página pública de reservas

URL: `turnogol.com/[slug-del-complejo]`

### Qué muestra

- Nombre del complejo + logo (si tiene)
- Dirección
- Teléfono con botón de WhatsApp
- Calendario: próximos N días (pills horizontales scrolleables)
- Al elegir día: lista de canchas, cada una con horarios disponibles y precio
- El cliente elige la cancha específica + horario
- Formulario: nombre + teléfono → pago seña (si aplica) → confirmación
- Política de cancelación visible antes de confirmar
- Sin login requerido para el cliente

### Qué NO muestra (MVP)

- Fotos del complejo
- Mapa interactivo
- Servicios/comodidades
- Reseñas

### Footer

"Gestionado con TurnoGol ⚽" (link a la landing)

## Onboarding (wizard post-registro)

1. **Datos del complejo:** nombre (pre-llenado del registro), dirección, teléfono, logo (upload opcional), horario de operación (apertura + cierre).
2. **Canchas:** agregar canchas una por una. Mínimo 1. Campos: nombre, jugadores, superficie, techada, precio, precio finde (opcional).
3. **Horarios de turnos:** "¿A qué minuto arrancan tus turnos?" Radio: :00 (default), :15, :30.
4. **Señas:** toggle "¿Cobrás seña?" → tipo (porcentaje/fijo) + valor. Alias/CBU para transferencias. Botón "Conectar MercadoPago" (opcional, se puede después).
5. **Política de cancelación:** radio: "La seña se pierde" (default) / "Se devuelve si cancela con más de X horas" + input horas.
6. **PIN de gestión:** crear PIN de 4-6 dígitos + confirmar.
7. **Listo:** "¡TurnoGol está listo! Tu página de reservas: turnogol.com/tu-slug" → botón "Ir a la grilla".

Cada paso guarda progreso. Si cierra y vuelve, retoma donde dejó.
