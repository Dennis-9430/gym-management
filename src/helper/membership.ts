
export const getDaysRemaining = (endDate: Date) => {
  const today = new Date();
  const diff = endDate.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
};
export const getMembershipStatus = (endDate: Date) => {
  const days = getDaysRemaining(endDate);
  if (days <= 0) return "EXPIRED";
  return "ACTIVE";
};
