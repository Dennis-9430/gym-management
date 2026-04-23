/**
 * index.ts
 * 
 * Este archivo es el punto de exportación del módulo de autenticación.
 * Re-exporta todos los componentes y hooks públicos del contexto
 * de autenticación para facilitar las importaciones en otras partes
 * de la aplicación.
 * 
 * @module autenticacion
 * @author Sistema de Gimnasio
 * @version 1.0.0
 */

// Re-exportar el contexto de autenticación
export { AuthContext } from "./AuthContext";

// Re-exportar el proveedor de autenticación
export { AuthProvider } from "./AuthProvider";

// Re-exportar el hook personalizado
export { useAuth } from "./useAuth";
