/* Helper para verificar si es cuenta demo */
/* ⚠️ VISUAL ONLY: localStorage("isDemo") es flag local, no fuente de verdad. */
export const isDemoAccount = (): boolean => {
  return localStorage.getItem("isDemo") === "true";
};

/* Helper para verificar si es owner */
/* ⚠️ VISUAL ONLY: localStorage("tenant") es cache de UI. Backend es fuente de verdad. */
export const isOwner = (): boolean => {
  const tenant = localStorage.getItem("tenant");
  if (!tenant) return false;
  try {
    const tenantData = JSON.parse(tenant);
    return tenantData.isOwner === true;
  } catch {
    return false;
  }
};