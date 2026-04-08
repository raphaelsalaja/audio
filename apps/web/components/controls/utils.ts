export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): number {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return 0;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "number" ? current : 0;
}

export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: number,
): Record<string, unknown> {
  const clone = structuredClone(obj);
  const keys = path.split(".");
  let current: Record<string, unknown> = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

export function formatValue(value: number, step?: number): string {
  if (step && step >= 1) return String(Math.round(value));
  if (step && step >= 0.1) return value.toFixed(1);
  return value.toFixed(2);
}
