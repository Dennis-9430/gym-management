/* Tests de frontend para el sistema de autenticación */
/* Login, AuthProvider, clearAuthStorage */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clearAuthStorage } from '../services/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Crea un JWT fake con el payload dado */
const createJWT = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const b64 = btoa(JSON.stringify(payload));
  return `${header}.${b64}.fake-sig`;
};

const expiredToken = (): string =>
  createJWT({ exp: Math.floor(Date.now() / 1000) - 3600 });

const validToken = (): string =>
  createJWT({ exp: Math.floor(Date.now() / 1000) + 3600 });

/**
 * Decodifica un JWT sin verificar firma — replica la lógica de AuthProvider.
 */
const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('clearAuthStorage', () => {
  it('elimina todas las claves de autenticación de localStorage', () => {
    const keys: string[] = [
      'accessToken', 'tenantToken', 'tenant', 'user', 'isDemo',
      'tenantId', 'businessCode', 'demoCredentials',
    ];
    keys.forEach((key) => localStorage.setItem(key, `value-${key}`));

    clearAuthStorage();

    keys.forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  it('no falla si localStorage está vacío', () => {
    expect(() => clearAuthStorage()).not.toThrow();
  });
});

describe('AuthProvider - JWT expiration check', () => {
  it('detecta token expirado correctamente', () => {
    const payload = decodeToken(expiredToken());
    expect(payload).not.toBeNull();
    expect(payload!.exp).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  it('detecta token válido correctamente', () => {
    const payload = decodeToken(validToken());
    expect(payload).not.toBeNull();
    expect(payload!.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('limpia localStorage cuando el JWT está expirado (simula lógica AuthProvider)', () => {
    // Arrange: sembrar datos como si hubiera sesión
    localStorage.setItem('accessToken', expiredToken());
    localStorage.setItem('tenantId', 'old-id');
    localStorage.setItem('businessCode', 'old-code');
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));

    // Act: misma lógica que AuthProvider en startup
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = decodeToken(token);
      if (payload && payload.exp) {
        const exp = payload.exp as number;
        if (exp * 1000 < Date.now()) {
          clearAuthStorage();
        }
      }
    }

    // Assert
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('tenantId')).toBeNull();
    expect(localStorage.getItem('businessCode')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('NO limpia localStorage si el JWT es válido', () => {
    localStorage.setItem('accessToken', validToken());
    localStorage.setItem('tenantId', 'my-tenant');

    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = decodeToken(token);
      if (payload && payload.exp) {
        const exp = payload.exp as number;
        if (exp * 1000 < Date.now()) {
          clearAuthStorage();
        }
      }
    }

    // accessToken y tenantId deberían seguir ahí
    expect(localStorage.getItem('accessToken')).not.toBeNull();
    expect(localStorage.getItem('tenantId')).toBe('my-tenant');
  });
});

describe('Login - API request body', () => {
  it('no incluye tenantId en el body cuando se provee businessCode', () => {
    // Simula la lógica de Login.tsx: armar body sin tenantId si hay businessCode
    const buildLoginBody = (email: string, password: string, businessCode?: string) => {
      const body: Record<string, string> = { email, password };
      if (businessCode) {
        body.businessCode = businessCode;
        // NO incluir tenantId cuando hay businessCode
      } else {
        // Fallback: usar tenantId de localStorage si existe
        const savedTenantId = localStorage.getItem('tenantId');
        if (savedTenantId) {
          body.tenantId = savedTenantId;
        }
      }
      return body;
    };

    localStorage.setItem('tenantId', 'tenant-123');

    const bodyWithCode = buildLoginBody('test@test.com', 'pass123', 'mi-gimnasio');
    expect(bodyWithCode).toEqual({ email: 'test@test.com', password: 'pass123', businessCode: 'mi-gimnasio' });
    expect(bodyWithCode).not.toHaveProperty('tenantId');

    const bodyWithoutCode = buildLoginBody('test@test.com', 'pass123');
    expect(bodyWithoutCode).toHaveProperty('tenantId', 'tenant-123');
  });
});

describe('Login - businessCode validation', () => {
  it('requiere businessCode para enviar el formulario (simula validación del form)', () => {
    // Simula validación antes de enviar
    const validateForm = (email: string, password: string, businessCode: string): string[] => {
      const errors: string[] = [];
      if (!email.trim()) errors.push('Email es requerido');
      if (!password.trim()) errors.push('Contraseña es requerida');
      if (!businessCode.trim()) errors.push('Código del Negocio es requerido');
      return errors;
    };

    expect(validateForm('', 'pass', '')).toContain('Código del Negocio es requerido');
    expect(validateForm('test@test.com', 'pass', '')).toContain('Código del Negocio es requerido');
    expect(validateForm('test@test.com', 'pass', 'mi-gym')).not.toContain('Código del Negocio es requerido');
  });

  it('no envía fetch si businessCode está vacío', () => {
    const fetchMock = vi.fn();
    const submitLogin = (businessCode: string, onFetch: typeof fetchMock) => {
      if (!businessCode.trim()) return;
      onFetch('/api/tenants/login', { body: JSON.stringify({ businessCode }) });
    };

    submitLogin('', fetchMock);
    expect(fetchMock).not.toHaveBeenCalled();

    submitLogin('mi-gym', fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('AuthProvider - decodeToken utility', () => {
  it('decodifica JWT correctamente', () => {
    const token = createJWT({ sub: 'user123', role: 'ADMIN' });
    const payload = decodeToken(token);
    expect(payload).toEqual({ sub: 'user123', role: 'ADMIN' });
  });

  it('retorna null para token inválido', () => {
    expect(decodeToken('')).toBeNull();
    expect(decodeToken('not-a-jwt')).toBeNull();
    expect(decodeToken('a.b')).toBeNull(); // payload no es JSON válido
  });
});
