/* Servicio base de API con manejo centralizado de auth y errores */

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/* Construir URL correctamente:
   - En producción (Vite.PROD=true): ruta relativa → el proxy de Vercel la maneja
   - En desarrollo: usa VITE_API_URL (backend local) o relativa si no está configurado */
export const buildUrl = (endpoint: string) => {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (import.meta.env.PROD) return normalized;
  return `${API_BASE_URL}${normalized}`;
};

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
  ["tenant", "user", "isDemo",
   "tenantId", "businessCode", "demoCredentials"].forEach((key) =>
    localStorage.removeItem(key),
  );
};

/* Headers base para peticiones autenticadas.
   La autenticación se maneja via cookie HttpOnly (automática del browser).
   No se envía Bearer token — el backend lee el JWT de la cookie. */
export const getAuthHeaders = (): Record<string, string> => {
  return {
    "Content-Type": "application/json",
  };
};

/** Opciones base para fetch: incluye headers y envía cookies con cada request. */
const fetchOptions = (extra: RequestInit = {}): RequestInit => ({
  headers: getAuthHeaders(),
  credentials: "include",
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
