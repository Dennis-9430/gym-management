/**
 * useAuth.ts
 * 
 * Este archivo contiene un hook personalizado (custom hook) de React
 * que facilita el acceso al contexto de autenticación desde cualquier
 * componente de la aplicación.
 * 
 * Este hook abstrae el uso de useContext y provee una forma segura
 * de acceder al estado de autenticación, lanzando un error si se
 * intenta usar fuera del AuthProvider.
 * 
 * @module useAuth
 * @author Sistema de Gimnasio
 * @version 1.0.0
 */

import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Hook personalizado para acceder al contexto de autenticación.
 * 
 * Este hook debe ser usado por cualquier componente que necesite
 * acceder al estado del usuario autenticado o a las funciones
 * de login/logout.
 * 
 * @function useAuth
 * @returns {import("./AuthContext").AuthContextProps} El contexto de autenticación
 * @throws {Error} Si se intenta usar fuera de un AuthProvider
 * 
 * @example
 * // Uso típico en un componente
 * const { user, login, logout } = useAuth();
 * 
 * @example
 * // Verificar si el usuario está autenticado
 * const { user, isInitialized } = useAuth();
 * if (!isInitialized) return <Cargando />;
 * if (!user) return <Login />;
 */
export const useAuth = () => {
  // Obtener el contexto de autenticación
  const context = useContext(AuthContext);
  
  // Verificar que el hook se use dentro de un AuthProvider
  if (!context) {
    throw new Error("useAuth debe de usarse dentro del AuthProvider");
  }
  
  // Retornar el contexto
  return context;
};
