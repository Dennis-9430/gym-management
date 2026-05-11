/* Servicio base de API con manejo centralizado de auth y errores */

export const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "";

const API_BASE_URL = getApiBaseUrl();

/* Construir URL correctamente para entorno local con proxy o URL configurada */
export const buildUrl = (endpoint: string) =>
  `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

/* Obtener token de autenticación */
export const getAuthToken = (): string | null => localStorage.getItem("accessToken");

/** Limpia datos demo en backend antes de cerrar sesión */
export const cleanupDemoData = async (): Promise<void> => {
  const isDemo = localStorage.getItem("isDemo") === "true";
  if (!isDemo) return;

  try {
    await fetch(buildUrl("/api/tenants/demo/cleanup"), {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } catch {
    // Si falla la limpieza, igual cerramos sesión
  }
};

/** Limpia TODOS los datos de autenticación y sesión */
export const clearAuthStorage = () => {
  ["accessToken", "tenantToken", "tenant", "user", "isDemo"].forEach((key) =>
    localStorage.removeItem(key),
  );
};

/* Headers con token de autenticación */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

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
    fetch(buildUrl(endpoint), {
      method: "GET",
      headers: getAuthHeaders(),
    }),
  );

export const apiPost = async (endpoint: string, body: unknown) =>
  withErrorHandling(
    fetch(buildUrl(endpoint), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }),
  );

export const apiPut = async (endpoint: string, body: unknown) =>
  withErrorHandling(
    fetch(buildUrl(endpoint), {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }),
  );

export const apiDelete = async (endpoint: string) =>
  withErrorHandling(
    fetch(buildUrl(endpoint), {
      method: "DELETE",
      headers: getAuthHeaders(),
    }),
  );

/* Verificar plan del tenant desde la sesión actual */
export const getTenantPlan = (): string | null => {
  const tenant = localStorage.getItem("tenant");
  if (!tenant) return null;

  try {
    return JSON.parse(tenant).plan;
  } catch {
    return null;
  }
};

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
      "attendance:write",
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
      "attendance:write",
      "employees:read",
      "employees:write",
      "reports:read",
      "reports:write",
      "config:read",
      "config:write",
      "whatsapp:read",
      "whatsapp:write",
    ],
  };

  return features[plan]?.includes(feature) ?? false;
};

export const isPremium = (): boolean => getTenantPlan() === "PREMIUM";
