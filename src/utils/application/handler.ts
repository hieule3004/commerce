import { RequestHandler } from 'express';

const asyncHandler: (
  handler: (...args: Parameters<RequestHandler>) => Promise<void>,
) => RequestHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch((e) => next(e));

export { asyncHandler };
