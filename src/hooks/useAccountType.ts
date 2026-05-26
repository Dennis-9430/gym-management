/* Hook para verificar tipo de cuenta y permisos */
/* ⚠️ VISUAL ONLY: este hook NUNCA debe usarse para seguridad real.
 *  Los claims vienen del JWT firmado por el backend, que es la única
 *  fuente de verdad para roles/permisos. El frontend usa esto solo para
 *  ocultar/mostrar UI. El backend valida cada request con el token. */
import { useMemo } from "react";

interface UserPayload {
  role?: string;
  tenantId?: string;
  plan?: string;
}

export const useAccountType = () => {
  const userStr = localStorage.getItem("user");
  
  const userPayload = useMemo(() => {
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserPayload;
    } catch {
      return null;
    }
  }, [userStr]);

  // VISUAL ONLY: isDemo es flag local, backend no depende de esto
  const isDemo = useMemo(() => localStorage.getItem("isDemo") === "true", []);
  // VISUAL ONLY: role desde user en localStorage, backend valida con el token.
  // El rol GERENTE en el JWT identifica al dueño del tenant.
  const isOwner = useMemo(() => userPayload?.role === "GERENTE", [userPayload]);
  const isGerente = useMemo(() => isOwner || userPayload?.role === "ADMIN", [userPayload, isOwner]);
  const isRecepcionista = useMemo(() => userPayload?.role === "RECEPCIONISTA", [userPayload]);
  const isAdmin = useMemo(() => userPayload?.role === "ADMIN", [userPayload]);
  
  // VISUAL ONLY: ownerUsername desde localStorage("tenant") — solo para display
  const ownerUsername = useMemo(() => {
    const tenant = localStorage.getItem("tenant");
    if (!tenant) return null;
    try {
      return JSON.parse(tenant).ownerUsername || JSON.parse(tenant).email?.split("@")[0] || null;
    } catch {
      return null;
    }
  }, []);

  const canEditEmployee = true;

  // VISUAL ONLY: backend valida permisos de edición real
  const canEditConfig = useMemo(() => {
    if (isDemo) return false;
    return true;
  }, [isDemo]);

  const canEditOwnerFields = true;

  const ownerEditableFields = useMemo(() => ({
    email: false,
    businessName: false,
    password: true,
    username: true,
  }), []);

  // employeeIdFromToken ya no está disponible porque el JWT
  // no se guarda en localStorage. Se retorna null.
  const employeeIdFromToken = null;

  return {
    isDemo,
    isOwner,
    isGerente,
    isRecepcionista,
    isAdmin,
    ownerUsername,
    canEditEmployee,
    canEditConfig,
    canEditOwnerFields,
    ownerEditableFields,
    employeeIdFromToken,
  };
};
