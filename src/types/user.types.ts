import type { Person } from "./person.types";

/* Roles disponibles en el sistema */
export type Role = "ADMIN" | "RECEPCIONISTA" | "ENTRENADOR";

/* Tipo que representa un usuario del sistema */
export interface User extends Person {
  id: number;

  username: string;
  password: string;

  firstName: string;
  lastName: string;

  documentNumber: string;
  phone?: string;
  email?: string;
  address?: string;

  role: Role;

  createdAt: Date;
}

export type AuthUser = Pick<User, "username" | "role">;
