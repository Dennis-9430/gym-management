/* Normaliza texto para busqueda (minusculas, sin acentos) */
export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* Normaliza numero de documento para comparacion */
export const normalizeDocument = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

/* Verifica si el valor contiene todos los tokens de busqueda */
export const matchesQuery = (value: string, query: string) => {
  const normalizedValue = normalizeText(value);
  const tokens = normalizeText(query).split(" ").filter(Boolean);
  if (!tokens.length) {
    return true;
  }
  return tokens.every((token) => normalizedValue.includes(token));
};
