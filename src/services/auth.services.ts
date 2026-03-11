import type { AuthUser } from "../types/user.types";

export const LoginService = (
  username: string,
  password: string,
): AuthUser | null => {
  const userMock: AuthUser[] = [
    { username: "dennis", role: "EMPLOYEE" },
    { username: "admin", role: "ADMIN" },
  ];
  const validUser = userMock.find(
    (u) =>
      u.username === username &&
      ((u.role === "EMPLOYEE" && password === "1234") ||
        (u.role === "ADMIN" && password === "987654")),
  );
  return validUser || null;
};
