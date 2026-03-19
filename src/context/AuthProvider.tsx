import { useReducer, useEffect } from "react";
import type { AuthUser } from "../types/user.types";
import { authReducer } from "../hooks/authHook";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

const initialState = {
  user: null as AuthUser | null,
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const storeUser = localStorage.getItem("user");
    if (storeUser) {
      dispatch({ type: "LOGIN", payload: JSON.parse(storeUser) });
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
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
};
