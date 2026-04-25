/* Servicio de API con manejo de errores y protección por plan */
const API_BASE_URL = "http://localhost:8000";

/* Headers por defecto */
const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  const token = localStorage.getItem("tenantToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

/* Manejo de errores de respuesta */
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 403) {
      // Error de plan - mostrar mensaje al usuario
      throw new Error(data.detail || "No tienes acceso a esta funcionalidad");
    }
    
    if (response.status === 401) {
      // No autorizado - limpiar sesión
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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/* POST request */
export const apiPost = async (endpoint: string, body: unknown) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

/* PUT request */
export const apiPut = async (endpoint: string, body: unknown) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

/* DELETE request */
export const apiDelete = async (endpoint: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
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