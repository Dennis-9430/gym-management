/* Hook para verificar acceso por plan */
/* ⚠️ VISUAL ONLY: backend enforces actual permissions.
 * Este hook decide qué botones/features se muestran en UI.
 * Jamás debe usarse para decidir acceso a datos o rutas protegidas.
 * El backend valida cada request contra el JWT y el plan real del tenant. */
import { useCallback } from "react";
import { getTenantPlan } from "../services/api";

/* Hook para verificar acceso */
export const usePlanAccess = () => {
  // VISUAL ONLY: plan desde localStorage("tenant"), backend tiene el plan real
  const isPremium = useCallback((): boolean => {
    const plan = getTenantPlan();
    return plan === "PREMIUM";
  }, []);

  const checkAccess = useCallback((feature: string): boolean => {
    const plan = getTenantPlan();
    if (!plan) return false;
    
    const basicFeatures = [
      "clients", "memberships", "products", "sales", "attendance"
    ];
    const premiumFeatures = [
      "clients", "memberships", "products", "sales", "attendance",
      "employees", "reports", "config"
    ];
    
    if (plan === "PREMIUM") {
      return premiumFeatures.includes(feature);
    }
    
    return basicFeatures.includes(feature);
  }, []);
  
  return {
    checkAccess,
    isPremium
  };
};