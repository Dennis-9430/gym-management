/* Servicio para gestionar empleados */
// Direccion del archivo: src/services/employees.service.ts
// Relacionado con: useEmployees.ts, EmployeesPage.tsx, backend/app/routers/employees.py

import type { Employee, EmployeeInput, EmployeeUpdate } from "../types/employee.types";
import { getAuthHeaders, getAuthToken } from "./api";

// Configuración de API - usa variable de entorno o fallback
const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:8000";

// Constantes de configuracion
// Relacionado con: backend/app/routers/employees.py
const API_BASE = `${getApiBaseUrl()}/api/employees`;
const STORAGE_KEY = "gym-management.employees";

// Obtiene empleados desde MongoDB
// Relacionado con: backend/app/routers/employees.py (list_employees)
export const getEmployeesFromAPI = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(API_BASE, { headers: getAuthHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener empleados");
    }
    const data = await response.json();
    return data.employees || [];
  } catch (error) {
    console.error("Error cargando empleados desde API:", error);
    throw error;
  }
};

/* Obtiene empleados (intenta API, fallback localStorage) */
// Relacionado con: useEmployees.ts, EmployeesPage.tsx
export const getEmployees = async (): Promise<Employee[]> => {
  // Cargar owner desde tenant
  const storedTenant = localStorage.getItem("tenant");
  const storedOwner = localStorage.getItem("ownerData");
  let ownerEmployee: Employee | null = null;
  
  if (storedTenant) {
    const tenant = JSON.parse(storedTenant);
    // Obtener username real del owner desde tenant o desde ownerData
    const ownerDataStr = localStorage.getItem("ownerData");
    const ownerData = ownerDataStr ? JSON.parse(ownerDataStr) : {};
    const firstName = tenant.ownerFirstName || ownerData.firstName || tenant.businessName?.split(" ")[0] || "Owner";
    const lastName = tenant.ownerLastName || ownerData.lastName || tenant.businessName?.split(" ").slice(1).join(" ") || "";
    const ownerUsername = tenant.ownerUsername || ownerData.username || tenant.email?.split("@")[0] || "owner";
    
    ownerEmployee = {
      id: "owner",
      username: ownerUsername,
      documentType: "CEDULA",
      documentNumber: tenant.ruc || ownerData.documentNumber || "",
      firstName: firstName,
      lastName: lastName,
      email: tenant.email || ownerData.email || "",
      phone: tenant.phone || ownerData.phone || "",
      address: tenant.address || ownerData.address || "",
      notes: "Propietario del gimnasio",
      password: "",
      role: "ADMIN",
      status: "ACTIVE",
      isOwner: true,
      createdAt: new Date().toISOString(),
    };
  } else if (storedOwner) {
    // Legacy: cuenta demo
    const owner = JSON.parse(storedOwner);
    ownerEmployee = {
      id: "owner",
      username: "owner",
      documentType: "CEDULA",
      documentNumber: "",
      firstName: owner.firstName || "Demo",
      lastName: owner.lastName || "Owner",
      email: owner.email || "",
      phone: "",
      address: "",
      notes: "Propietario del gimnasio",
      password: "",
      role: "ADMIN",
      status: "ACTIVE",
      isOwner: true,
      createdAt: new Date().toISOString(),
    };
}
   
  try {
    const response = await fetch(API_BASE, { headers: getAuthHeaders() });
    if (!response.ok) {
      throw new Error("Error al obtener empleados");
    }
    const data = await response.json();
    console.log("getEmployees - data del backend:", data);
    let employees = data.employees || [];
    console.log("getEmployees - empleados del API (sin owner):", employees.length, employees);
    console.log("getEmployees - primer empleado keys:", Object.keys(employees[0] || {}));
    
    // Verificar si el API ya devuelve un owner
    const apiHasOwner = employees.some(e => (e as any).isOwner === true);
    
    // Agregar el owner local SOLO si el API no devuelve un owner
    if (ownerEmployee && !apiHasOwner) {
      console.log("getEmployees - ownerEmployee que se agregará:", ownerEmployee);
      employees = [ownerEmployee, ...employees];
    }
    
    console.log("getEmployees - empleados finales:", employees.map((e: Employee) => ({ id: e.id, username: e.username, isOwner: (e as any).isOwner })));
    
    // Ordenar: owner primero, luego por id (puede ser string u número)
    return employees.sort((a: Employee, b: Employee) => {
      if ((a as any).isOwner === true) return -1;
      if ((b as any).isOwner === true) return 1;
      // Si ambos son números
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      // Si alguno es string o ambos, comparar como strings
      return String(a.id).localeCompare(String(b.id));
    });
  } catch {
    // Error de red o API - fallback local
    const employees = loadEmployees();
    return [...employees].sort((a, b) => {
      if (a.isOwner) return -1;
      if (b.isOwner) return 1;
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      return String(a.id).localeCompare(String(b.id));
    });
  }
};

/* Obtiene empleado por ID */
export const getEmployeeById = async (id: number | string): Promise<Employee | null> => {
  console.log("getEmployeeById - id recibido:", id, "tipo:", typeof id);
  try {
    const response = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
    console.log("getEmployeeById - Response status:", response.status);
    if (!response.ok) {
      throw new Error("Empleado no encontrado");
    }
    const data = await response.json();
    console.log("getEmployeeById - data recibida:", data);
    return data;
  } catch (error) {
    console.error("getEmployeeById - Error:", error);
    const employees = loadEmployees();
    return employees.find((e) => e.id === id) ?? null;
  }
};

/* Obtiene datos del owner actual desde el backend */
export const getOwnerFromAPI = async (): Promise<Employee | null> => {
  try {
    const apiBase = getApiBaseUrl();
    const token = getAuthToken();
    const response = await fetch(`${apiBase}/api/tenants/owner`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Owner no encontrado");
    }
    const data = await response.json();
    // Convertir id a número para consistencia local (el owner tiene id=0 localmente)
    if (data.id) {
      data.id = 0;
    }
    return data as Employee;
  } catch (error) {
    console.error("Error obteniendo owner:", error);
    return null;
  }
};

/* Crea empleado */
export const createEmployeeAPI = async (
  input: EmployeeInput
): Promise<Employee | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Error al crear empleado");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creando empleado:", error);
    return null;
  }
};

/* Actualiza empleado */
export const updateEmployeeAPI = async (
  id: number | string,
  update: EmployeeUpdate
): Promise<Employee | null> => {
  // Verificar que id sea válido (número > 0 o string no vacía)
  const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
  if (!id || (!Number.isNaN(idNum) && idNum <= 0)) {
    console.error("updateEmployeeAPI: ID inválido", id, typeof id);
    throw new Error("ID de empleado inválido: " + id);
  }
  
  console.log("updateEmployeeAPI - ID:", id, "Payload:", update);
  
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(update),
    });
    
    console.log("updateEmployeeAPI - Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("updateEmployeeAPI - Error response:", errorData);
      throw new Error(errorData.detail || "Error al actualizar empleado");
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error("Error actualizando empleado:", error);
    throw new Error("Error al actualizar empleado");
  }
};

/* Elimina empleado */
export const deleteEmployeeAPI = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error("Error eliminando empleado:", error);
    return false;
  }
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeUsername = (username: string) => username.trim().toLowerCase();

/**
 * Agrega valores por defecto a empleado
 * @param employee - Empleado a normalizar
 * @returns Empleado con valores por defecto
 */
const withDefaults = (employee: Employee): Employee => {
  return {
    ...employee,
    username: employee.username || "",
    notes: employee.notes || "",
    phone: employee.phone || "",
    address: employee.address || "",
    documentNumber: employee.documentNumber || "",
  };
};

// Funciones de manejo de datos locales (Fallback)

/**
 * carga empleados desde localStorage
 * @returns Array de empleados (solo datos locales, no crea seed)
 */
const loadEmployees = (): Employee[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];  // No usar datos seed - usar solo DB
  }

  try {
    const parsed = JSON.parse(raw) as Employee[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((employee) => withDefaults(employee));
  } catch {
    return [];
  }
};

const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};

// Funciones locales (Fallback)

/**
 * Crea empleado en localStorage (fallback)
 * @param input - Datos del empleado
 * @returns Empleado creado
 * @throws Error si email o usuario ya existe
 */
export const createEmployee = (input: EmployeeInput): Employee => {
  const employees = loadEmployees();
  const email = normalizeEmail(input.email);
  const username = normalizeUsername(input.username);

  if (employees.some((e) => normalizeEmail(e.email) === email)) {
    throw new Error("El email ya existe");
  }

  if (employees.some((e) => normalizeUsername(e.username) === username)) {
    throw new Error("El usuario ya existe");
  }

  const nextId = employees.length
    ? Math.max(...employees.map((e) => typeof e.id === 'number' ? e.id : 0)) + 1
    : 1;

  const employee: Employee = {
    id: nextId,
    createdAt: new Date().toISOString(),
    ...input,
    email,
    username,
  };

  const updated = [...employees, employee];
  saveEmployees(updated);
  return employee;
};

/**
 * Actualiza empleado en localStorage (fallback)
 * @param id - ID del empleado
 * @param update - Campos a actualizar
 * @returns Empleado actualizado
 * @throws Error si no existe o email/usuario ya existe
 */
export const updateEmployee = (
  id: number,
  update: EmployeeUpdate,
): Employee => {
  const employees = loadEmployees();
  const index = employees.findIndex((e) => e.id === id);

  if (index === -1) {
    throw new Error("Empleado no encontrado");
  }

  if (update.email) {
    const email = normalizeEmail(update.email);
    const emailUsed = employees.some(
      (e) => e.id !== id && normalizeEmail(e.email) === email,
    );
    if (emailUsed) {
      throw new Error("El email ya existe");
    }
  }

  if (update.username) {
    const username = normalizeUsername(update.username);
    const usernameUsed = employees.some(
      (e) => e.id !== id && normalizeUsername(e.username) === username,
    );
    if (usernameUsed) {
      throw new Error("El usuario ya existe");
    }
  }

  const updatedEmployee: Employee = {
    ...employees[index],
    ...update,
    email: update.email ? normalizeEmail(update.email) : employees[index].email,
    username: update.username
      ? normalizeUsername(update.username)
      : employees[index].username,
  };

  const updatedEmployees = [...employees];
  updatedEmployees[index] = updatedEmployee;
  saveEmployees(updatedEmployees);

  return updatedEmployee;
};

/**
 * Elimina empleado de localStorage (fallback)
 * @param id - ID del empleado
 */
export const deleteEmployee = (id: number) => {
  const employees = loadEmployees();
  const updatedEmployees = employees.filter((e) => e.id !== id);
  saveEmployees(updatedEmployees);
};