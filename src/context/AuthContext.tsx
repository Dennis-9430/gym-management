import { createContext, useReducer, useEffect, useContext } from "react";
import type { AuthUser } from "../types/user.types";
import { authReducer } from "../hooks/authHook";

interface AuthContextProps {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

const initialState = {
  user: null as AuthUser | null,
};
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe de usarse dentro del AuthProvider");
  }
  return context;
};
