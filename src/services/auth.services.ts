import type { User } from "../types/user.types";

export const LoginService = (
  username: string,
  password: string,
): User | null => {
  const userMock: User[] = [
    { username: "dennis", role: "RECEPCION" },
    { username: "admin", role: "ADMIN" },
  ];
  const validUser = userMock.find(
    (u) =>
      u.username === username &&
      ((u.role === "RECEPCION" && password === "1234") ||
        (u.role === "ADMIN" && password === "987654")),
  );
  return validUser || null;
};
