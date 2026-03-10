import type { User } from "../types/user.types";

export const LoginService = (
  username: string,
  password: string,
): User | null => {
  const userMock: User[] = [
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
/*import type { User } from "../types/user.types";

export const LoginService = (
  username: string,
  password: string,
): User | null => {

  const userMock: User[] = [
    {
      id: 1,
      username: "dennis",
      password: "1234",

      firstName: "Dennis",
      lastName: "Pinzon",
      documentNumber: "1100000000",

      phone: "0999999999",
      email: "dennis@gym.com",
      address: "Piñas",

      role: "EMPLOYEE",
      createdAt: new Date(),
    },

    {
      id: 2,
      username: "admin",
      password: "987654",

      firstName: "Admin",
      lastName: "System",
      documentNumber: "0000000000",

      role: "ADMIN",
      createdAt: new Date(),
    },
  ];

  const validUser = userMock.find(
    (u) => u.username === username && u.password === password
  );

  return validUser || null;
}; */
