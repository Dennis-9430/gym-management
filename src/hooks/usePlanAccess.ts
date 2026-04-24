/* Hook para verificar acceso por plan */
import { getTenantPlan } from "../services/api";

/* Hook para verificar acceso */
export const usePlanAccess = () => {
  const isPremium = (): boolean => {
    const plan = getTenantPlan();
    return plan === "PREMIUM";
  };

  const checkAccess = (feature: string): boolean => {
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
  };
  
  return {
    checkAccess,
    isPremium
  };
};