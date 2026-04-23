/**
 * AuthContext.tsx
 * 
 * Este archivo define el contexto de autenticación de React.
 * Provee el estado global del usuario autenticado y las funciones
 * de login/logout para toda la aplicación.
 * 
 *@module AuthContext
 *@author Sistema de Gimnasio
 *@version 1.0.0
 */

import { createContext } from "react";
import type { AuthUser } from "../types/user.types";

/**
 * Interfaz que define las propiedades del contexto de autenticación.
 * 
 * @interface AuthContextProps
 * @property {AuthUser | null} user - Usuario actualmente autenticado (null si no hay sesión)
 * @property {boolean} isInitialized - Indica si el contexto ha terminado de cargar el estado inicial
 * @property {function} login - Función para iniciar sesión con un usuario
 * @property {function} logout - Función para cerrar sesión
 */
interface AuthContextProps {
  /** Usuario actualmente autenticado. Null si no hay sesión activa. */
  user: AuthUser | null;
  
  /** Indica si el proveedor ha terminado de restaurar el estado desde localStorage */
  isInitialized: boolean;
  
  /** 
   * Función para iniciar sesión.
   * @param {AuthUser} user - Usuario a autenticarse
   */
  login: (user: AuthUser) => void;
  
  /** Función para cerrar la sesión actual */
  logout: () => void;
}

/**
 * Contexto de React que provee el estado de autenticación global.
 * Se usa junto con AuthProvider para envolver la aplicación.
 * 
 * @constant AuthContext
 * @type {React.Context<AuthContextProps | undefined>}
 */
export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);
