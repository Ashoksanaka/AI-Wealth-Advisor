export function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value) || 0;
}

export function serializeDecimalFields(obj, fields) {
  const serialized = { ...obj };
  for (const field of fields) {
    if (serialized[field] != null) {
      serialized[field] = toNumber(serialized[field]);
    }
  }
  return serialized;
}
