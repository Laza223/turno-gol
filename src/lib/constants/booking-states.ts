export const BOOKING_STATUSES = {
  confirmed: {
    label: "Confirmado",
    color: "green-primary",
  },
  completed: {
    label: "Completado",
    color: "gray-500",
  },
  cancelled: {
    label: "Cancelado",
    color: "red-500",
  },
  no_show: {
    label: "No se presentó",
    color: "red-500",
  },
  blocked: {
    label: "Bloqueado",
    color: "navy",
  },
} as const;

export type BookingStatus = keyof typeof BOOKING_STATUSES;

export const BOOKING_SOURCES = {
  manual: { label: "Manual" },
  online: { label: "Online" },
  phone: { label: "Teléfono" },
  fixed: { label: "Turno fijo" },
} as const;

export type BookingSource = keyof typeof BOOKING_SOURCES;

/**
 * Colores para la grilla según DESIGN_SYSTEM.md
 */
export const GRID_SLOT_STYLES = {
  available: {
    bg: "transparent",
    border: "border-dashed border-gray-300",
  },
  confirmed_deposit: {
    bg: "bg-green-primary/10",
    border: "border-green-primary",
  },
  confirmed_no_deposit: {
    bg: "bg-orange-500/10",
    border: "border-orange-500",
  },
  fixed: {
    bg: "bg-blue-500/10",
    border: "border-blue-500",
  },
  completed: {
    bg: "bg-gray-500/[0.08]",
    border: "border-gray-300",
  },
  blocked: {
    bg: "bg-navy/[0.08]",
    border: "border-navy/30",
  },
} as const;
