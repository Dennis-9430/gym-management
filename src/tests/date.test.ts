/* Tests para utilerias de fecha */
/* Relacionado con: src/utils/date/* */
import { describe, it, expect } from 'vitest';
import { parseDateInput, addDays } from '../utils/date/date';

describe('Date Utils', () => {
  describe('parseDateInput', () => {
    it('debe convertir string a Date', () => {
      const date = parseDateInput('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
    });

    it('debe manejar fecha con ceros', () => {
      const date = parseDateInput('2024-01-01');
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it('debe manejar mes de 2 digitos', () => {
      const date = parseDateInput('2024-12-25');
      expect(date.getMonth()).toBe(11);
    });
  });

  describe('addDays', () => {
    it('debe sumar dias positivos', () => {
      const date = new Date(2024, 0, 1);
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(6);
    });

    it('debe restar dias negativos', () => {
      const date = new Date(2024, 0, 10);
      const result = addDays(date, -3);
      expect(result.getDate()).toBe(7);
    });

    it('debe manejar cambio de mes', () => {
      const date = new Date(2024, 0, 28);
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(1);
    });

    it('debe mantener fecha original sin mutar', () => {
      const original = new Date(2024, 0, 1);
      const originalDay = original.getDate();
      addDays(original, 5);
      expect(original.getDate()).toBe(originalDay);
    });
  });
});