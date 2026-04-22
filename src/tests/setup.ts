/* Setup para tests con Vitest */
/* Relacionado con: vitest.config.ts */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});