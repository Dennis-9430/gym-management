/* Utilidades de array */
// Direccion del archivo: src/utils/array/array.utils.ts
// Relacionado con: ClientTable.tsx, EmployeeTable.tsx

/**
 * Filtra array por termino de busqueda en campos especificados
 * @param items - Array a filtrar
 * @param search - Termino de busqueda
 * @param fields - Campos a buscar
 * @returns Array filtrado
 */
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

/**
 * Agrupa array por clave generada
 * @param items - Array a agrupar
 * @param key - Funcion que genera la clave
 * @returns Objeto con claves y arrays
 */
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
