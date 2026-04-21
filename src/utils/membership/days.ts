import { normalizeText } from "../string/normalize";

/* Obtiene duracion en dias segun nombre del servicio */
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
