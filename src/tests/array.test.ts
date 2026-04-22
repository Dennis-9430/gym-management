/* Tests para utilerias de array */
/* Relacionado con: src/utils/array/* */
import { describe, it, expect } from 'vitest';
import { filterBySearch, groupBy } from '../utils/array/array.utils';

interface Item {
  id: number;
  name: string;
  category: string;
}

describe('Array Utils', () => {
  describe('filterBySearch', () => {
    const items: Item[] = [
      { id: 1, name: 'Juan Perez', category: 'clientes' },
      { id: 2, name: 'Maria Garcia', category: 'clientes' },
      { id: 3, name: 'Carlos Lopez', category: 'entrenadores' },
    ];

    it('debe retornar todos los items si busqueda vacia', () => {
      expect(filterBySearch(items, '', ['name'])).toEqual(items);
    });

    it('debe filtrar por nombre', () => {
      const result = filterBySearch(items, 'juan', ['name']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Juan Perez');
    });

    it('debe ser case insensitive', () => {
      const result = filterBySearch(items, 'MARIA', ['name']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Maria Garcia');
    });

    it('debe retornar array vacio si no hay coincidencias', () => {
      const result = filterBySearch(items, 'xyz', ['name']);
      expect(result).toHaveLength(0);
    });

    it('debe buscar en multiples campos', () => {
      const result = filterBySearch(items, 'clientes', ['name', 'category']);
      expect(result).toHaveLength(2);
    });
  });

  describe('groupBy', () => {
    it('debe agrupar por categoria', () => {
      const items = [
        { name: 'A', category: 'x' },
        { name: 'B', category: 'x' },
        { name: 'C', category: 'y' },
      ];
      const result = groupBy(items, (item) => item.category);
      expect(result['x']).toHaveLength(2);
      expect(result['y']).toHaveLength(1);
    });

    it('debe manejar array vacio', () => {
      const result = groupBy([], (item: any) => item.category);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });
});