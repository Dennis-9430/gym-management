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
import { clearAuthStorage, cleanupDemoData, buildUrl } from "../services/api";

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
   * Limpia datos obsoletos de localStorage de versiones anteriores
   */
  const cleanupOldData = () => {
    const oldKeys = [
      "old_users", "old_auth", "old_token",
      "gym_users", "gym_auth", "gym_token",
      "products", "clients", "sales",
      "financial_reports", "employees",
    ];
    oldKeys.forEach((key) => localStorage.removeItem(key));
  };

  /**
   * Efecto que se ejecuta al montar el componente.
   * Restaura el usuario desde localStorage si existe una sesión previa.
   * 
   * ⚠️ VISUAL CACHE ONLY: localStorage("user") es solo cache para UI.
   * El backend es la fuente de verdad de la sesión via cookie HttpOnly.
   * No usar estos datos para decisiones de seguridad, permisos o autenticación real.
   * 
   * @useEffect
   * @description Restaura la sesión del usuario desde localStorage al iniciar la aplicación
   */
  useEffect(() => {
    // Limpiar datos obsoletos
    cleanupOldData();

    try {
      // Intentar recuperar el usuario guardado en localStorage
      // ⚠️ VISUAL CACHE ONLY: user en localStorage es solo para
      // mostrar la UI correcta al recargar. El backend es la fuente
      // de verdad de la sesión via cookie HttpOnly.
      const storeUser = localStorage.getItem("user");
      if (storeUser) {
        // Parsear y restaurar el usuario
        const parsedUser = JSON.parse(storeUser);
        dispatch({ type: "LOGIN", payload: parsedUser });
      }
    } catch (error) {
      // Error restoring auth state
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
   * ⚠️ VISUAL CACHE ONLY: persistimos user en localStorage para que al
   * recargar la página se muestre la UI correcta. El token JWT es la
   * fuente de verdad. El backend valida permisos en cada request.
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
  const logout = async () => {
    // Limpiar datos demo antes de cerrar sesión
    await cleanupDemoData();
    // Llamar al backend para eliminar cookie HttpOnly
    try {
      await fetch(buildUrl("/api/tenants/logout"), { method: "POST", credentials: "include" });
    } catch {
      // Si falla, igual limpiamos local
    }
    // Limpiar TODOS los datos de autenticación
    clearAuthStorage();
    // Reiniciar el estado global
    dispatch({ type: "LOGOUT" });
  };

  /* ──────────────────────────────────────────────
   * Idle Session Timeout
   * Cierra sesión automáticamente tras inactividad.
   * Se reinicia con cualquier interacción del usuario.
   * ────────────────────────────────────────────── */
  useEffect(() => {
    if (!state.user) return;

    const IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 horas
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
        await logout();
        window.location.href = "/";
      }, IDLE_TIMEOUT_MS);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [state.user]);

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
