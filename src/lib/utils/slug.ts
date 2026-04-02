/**
 * Genera un slug URL-friendly a partir de un nombre.
 * "La Cancha de Juan" → "la-cancha-de-juan"
 * "Fútbol 5 - Centro" → "futbol-5-centro"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s-]/g, "") // Solo alfanuméricos, espacios y guiones
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Colapsar guiones múltiples
    .replace(/^-|-$/g, ""); // Remover guiones al inicio/final
}
