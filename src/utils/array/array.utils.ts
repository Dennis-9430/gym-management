/* Filtra array por termino de busqueda en campos especificados */
export const filterBySearch = <T>(
  items: T[],
  search: string,
  fields: (keyof T)[],
): T[] => {
  if (!search.trim()) return items;
  
  const term = search.toLowerCase();
  
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return typeof value === "string" && value.toLowerCase().includes(term);
    })
  );
};

/* Agrupa array por clave generada */
export const groupBy = <T, K extends string | number>(
  items: T[],
  key: (item: T) => K,
): Record<K, T[]> => {
  return items.reduce((acc, item) => {
    const groupKey = key(item);
    (acc[groupKey] = acc[groupKey] || []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
};
