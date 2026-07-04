export const CURRENCY_SYMBOL = "₹";

export function formatINR(amount, { decimals = 0 } = {}) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${CURRENCY_SYMBOL}0`;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatINRCompact(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${CURRENCY_SYMBOL}0`;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
