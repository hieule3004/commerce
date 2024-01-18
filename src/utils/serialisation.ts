/** {@link JSON.stringify} replacer function to redact sensitive information */
export const redact =
  <T>(test: (key: string) => boolean, format?: (key: string, value: unknown) => T) =>
  (key: string, value: unknown) =>
    test(key) ? format?.(key, value) : value;

export const serialise = <T>(data: T) => JSON.stringify(data);
export const deserialise = <T = unknown>(strOrBuf: string | Buffer) =>
  JSON.parse(strOrBuf.toString()) as T;
