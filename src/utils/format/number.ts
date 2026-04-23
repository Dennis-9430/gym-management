/* Utilidades de formato de numeros */
// Direccion del archivo: src/utils/format/number.ts
// Relacionado con: ProductForm.tsx, PaymentModal.tsx

/**
 * Convierte string a numero decimal
 * @param raw - String a convertir
 * @returns Numero decimal
 */
export const parseDecimal = (raw: string) => {
  const normalized = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const [whole, decimal] = normalized.split(".");
  const value = Number(decimal !== undefined ? `${whole}.${decimal}` : whole);
  return Number.isFinite(value) ? value : 0;
};

/**
 * Redondea a 2 decimales
 * @param value - Numero a redondear
 * @returns Numero redondeado
 */
export const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Limita porcentaje entre 0 y 100
 * @param value - Porcentaje a validar
 * @returns Porcentaje valido
 */
export const clampPercent = (value: number) => {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 100);
};
