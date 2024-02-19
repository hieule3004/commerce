import http from 'node:http';
import http2 from 'node:http2';

class HttpException extends Error {
  constructor(
    readonly status: number,
    readonly response?: string | object,
    readonly cause?: Error,
  ) {
    super(typeof response === 'string' ? response : StatusCodes[status], { cause });
  }

  getStatus() {
    return this.status;
  }

  getResponse() {
    return this.response;
  }
}

const constants = http2.constants;

const ConstantsPrefixes = ['HTTP2_HEADER', 'HTTP2_METHOD', 'HTTP_STATUS'] as const;

/** HTTP status code to message map. Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status */
const StatusCodes = Object.freeze(http.STATUS_CODES);

type FilterPrefix<K, P extends string> = K extends `${P}_${string}` ? K : never;
type ExtractPrefix<K, P extends string> = K extends `${P}_${infer S}` ? S : never;
const ConstantExtract = <T, P extends (typeof ConstantsPrefixes)[number]>(
  prefix: P,
  mapper: (v: (typeof constants)[FilterPrefix<keyof typeof constants, P>]) => T,
) => {
  type KeyEnum = ExtractPrefix<keyof typeof constants, P>;
  return Object.entries(constants).reduce(
    (target, [k, v]) => {
      if (k.startsWith(prefix)) {
        const key = k.substring(prefix.length + 1) as KeyEnum;
        target[key] = mapper(v as (typeof constants)[FilterPrefix<keyof typeof constants, P>]);
      }
      return target;
    },
    {} as Record<KeyEnum, T>,
  );
};

/** HTTP status enum. Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status */
const HttpStatus = ConstantExtract('HTTP_STATUS', (status) => {
  const message = StatusCodes[status];
  const toException = (options: { message?: string; cause?: Error } = {}) =>
    new HttpException(status, options.message ?? message, options.cause);

  return { status, message, toException };
});

const HttpMethod = ConstantExtract('HTTP2_METHOD', (m) => m);

const HttpHeader = ConstantExtract('HTTP2_HEADER', (h) => h);

export { HttpException, HttpHeader, HttpMethod, HttpStatus, StatusCodes };
