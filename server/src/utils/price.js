// Giảm giá chỉ có hiệu lực khi không có hạn (giảm giá thường) hoặc hạn chưa hết
const getEffectiveDiscount = (p, now = new Date()) => {
  const d = Number(p.discountProduct) || 0;
  if (d <= 0) return 0;
  if (p.dateEnd && new Date(p.dateEnd) <= now) return 0;
  return d;
};

const getFinalPrice = (p) =>
  Math.round(p.priceProduct * (1 - getEffectiveDiscount(p) / 100));

module.exports = { getEffectiveDiscount, getFinalPrice };