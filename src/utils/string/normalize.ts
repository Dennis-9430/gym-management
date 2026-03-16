export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeDocument = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const matchesQuery = (value: string, query: string) => {
  const normalizedValue = normalizeText(value);
  const tokens = normalizeText(query).split(" ").filter(Boolean);
  if (!tokens.length) {
    return true;
  }
  return tokens.every((token) => normalizedValue.includes(token));
};
