/**
 * AuthProvider.tsx
 * 
 * Este archivo contiene el componente proveedor de autenticación.
 * Envuelve la aplicación y provee el contexto de autenticación a todos
 * los componentes hijos. Maneja el estado global del usuario, persistencia
 * en localStorage y las funciones de login/logout.
 * 
 * @module AuthProvider
 * @author Sistema de Gimnasio
 * @version 1.0.0
 */

import { useReducer, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types/user.types";
import { authReducer } from "../hooks/authHook";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

const initialState = { user: null };

/**
 * Proveedor de autenticación que envuelve la aplicación.
 * 
 * Este componente:
 * - Restaura la sesión del usuario desde localStorage al montar
 * - Prove funciones de login y logout
 * - Actualiza el contexto con el estado global
 * - Persiste la sesión en localStorage
 * 
 * @component AuthProvider
 * @param {AuthProviderProps} props - Propiedades del proveedor
 * @returns {JSX.Element} Proveedor de contexto con los hijos renderizados
 * 
 * @example
 * // Uso típico en App.tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Estado global manejado por el reducer
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Bandera para indicar si el contexto ha terminado de inicializarse
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Efecto que se ejecuta al montar el componente.
   * Restaura el usuario desde localStorage si existe una sesión previa.
   * 
   * @useEffect
   * @description Restaura la sesión del usuario desde localStorage al iniciar la aplicación
   */
  useEffect(() => {
    try {
      // Intentar recuperar el usuario guardado en localStorage
      const storeUser = localStorage.getItem("user");
      if (storeUser) {
        // Parsear y restaurar el usuario
        const parsedUser = JSON.parse(storeUser);
        dispatch({ type: "LOGIN", payload: parsedUser });
      }
    } catch (error) {
      // Manejar errores de parseo (posible corrupción de datos)
      console.error("Error restoring auth state:", error);
      localStorage.removeItem("user");
    } finally {
      // Indicar que la inicialización ha terminado
      setIsInitialized(true);
    }
  }, []);

  /**
   * Función para iniciar sesión.
   * Guarda el usuario en localStorage y actualiza el estado global.
   * 
   * @function login
   * @param {AuthUser} user - Usuario a autenticarse
   * @returns {void}
   */
  const login = (user: AuthUser) => {
    // Persistir el usuario en localStorage
    localStorage.setItem("user", JSON.stringify(user));
    // Actualizar el estado global
    dispatch({ type: "LOGIN", payload: user });
  };

  /**
   * Función para cerrar sesión.
   * Limpia el usuario de localStorage y reinicia el estado global.
   * 
   * @function logout
   * @returns {void}
   */
  const logout = () => {
    // Eliminar el usuario de localStorage
    localStorage.removeItem("user");
    // Reiniciar el estado global
    dispatch({ type: "LOGOUT" });
  };

  // Renderizar el proveedor con el contexto
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
