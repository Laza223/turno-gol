import { isWeekendDate } from "./dates";

interface CourtForPricing {
  price: number;
  priceWeekend: number | null;
}

/**
 * Calcula el precio de una cancha para una fecha dada.
 * Si la cancha tiene precio de fin de semana y la fecha es sábado/domingo,
 * retorna el precio de fin de semana. Si no, retorna el precio base.
 */
export function getCourtPrice(
  court: CourtForPricing,
  dateStr: string
): number {
  if (court.priceWeekend && isWeekendDate(dateStr)) {
    return court.priceWeekend;
  }
  return court.price;
}
