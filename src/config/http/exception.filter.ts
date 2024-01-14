import express from 'express';
import { Writable } from '@src/utils/type';
import HttpException from './exceptions/HttpException';

export default function exceptionFilter(
  err: string | object,
  _: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const exception = err instanceof HttpException ? err : new HttpException(500, err);
  const e = buildErrorResponse(exception);
  res.status(e.getStatus()).json(e.getResponse());
  next();
}

function buildErrorResponse(exception: HttpException) {
  const code = exception.getStatus();
  const descOrErr = exception.getResponse();

  const message = typeof descOrErr === 'string' ? descOrErr : (descOrErr as Error).message;
  const meta = descOrErr instanceof Error ? descOrErr : exception.cause;

  (exception as Writable<HttpException>).response = { error: { code, message, meta } };
  return exception;
}