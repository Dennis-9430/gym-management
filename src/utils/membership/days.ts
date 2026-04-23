/* Utilidades de duracion de membresia */
// Direccion del archivo: src/utils/membership/days.ts
// Relacionado con: SubscriptionModal.tsx, SalesPages.tsx

import { normalizeText } from "../string/normalize";

/**
 * Obtiene duracion en dias segun nombre del servicio
 * @param serviceName - Nombre del servicio
 * @returns Dias de duracion (1, 15, o 30)
 */
export const getMembershipDays = (serviceName: string) => {
  const normalized = normalizeText(serviceName);
  if (normalized.includes("quincenal")) {
    return 15;
  }
  if (normalized.includes("diario")) {
    return 1;
  }
  return 30;
};
