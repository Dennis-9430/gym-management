/* Tipos para empleados y permisos */
export type EmployeeRole = "ADMIN" | "RECEPCIONISTA" | "ENTRENADOR";
export type EmployeeStatus = "ACTIVE" | "INACTIVE";
export type DocumentType = "CEDULA" | "PASAPORTE" | "RUC";

export interface Employee {
  id: number | string;
  username: string;
  documentType: DocumentType;
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
  isOwner?: boolean;
  createdAt: string;
}

export type EmployeeInput = Omit<Employee, "id" | "createdAt">;
export type EmployeeUpdate = Partial<EmployeeInput>;
