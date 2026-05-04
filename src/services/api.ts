/* Servicio de API con manejo de errores y protección por plan */

// URL del backend (usa .env o fallback)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

/* Construir URL correctamente */
const buildUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

/* Headers por defecto - para uso interno */
const getHeaders = () => {
  return getAuthHeaders();
};

/* Obtener token de autenticación */
export const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

/* Headers con token de autenticación */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/* Manejo de errores de respuesta */
const handleResponse = async (response: Response) => {
  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const isAuthError = response.status === 401 || response.status === 403;
    
    if (isAuthError) {
      // Emitir evento personalizado para que los componentes puedan manejarlo
      window.dispatchEvent(new CustomEvent("auth:error", { 
        detail: { status: response.status, message: data.detail || "Sesión expirada" }
      }));
      // No redirigir automáticamente - deixar que el componente maneje
    }

    if (response.status === 403) {
      throw new Error(data.detail || "No tienes acceso a esta funcionalidad");
    }

    if (response.status === 401 && !window.location.pathname.includes("/sales/invoices")) {
      // Solo redirigir si NO estamos en la página de facturas (donde tenemos datos demo)
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tenantToken");
      localStorage.removeItem("tenant");
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    throw new Error(data.detail || "Error en la solicitud");
  }

  return data;
};

/* GET request */
export const apiGet = async (endpoint: string) => {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor");
  }
};

/* POST request */
export const apiPost = async (endpoint: string, body: unknown) => {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor");
  }
};

/* PUT request */
export const apiPut = async (endpoint: string, body: unknown) => {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor");
  }
};

/* DELETE request */
export const apiDelete = async (endpoint: string) => {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "DELETE",
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor");
  }
};

/* Verificar plan del tenant */
export const getTenantPlan = (): string | null => {
  const tenant = localStorage.getItem("tenant");
  if (!tenant) return null;

  try {
    return JSON.parse(tenant).plan;
  } catch {
    return null;
  }
};

/* Verificar si tiene acceso a una funcionalidad */
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

/* Verificar si tiene plan PREMIUM */
export const isPremium = (): boolean => getTenantPlan() === "PREMIUM";
