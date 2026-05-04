/* Servicio para login de empleados */
import { getAuthHeaders, getApiBaseUrl } from "./api";

const BASE_URL = getApiBaseUrl();

export interface EmployeeLoginResponse {
  accessToken: string;
  employeeId: string;
  role: string;
  isOwner: boolean;
  tenantId: string;
  plan: string;
  employee: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    isOwner: boolean;
  };
}

export interface EmployeeLoginError {
  detail: string;
}

/**
 * Login de empleado (admin o recepcionista)
 * El owner inicia sesión desde el login principal del tenant
 */
export const employeeLogin = async (
  username: string,
  password: string
): Promise<EmployeeLoginResponse> => {
  const response = await fetch(`${BASE_URL}/api/employees/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Credenciales incorrectas");
  }

  return data as EmployeeLoginResponse;
};

/**
 * Verificar si el token actual pertenece a un empleado
 * y obtener sus datos
 */
export const getCurrentEmployee = async (token: string) => {
  const response = await fetch(`${BASE_URL}/api/employees/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
};