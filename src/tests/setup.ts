/* Setup para tests con Vitest */
/* Relacionado con: vitest.config.ts */
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});