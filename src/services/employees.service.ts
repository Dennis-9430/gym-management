/* Servicio para gestionar empleados */
// Direccion del archivo: src/services/employees.service.ts
// Relacionado con: useEmployees.ts, EmployeesPage.tsx, backend/app/routers/employees.py

import type { Employee, EmployeeInput, EmployeeUpdate } from "../types/employee.types";

// Constantes de configuracion
// Relacionado con: backend/app/routers/employees.py
const API_BASE = "/api/employees";
const STORAGE_KEY = "gym-management.employees";

// Obtiene empleados desde MongoDB
// Relacionado con: backend/app/routers/employees.py (list_employees)
export const getEmployeesFromAPI = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${API_BASE}?status=ACTIVE`);
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
  try {
    const response = await fetch(`${API_BASE}?status=ACTIVE`);
    if (!response.ok) {
      throw new Error("Error al obtener empleados");
    }
    const data = await response.json();
    const employees = data.employees || [];
    
    // Si la API retorna empleados, usarlos; si no, fallback
    if (employees.length > 0) {
      return employees;
    }
    
    // API vacía, usar seed como ejemplo
    return seedEmployees;
  } catch {
    // Error de red o API, usar fallback
    const employees = loadEmployees();
    return [...employees].sort((a, b) => a.id - b.id);
  }
};

/* Obtiene empleado por ID */
export const getEmployeeById = async (id: number): Promise<Employee | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error("Empleado no encontrado");
    }
    return await response.json();
  } catch {
    const employees = loadEmployees();
    return employees.find((e) => e.id === id) ?? null;
  }
};

/* Crea empleado */
export const createEmployeeAPI = async (
  input: EmployeeInput
): Promise<Employee | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  id: number,
  update: EmployeeUpdate
): Promise<Employee | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar empleado");
    }
    return await response.json();
  } catch (error) {
    console.error("Error actualizando empleado:", error);
    return null;
  }
};

/* Elimina empleado */
export const deleteEmployeeAPI = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error eliminando empleado:", error);
    return false;
  }
};

/* Empleados de ejemplo para desarrollo */
// Relacionado con: getEmployees (fallback)
const seedEmployees: Employee[] = [
  {
    id: 1,
    username: "admin",
    documentNumber: "0102030405",
    firstName: "Admin",
    lastName: "Sistema",
    email: "admin@gym.com",
    phone: "099999999",
    address: "Direccion admin",
    notes: "",
    password: "admin123",
    role: "ADMIN",
    status: "ACTIVO",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    username: "dennis",
    documentNumber: "0203040506",
    firstName: "Dennis",
    lastName: "Empleado",
    email: "dennis@gym.com",
    phone: "098888888",
    address: "Direccion empleado",
    notes: "",
    password: "123456",
    role: "RECEPCIONISTA",
    status: "ACTIVO",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    username: "trainer",
    documentNumber: "0304050607",
    firstName: "Luis",
    lastName: "Trainer",
    email: "trainer@gym.com",
    phone: "097777777",
    address: "Direccion entrenador",
    notes: "",
    password: "trainer123",
    role: "ENTRENADOR",
    status: "INACTIVO",
    createdAt: new Date().toISOString(),
  },
];

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
 * Carga empleados desde localStorage
 * @returns Array de empleados
 */
const loadEmployees = (): Employee[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
    return seedEmployees;
  }

  try {
    const parsed = JSON.parse(raw) as Employee[];
    if (!Array.isArray(parsed)) {
      return seedEmployees;
    }
    return parsed.map((employee) => withDefaults(employee));
  } catch {
    return seedEmployees;
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
    ? Math.max(...employees.map((e) => e.id)) + 1
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
