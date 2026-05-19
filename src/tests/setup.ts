/* Setup para tests con Vitest */
/* Relacionado con: vitest.config.ts */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

const preloaded = (globalThis as any).__REACT_CJS_EXPORTS;
const internals = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

console.log('[setup] React same:', React === preloaded);

// Check globals
console.log('[setup] global ReactSharedInternals:', typeof (globalThis as any).ReactSharedInternals);
// Check if global internals matches
const gInternals = (globalThis as any).ReactSharedInternals;
console.log('[setup] global === internals:', gInternals === internals);

// Remove the bridge we don't need
// ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

afterEach(() => {
  cleanup();
});
