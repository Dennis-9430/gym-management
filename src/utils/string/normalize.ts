/* Utilidades de normalizacion de texto */
// Direccion del archivo: src/utils/string/normalize.ts
// Relacionado con: ListClients.tsx, ClientSearch.tsx

/**
 * Normaliza texto para busqueda (minusculas, sin acentos)
 * @param value - Texto a normalizar
 * @returns Texto normalizado
 */
export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Normaliza numero de documento para comparacion
 * @param value - Numero de documento
 * @returns Documento normalizado
 */
export const normalizeDocument = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

/**
 * Verifica si el valor contiene todos los tokens de busqueda
 * @param value - Valor a buscar
 * @param query - Query de busqueda
 * @returns true si todos los tokens coinciden
 */
export const matchesQuery = (value: string, query: string) => {
  const normalizedValue = normalizeText(value);
  const tokens = normalizeText(query).split(" ").filter(Boolean);
  if (!tokens.length) {
    return true;
  }
  return tokens.every((token) => normalizedValue.includes(token));
};
