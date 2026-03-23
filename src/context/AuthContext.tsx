import { createContext } from "react";
import type { AuthUser } from "../types/user.types";

interface AuthContextProps {
  user: AuthUser | null;
  isInitialized: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);
