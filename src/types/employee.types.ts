/* Tipos para empleados y permisos */
export type EmployeeRole = "ADMIN" | "RECEPCIONISTA" | "ENTRENADOR";
export type EmployeeStatus = "ACTIVO" | "INACTIVO";

export interface Employee {
  id: number;
  username: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  password: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  createdAt: string;
}

export type EmployeeInput = Omit<Employee, "id" | "createdAt">;
export type EmployeeUpdate = Partial<EmployeeInput>;
