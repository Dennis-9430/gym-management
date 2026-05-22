/* Servicio base de API con manejo centralizado de auth y errores */

export const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "";

const API_BASE_URL = getApiBaseUrl();

/* Construir URL correctamente para entorno local con proxy o URL configurada */
export const buildUrl = (endpoint: string) =>
  `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

/* Obtener token de autenticación.
   El JWT se envía como cookie HttpOnly (segura contra XSS).
   Este getter es fallback para sesiones legacy que aún tengan
   el token en localStorage. Las sesiones nuevas usan cookie. */
export const getAuthToken = (): string | null => localStorage.getItem("accessToken");

/** Limpia datos demo en backend antes de cerrar sesión */
/* PUBLIC + POST-LOGOUT: no necesita token. Fetch directo intencional por ser cleanup que no debe interferir con logout. */
export const cleanupDemoData = async (): Promise<void> => {
  const isDemo = localStorage.getItem("isDemo") === "true";
  if (!isDemo) return;

  try {
    await fetch(buildUrl("/api/tenants/demo/cleanup"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Si falla la limpieza, igual cerramos sesión
  }
};

/** Limpia TODOS los datos de autenticación y sesión */
export const clearAuthStorage = () => {
  ["accessToken", "tenantToken", "tenant", "user", "isDemo",
   "tenantId", "businessCode", "demoCredentials"].forEach((key) =>
    localStorage.removeItem(key),
  );
};

/* Headers con token de autenticación.
   Prefiere cookie HttpOnly (automática del browser).
   Si hay token legacy en localStorage, lo envía como fallback. */
export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

/** Opciones base para fetch: incluye headers de auth sin cookies cross-origin. */
const fetchOptions = (extra: RequestInit = {}): RequestInit => ({
  headers: getAuthHeaders(),
  ...extra,
});

/* Manejo de errores de respuesta */
const handleResponse = async (response: Response) => {
  let data: any = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message = data?.detail || data?.message || "Error en la solicitud";
    const isAuthError = response.status === 401 || response.status === 403;

    if (isAuthError) {
      window.dispatchEvent(
        new CustomEvent("auth:error", {
          detail: { status: response.status, message },
        }),
      );
    }

    if (response.status === 401) {
      clearAuthStorage();
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    throw new Error(message);
  }

  return data;
};

const withErrorHandling = async (request: Promise<Response>) => {
  try {
    const response = await request;
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudo conectar con el servidor");
  }
};

export const apiGet = async (endpoint: string) =>
  withErrorHandling(
    fetch(buildUrl(endpoint), fetchOptions({ method: "GET" })),
  );

export const apiPost = async (endpoint: string, body: unknown) =>
  withErrorHandling(
    fetch(buildUrl(endpoint), fetchOptions({
      method: "POST",
      body: JSON.stringify(body),
    })),
  );

export const apiPut = async (endpoint: string, body: unknown) =>
  withErrorHandling(
    fetch(buildUrl(endpoint), fetchOptions({
      method: "PUT",
      body: JSON.stringify(body),
    })),
  );

export const apiDelete = async (endpoint: string) =>
  withErrorHandling(
    fetch(buildUrl(endpoint), fetchOptions({ method: "DELETE" })),
  );

/* Verificar plan del tenant desde la sesión actual */
/* ⚠️ VISUAL ONLY: localStorage("tenant") es cache de UI. El backend tiene el plan real. */
export const getTenantPlan = (): string | null => {
  const tenant = localStorage.getItem("tenant");
  if (!tenant) return null;

  try {
    return JSON.parse(tenant).plan;
  } catch {
    return null;
  }
};

/* ⚠️ VISUAL ONLY: backend enforces actual permissions. Esta función solo controla UI. */
export const hasPlanFeature = (feature: string): boolean => {
  const plan = getTenantPlan();
  if (!plan) return false;

  const features: Record<string, string[]> = {
    BASIC: [
      "clients:read",
      "clients:write",
      "memberships:read",
      "memberships:write",
      "products:read",
      "products:write",
      "sales:read",
      "sales:write",
      "attendance:read",
    ],
    PREMIUM: [
      "clients:read",
      "clients:write",
      "memberships:read",
      "memberships:write",
      "products:read",
      "products:write",
      "sales:read",
      "sales:write",
      "attendance:read",
      "reports:read",
      "employees:read",
      "employees:write",
    ],
  };

  return (features[plan] || []).includes(feature);
};
