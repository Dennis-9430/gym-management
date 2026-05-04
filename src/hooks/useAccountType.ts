/* Hook para verificar tipo de cuenta y permisos */
import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub?: string;
  role?: string;
  tenantId?: string;
  employeeId?: string;
  isOwner?: boolean;
  plan?: string;
  exp?: number;
}

export const useAccountType = () => {
  const token = localStorage.getItem("accessToken");
  
  const tokenPayload = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }, [token]);

  const isDemo = useMemo(() => localStorage.getItem("isDemo") === "true", []);
  const isOwner = useMemo(() => tokenPayload?.isOwner === true, [tokenPayload]);
  const isRecepcionista = useMemo(() => tokenPayload?.role === "RECEPCIONISTA", [tokenPayload]);
  const isAdmin = useMemo(() => tokenPayload?.role === "ADMIN", [tokenPayload]);
  
  const ownerUsername = useMemo(() => {
    const tenant = localStorage.getItem("tenant");
    if (!tenant) return null;
    try {
      return JSON.parse(tenant).ownerUsername || JSON.parse(tenant).email?.split("@")[0] || null;
    } catch {
      return null;
    }
  }, []);

  const canEditEmployee = useMemo(() => {
    if (isDemo) return false;
    return true;
  }, [isDemo]);

  const canEditConfig = useMemo(() => {
    if (isDemo) return false;
    return true;
  }, [isDemo]);

  const canEditOwnerFields = useMemo(() => {
    if (isDemo) return false;
    return true;
  }, [isDemo]);

  const ownerEditableFields = useMemo(() => {
    if (isDemo) {
      return {
        email: false,
        businessName: false,
        password: false,
        username: false,
      };
    }
    return {
      email: false,
      businessName: false,
      password: true,
      username: true,
    };
  }, [isDemo]);

  const employeeIdFromToken = useMemo(() => tokenPayload?.employeeId || null, [tokenPayload]);

  return {
    isDemo,
    isOwner,
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
