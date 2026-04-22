/* Tests para utilerias de formato */
/* Relacionado con: src/utils/format/* */
import { describe, it, expect } from 'vitest';
import { parseDecimal, round2, clampPercent } from '../utils/format/number';
import { formatCurrency } from '../utils/format/currency';

describe('Format Number Utils', () => {
  describe('parseDecimal', () => {
    it('debe parsear numero con coma', () => {
      expect(parseDecimal('10,50')).toBe(10.5);
    });

    it('debe parsear numero sin coma', () => {
      expect(parseDecimal('100')).toBe(100);
    });

    it('debe manejar string vacio', () => {
      expect(parseDecimal('')).toBe(0);
    });

    it('debe manejar valores invalidos', () => {
      expect(parseDecimal('abc')).toBe(0);
    });
  });

  describe('round2', () => {
    it('debe redondear a 2 decimales', () => {
      expect(round2(10.255)).toBe(10.26);
    });

    it('debe mantener valores con 2 decimales', () => {
      expect(round2(10.25)).toBe(10.25);
    });
  });

  describe('clampPercent', () => {
    it('debe mantener valor dentro del rango', () => {
      expect(clampPercent(50)).toBe(50);
    });

    it('debe limitar valor mayor a 100', () => {
      expect(clampPercent(150)).toBe(100);
    });

    it('debe limitar valor menor a 0', () => {
      expect(clampPercent(-10)).toBe(0);
    });

    it('debe manejar NaN', () => {
      expect(clampPercent(NaN)).toBe(0);
    });
  });
});

describe('Format Currency Utils', () => {
  describe('formatCurrency', () => {
    it('debe formatear numero a moneda USD', () => {
      const result = formatCurrency(100);
      expect(result).toContain('100');
    });

    it('debe formatear con decimales', () => {
      const result = formatCurrency(99.99);
      expect(result).toContain('99');
    });

    it('debe formatear cero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });
});