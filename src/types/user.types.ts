export type Role = "ADMIN" | "EMPLOYEE";

export interface User {
  username: string;
  role: Role;
}
