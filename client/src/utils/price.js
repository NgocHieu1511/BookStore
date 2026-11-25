export const getEffectiveDiscount = (p) => {
  const d = Number(p?.discountProduct) || 0;
  if (d <= 0) return 0;
  if (p.dateEnd && new Date(p.dateEnd) <= new Date()) return 0;
  return d;
};