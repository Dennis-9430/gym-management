/* Helper para verificar si es cuenta demo */
export const isDemoAccount = (): boolean => {
  return localStorage.getItem("isDemo") === "true";
};

/* Helper para verificar si es owner */
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