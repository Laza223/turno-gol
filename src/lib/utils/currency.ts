/**
 * Los precios se guardan como Int en la DB (pesos enteros).
 * $25.000 se guarda como 25000.
 */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
