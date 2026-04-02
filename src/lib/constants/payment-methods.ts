export const PAYMENT_METHODS = {
  cash: {
    label: "Efectivo",
    icon: "Banknote",
  },
  transfer: {
    label: "Transferencia",
    icon: "Building2",
  },
  mercadopago: {
    label: "MercadoPago",
    icon: "Smartphone",
  },
  debit: {
    label: "Débito",
    icon: "CreditCard",
  },
  credit: {
    label: "Crédito",
    icon: "CreditCard",
  },
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export const PAYMENT_TYPES = {
  deposit: { label: "Seña" },
  booking_payment: { label: "Pago de turno" },
  refund: { label: "Reintegro" },
} as const;

export type PaymentType = keyof typeof PAYMENT_TYPES;
