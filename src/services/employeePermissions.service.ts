import type { EmployeeRole } from "../types/employee.types";

export const ROLE_PERMISSIONS: Record<EmployeeRole, string[]> = {
  ADMIN: ["Acceso total"],
  RECEPCIONISTA: ["Gestionar clientes", "Ventas", "Productos"],
  ENTRENADOR: ["Ver clientes", "Ver membresías"],
};

export const getRolePermissions = (role: EmployeeRole) => {
  return ROLE_PERMISSIONS[role] ?? [];
};
