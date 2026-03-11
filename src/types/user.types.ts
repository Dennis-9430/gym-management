import type { Person } from "./person.types";
export type Role = "ADMIN" | "EMPLOYEE";

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
