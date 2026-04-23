/* Utilidades de formato de moneda */
// Direccion del archivo: src/utils/format/currency.ts
// Relacionado con: SalesPages.tsx, FinancialDashboard.tsx

/**
 * Formatea numero a moneda
 * @param value - Numero a formatear
 * @param currency - Codigo de moneda (default: USD)
 * @returns String formateado (ej: $10.00)
 */
export const formatCurrency = (value: number, currency = "USD"): string => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency,
  }).format(value);
};

/**
 * Redondea numero a 2 decimales
 * @param value - Numero a redondear
 * @returns Numero redondeado
 */
export const round2 = (value: number): number => {
  return Math.round(value * 100) / 100;
};
