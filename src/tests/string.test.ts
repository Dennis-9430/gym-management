/* Tests para utilerias de string */
/* Relacionado con: src/utils/string/* */
import { describe, it, expect } from 'vitest';
import { normalizeText, normalizeDocument, matchesQuery } from '../utils/string/normalize';

describe('String Utils', () => {
  describe('normalizeText', () => {
    it('debe convertir a minusculas', () => {
      expect(normalizeText('HOLA MUNDO')).toBe('hola mundo');
    });

    it('debe remover acentos', () => {
      expect(normalizeText('José')).toBe('jose');
    });

    it('debe remover caracteres especiales', () => {
      expect(normalizeText('test@email.com')).toBe('test email com');
    });

    it('debe normalizar espacios', () => {
      expect(normalizeText('hola    mundo')).toBe('hola mundo');
    });
  });

  describe('normalizeDocument', () => {
    it('debe remover caracteres no alfanumericos', () => {
      expect(normalizeDocument('123.456.789-0')).toBe('1234567890');
    });

    it('debe ser case insensitive', () => {
      expect(normalizeDocument('AbC123')).toBe('abc123');
    });
  });

  describe('matchesQuery', () => {
    it('debe retornar true si query vacia', () => {
      expect(matchesQuery('texto', '')).toBe(true);
    });

    it('debe verificar todos los tokens', () => {
      expect(matchesQuery('Juan Perez Lopez', 'juan perez')).toBe(true);
    });

    it('debe retornar false si falta token', () => {
      expect(matchesQuery('Juan Perez', 'juan pedro')).toBe(false);
    });

    it('debe ser case insensitive', () => {
      expect(matchesQuery('JUAN PEREZ', 'juan')).toBe(true);
    });
  });
});