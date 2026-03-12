import type { AuthUser } from "../types/user.types";

const credentials: Record<string, { password: string; role: AuthUser["role"] }> = {
  admin: { password: "admin123", role: "ADMIN" },
  recepcion: { password: "recep123", role: "RECEPCIONISTA" },
  entrenador: { password: "trainer123", role: "ENTRENADOR" },
  dennis: { password: "123456", role: "RECEPCIONISTA" },
};

export const LoginService = (
  username: string,
  password: string,
): AuthUser | null => {
  const normalized = username.trim().toLowerCase();
  const record = credentials[normalized];

  if (!record || record.password !== password) {
    return null;
  }

  return { username: normalized, role: record.role };
};
