/**
 * Limpia un número de teléfono y agrega código de país 54 si falta.
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, "");

  if (cleaned.startsWith("54")) {
    return cleaned;
  }

  // Si empieza con 0 (ej: 011), remover el 0 y agregar 54
  if (cleaned.startsWith("0")) {
    return `54${cleaned.slice(1)}`;
  }

  return `54${cleaned}`;
}

/**
 * Valida formatos argentinos comunes:
 * - 11 1234-5678 (celular AMBA)
 * - 221 123-4567 (celular interior)
 * - +54 9 11 1234-5678
 * - 011 1234-5678
 * Acepta espacios, guiones y paréntesis como separadores.
 */
export function validateArgentinePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Con código de país: 54 + 9 (opcional) + 10-11 dígitos
  if (/^54\d{10,12}$/.test(cleaned)) return true;

  // Sin código de país: 10-11 dígitos (con o sin 0 inicial)
  if (/^0?\d{10,11}$/.test(cleaned)) return true;

  // Con + adelante
  if (/^\+54\d{10,12}$/.test(cleaned)) return true;

  return false;
}
