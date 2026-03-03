export type Role = "ADMIN" | "RECEPCION";

export interface User {
  username: string;
  role: Role;
}
