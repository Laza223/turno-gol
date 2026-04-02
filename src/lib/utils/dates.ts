import { format, parse, addDays, isWeekend } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Las fechas y horas de reservas son STRINGS, no Date objects.
 * bookingDate: "2025-06-14"
 * startTime: "20:00"
 * Esto evita problemas de timezone.
 */

// ==========================================
// Formateo
// ==========================================

/** "2025-06-14" → "viernes 14 de junio" */
export function formatBookingDate(dateStr: string): string {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

/** 0 → "domingo", 1 → "lunes", ..., 6 → "sábado" */
export function formatDayOfWeek(dayOfWeek: number): string {
  const days = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  return days[dayOfWeek] ?? "desconocido";
}

// ==========================================
// Consultas de fecha
// ==========================================

/** Retorna true si la fecha es sábado o domingo */
export function isWeekendDate(dateStr: string): boolean {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  return isWeekend(date);
}

/** Retorna la fecha de hoy como string "2025-06-14" */
export function todayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Retorna la hora actual como string "20:30" */
export function currentTimeString(): string {
  return format(new Date(), "HH:mm");
}

/** Retorna un array de N fechas empezando desde hoy: ["2025-06-14", "2025-06-15", ...] */
export function getNextNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < n; i++) {
    dates.push(format(addDays(new Date(), i), "yyyy-MM-dd"));
  }
  return dates;
}

// ==========================================
// Slots
// ==========================================

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

/**
 * Convierte "HH:mm" a minutos desde medianoche.
 * "14:00" → 840, "00:30" → 30
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Convierte minutos desde medianoche a "HH:mm".
 * 840 → "14:00", 30 → "00:30"
 */
function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Genera los slots de un día para un complejo.
 *
 * Manejo de cruce de medianoche (ARCHITECTURE.md):
 * Si closeTime < openTime → cruza medianoche.
 * Ejemplo: openTime "14:00", closeTime "01:00"
 * → genera slots desde 14:00 hasta 00:00 (último slot 00:00-01:00)
 *
 * @param openTime  - Hora de apertura ("14:00")
 * @param closeTime - Hora de cierre ("01:00")
 * @param slotStartMinute - Minuto de inicio de cada slot (0, 15, o 30)
 * @returns Array de TimeSlot con startTime y endTime
 */
export function generateSlots(
  openTime: string,
  closeTime: string,
  slotStartMinute: number
): TimeSlot[] {
  const SLOT_DURATION = 60; // minutos
  const slots: TimeSlot[] = [];

  let openMinutes = timeToMinutes(openTime);
  let closeMinutes = timeToMinutes(closeTime);

  // Ajustar openTime al slotStartMinute más cercano hacia adelante
  const openHour = Math.floor(openMinutes / 60);
  const firstSlotMinutes = openHour * 60 + slotStartMinute;
  if (firstSlotMinutes < openMinutes) {
    openMinutes = firstSlotMinutes + 60;
  } else {
    openMinutes = firstSlotMinutes;
  }

  // Si cruza medianoche, sumar 1440 al cierre para que sea > apertura
  const crossesMidnight = closeMinutes <= openMinutes;
  if (crossesMidnight) {
    closeMinutes += 1440;
  }

  let current = openMinutes;
  while (current + SLOT_DURATION <= closeMinutes) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + SLOT_DURATION),
    });
    current += SLOT_DURATION;
  }

  return slots;
}
