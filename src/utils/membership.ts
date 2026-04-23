
/* Utilidades de membresia */
// Direccion del archivo: src/utils/membership.ts
// Relacionado con: ClientProfile.tsx, ListClients.tsx

/**
 * Calcula dias restantes hasta fecha de fin
 * @param endDate - Fecha de fin de membresia
 * @returns Dias restantes (negativo si vencida)
 */
export const getDaysRemaining = (endDate: Date) => {
  const today = new Date();
  const diff = endDate.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
};

/**
 * Retorna estado de membresia segun dias restantes
 * @param endDate - Fecha de fin
 * @returns Estado (ACTIVE o EXPIRED)
 */
export const getMembershipStatus = (endDate: Date) => {
  const days = getDaysRemaining(endDate);
  if (days <= 0) return "EXPIRED";
  return "ACTIVE";
};
