import type { BookingStatus, BookingSource } from "@/lib/constants/booking-states";
import type { PaymentMethod, PaymentType } from "@/lib/constants/payment-methods";

// ==========================================
// ActionResult — patrón para Server Actions
// ==========================================

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ==========================================
// Booking
// ==========================================

export interface CreateBookingInput {
  courtId: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  depositPaid: boolean;
  source: BookingSource;
  notes?: string;
}

export interface BlockSlotInput {
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  blockNote?: string;
}

export interface CollectBookingInput {
  bookingId: string;
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface BookingWithRelations {
  id: string;
  complexId: string;
  courtId: string;
  customerId: string | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  source: BookingSource;
  price: number;
  depositAmount: number | null;
  depositPaid: boolean;
  isPaid: boolean;
  paymentMethod: string | null;
  fixedSlotId: string | null;
  blockNote: string | null;
  notes: string | null;
  court: {
    id: string;
    name: string;
    playerCount: number;
    surface: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    isBlocked: boolean;
    blockReason: string | null;
  } | null;
}

// ==========================================
// Court
// ==========================================

export interface CreateCourtInput {
  name: string;
  playerCount: number;
  surface: string;
  isRoofed: boolean;
  price: number;
  priceWeekend: number | null;
}

export interface UpdateCourtInput extends Partial<CreateCourtInput> {
  isActive?: boolean;
}

// ==========================================
// Customer
// ==========================================

export interface CreateCustomerInput {
  name: string;
  phone: string;
}

export interface CustomerWithStats {
  id: string;
  name: string;
  phone: string;
  isBlocked: boolean;
  blockReason: string | null;
  totalBookings: number;
  totalCancellations: number;
  totalNoShows: number;
  lastBookingDate: string | null;
}

// ==========================================
// Fixed Slot
// ==========================================

export interface CreateFixedSlotInput {
  courtId: string;
  customerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export type FixedSlotStatus = "active" | "paused" | "cancelled";

// ==========================================
// Payment
// ==========================================

export interface CreatePaymentInput {
  bookingId: string;
  type: PaymentType;
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
}

// ==========================================
// Complex / Onboarding
// ==========================================

export interface RegisterInput {
  email: string;
  password: string;
  complexName: string;
}

export interface OnboardingComplexInput {
  name: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
}

export interface OnboardingCourtsInput {
  courts: CreateCourtInput[];
}

export interface OnboardingScheduleInput {
  slotStartMinute: number;
}

export interface OnboardingDepositInput {
  depositEnabled: boolean;
  depositType: "percentage" | "fixed" | null;
  depositValue: number | null;
  transferAlias: string | null;
  transferCbu: string | null;
}

export interface OnboardingCancellationInput {
  cancellationPolicy: "lose" | "refund";
  cancellationHours: number | null;
}

export interface OnboardingPinInput {
  pin: string;
  pinConfirmation: string;
}

// ==========================================
// Grilla
// ==========================================

export interface GridSlotData {
  startTime: string;
  endTime: string;
  booking: BookingWithRelations | null;
}

export interface GridCourtData {
  courtId: string;
  courtName: string;
  isActive: boolean;
  playerCount: number;
  surface: string;
  price: number;
  priceWeekend: number | null;
  slots: GridSlotData[];
}

// ==========================================
// Caja
// ==========================================

export interface DailyCashSummary {
  date: string;
  total: number;
  byMethod: Record<PaymentMethod, number>;
  turnosCompleted: number;
  depositsCollected: number;
  turnosPending: number;
}

// ==========================================
// Superficie (para select)
// ==========================================

export const COURT_SURFACES = {
  sintetico: "Sintético",
  natural: "Natural",
  cemento: "Cemento",
} as const;

export type CourtSurface = keyof typeof COURT_SURFACES;
