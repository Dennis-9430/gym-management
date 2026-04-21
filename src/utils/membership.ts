
/* Calcula dias restantes hasta fecha de fin */
export const getDaysRemaining = (endDate: Date) => {
  const today = new Date();
  const diff = endDate.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
};
/* Retorna estado de membresia segun dias restantes */
export const getMembershipStatus = (endDate: Date) => {
  const days = getDaysRemaining(endDate);
  if (days <= 0) return "EXPIRED";
  return "ACTIVE";
};
