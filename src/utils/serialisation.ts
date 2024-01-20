/** {@link JSON.stringify} replacer function to redact sensitive information */
export const redact =
  <T>(test: (key: string) => boolean, format?: (key: string, value: unknown) => T) =>
  (key: string, value: unknown) =>
    test(key) ? format?.(key, value) : value;
