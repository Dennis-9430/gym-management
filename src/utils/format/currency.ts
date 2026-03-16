export const formatCurrency = (value: number, currency = "USD"): string => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency,
  }).format(value);
};

export const round2 = (value: number): number => {
  return Math.round(value * 100) / 100;
};
