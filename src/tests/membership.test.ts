/* Tests para utilerias de membresia */
/* Relacionado con: src/utils/membership.ts */
import { describe, it, expect } from 'vitest';
import { getDaysRemaining, getMembershipStatus } from '../utils/membership';

describe('Membership Utils', () => {
  describe('getDaysRemaining', () => {
    it('debe retornar dias positivos para fecha futura', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const result = getDaysRemaining(future);
      expect(result).toBeGreaterThan(0);
    });

    it('debe retornar dias negativos para fecha pasada', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const result = getDaysRemaining(past);
      expect(result).toBeLessThan(0);
    });
  });

  describe('getMembershipStatus', () => {
    it('debe retornar ACTIVE para membresia vigente', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      expect(getMembershipStatus(future)).toBe('ACTIVE');
    });

    it('debe retornar EXPIRED para membresia vencida', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      expect(getMembershipStatus(past)).toBe('EXPIRED');
    });

    it('debe retornar EXPIRED para fecha actual', () => {
      const today = new Date();
      expect(getMembershipStatus(today)).toBe('EXPIRED');
    });
  });
});