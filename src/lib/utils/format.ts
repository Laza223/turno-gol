export function formatARS(amount: number | null | undefined): string {
    if (amount == null) return "$0";
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
