/* Tests para tipos de productos */
/* Relacionado con: src/types/product.types.ts */
import { describe, it, expect } from 'vitest';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
} from '../types/product.types';

describe('Product Types', () => {
  describe('PRODUCT_CATEGORIES', () => {
    it('debe tener 5 categorias', () => {
      expect(PRODUCT_CATEGORIES).toHaveLength(5);
    });

    it('debe incluir SUPLEMENTOS', () => {
      expect(PRODUCT_CATEGORIES).toContain('SUPLEMENTOS');
    });

    it('debe incluir BEBIDAS', () => {
      expect(PRODUCT_CATEGORIES).toContain('BEBIDAS');
    });

    it('debe incluir ACCESORIOS', () => {
      expect(PRODUCT_CATEGORIES).toContain('ACCESORIOS');
    });

    it('debe incluir ROPA', () => {
      expect(PRODUCT_CATEGORIES).toContain('ROPA');
    });

    it('debe incluir SERVICIOS_GYM', () => {
      expect(PRODUCT_CATEGORIES).toContain('SERVICIOS_GYM');
    });
  });

  describe('PRODUCT_CATEGORY_LABELS', () => {
    it('debe tener labels para todas las categorias', () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(PRODUCT_CATEGORY_LABELS[category]).toBeDefined();
        expect(typeof PRODUCT_CATEGORY_LABELS[category]).toBe('string');
      });
    });

    it('debe tener label correcto para SUPLEMENTOS', () => {
      expect(PRODUCT_CATEGORY_LABELS['SUPLEMENTOS']).toBe('Suplementos');
    });

    it('debe tener label correcto para BEBIDAS', () => {
      expect(PRODUCT_CATEGORY_LABELS['BEBIDAS']).toBe('Bebidas');
    });

    it('debe tener label correcto para ACCESORIOS', () => {
      expect(PRODUCT_CATEGORY_LABELS['ACCESORIOS']).toBe('Accesorios');
    });
  });
});