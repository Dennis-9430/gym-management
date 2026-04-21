import { useReducer, useEffect, useState } from "react";
import type { AuthUser } from "../types/user.types";
import { authReducer } from "../hooks/authHook";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

const initialState = {
  user: null as AuthUser | null,
};

/* Proveedor de autenticación que envuelve la aplicación */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storeUser = localStorage.getItem("user");
      if (storeUser) {
        const parsedUser = JSON.parse(storeUser);
        dispatch({ type: "LOGIN", payload: parsedUser });
      }
    } catch (error) {
      console.error("Error restoring auth state:", error);
      localStorage.removeItem("user");
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (user: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(user));
    dispatch({ type: "LOGIN", payload: user });
  };

  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext
      value={{
        user: state.user,
        isInitialized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
};
