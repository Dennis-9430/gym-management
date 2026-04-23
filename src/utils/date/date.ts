/* Utilidades de fechas */
// Direccion del archivo: src/utils/date/date.ts
// Relacionado con: ClientProfile.tsx, MembershipModal.tsx

/**
 * Convierte string YYYY-MM-DD a objeto Date
 * @param value - String en formato YYYY-MM-DD
 * @returns Objeto Date
 */
export const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Suma dias a una fecha
 * @param date - Fecha original
 * @param days - Dias a agregar
 * @returns Nueva fecha
 */
export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
