export const redact =
  <T>(keys: string[], format?: (key: string, value: unknown) => T) =>
  (key: string, value: unknown) =>
    keys.includes(key) ? format?.(key, value) : value;
