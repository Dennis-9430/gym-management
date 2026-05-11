/* Servicio de empleados alineado al backend como fuente de verdad */
// Direccion del archivo: src/services/employees.service.ts
// Relacionado con: useEmployees.ts, EmployeesPage.tsx, EmployeeProfilePage.tsx

import type { Employee, EmployeeInput, EmployeeUpdate } from "../types/employee.types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

const EMPLOYEES_ENDPOINT = "/api/employees";
const OWNER_ENDPOINT = "/api/tenants/owner";

const mapEmployee = (employee: Partial<Employee> & { _id?: string; id?: string }): Employee => ({
  id: String(employee.id ?? employee._id ?? ""),
  username: employee.username ?? "",
  documentType: employee.documentType ?? "CEDULA",
  documentNumber: employee.documentNumber ?? "",
  firstName: employee.firstName ?? "",
  lastName: employee.lastName ?? "",
  email: employee.email ?? "",
  phone: employee.phone ?? "",
  address: employee.address ?? "",
  notes: employee.notes ?? "",
  password: "",
  role: employee.role ?? "RECEPCIONISTA",
  status: employee.status ?? "ACTIVE",
  isOwner: employee.isOwner ?? false,
  createdAt: employee.createdAt ?? new Date().toISOString(),
});

const sortEmployees = (a: Employee, b: Employee) => {
  if (a.isOwner) return -1;
  if (b.isOwner) return 1;
  return a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName);
};

export const getEmployees = async (): Promise<Employee[]> => {
  const data = await apiGet(EMPLOYEES_ENDPOINT) as { employees?: Employee[] };
  return (data.employees ?? []).map(mapEmployee).sort(sortEmployees);
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  const data = await apiGet(`${EMPLOYEES_ENDPOINT}/${id}`);
  return mapEmployee(data as Employee);
};

export const getOwnerFromAPI = async (): Promise<Employee | null> => {
  const data = await apiGet(OWNER_ENDPOINT);
  return mapEmployee(data as Employee);
};

export const createEmployeeAPI = async (input: EmployeeInput): Promise<Employee> => {
  const data = await apiPost(EMPLOYEES_ENDPOINT, input);
  return mapEmployee(data as Employee);
};

export const updateEmployeeAPI = async (
  id: string,
  update: EmployeeUpdate,
): Promise<Employee> => {
  const payload = { ...update };
  if (!payload.password?.trim()) {
    delete payload.password;
  }

  const data = await apiPut(`${EMPLOYEES_ENDPOINT}/${id}`, payload);
  return mapEmployee(data as Employee);
};

export const deleteEmployeeAPI = async (id: string): Promise<void> => {
  await apiDelete(`${EMPLOYEES_ENDPOINT}/${id}`);
};

/* El owner usa un endpoint propio para no mezclar reglas con empleados comunes. */
export const updateOwnerProfile = async (update: EmployeeUpdate): Promise<Employee> => {
  const allowedOwnerFields = [
    "firstName",
    "lastName",
    "phone",
    "address",
    "documentNumber",
    "documentType",
    "notes",
    "username",
    "password",
  ] as const;

  const payload = Object.fromEntries(
    allowedOwnerFields
      .map((field) => [field, update[field]])
      .filter(([, value]) => value !== undefined && value !== null && `${value}`.trim() !== ""),
  );

  const data = await apiPut(OWNER_ENDPOINT, payload);
  return mapEmployee(data as Employee);
};

export const verifyCurrentPassword = async (password: string): Promise<void> => {
  await apiPost("/api/auth/verify-password", { password });
};
