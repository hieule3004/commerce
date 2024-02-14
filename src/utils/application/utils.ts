import { RequestHandler } from 'express';


/** Async handler. Typed version of https://github.com/Abazhenov/express-async-handler */
const asyncHandler: (
  handler: (...args: Parameters<RequestHandler>) => Promise<void>,
) => RequestHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch((e) => next(e));

/** Monkey patching res function. Simplified from https://github.com/richardschneider/express-mung */
const patchHandler =
  <T = unknown>(key: 'json' | 'send', fn: (data: T) => void): RequestHandler =>
  (req, res) => {
    const original = res[key];
    res[key] = function __patch__(data: T) {
      if (res.headersSent) return res;
      fn(data);
      if (res.headersSent) return res;
      return original.call(this, data);
    };
  };

export { asyncHandler, patchHandler };
