/* Convierte string a número decimal */
export const parseDecimal = (raw: string) => {
  const normalized = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const [whole, decimal] = normalized.split(".");
  const value = Number(decimal !== undefined ? `${whole}.${decimal}` : whole);
  return Number.isFinite(value) ? value : 0;
};

/* Redondea a 2 decimales */
export const round2 = (value: number) => Math.round(value * 100) / 100;

/* Limita porcentaje entre 0 y 100 */
export const clampPercent = (value: number) => {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 100);
};
