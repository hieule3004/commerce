import express from 'express';
import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { RequestLogDto, ResponseLogDto } from './logging.interface';
import { ApplicationLogger } from './logging.utils';

export default function logRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const logger = req.app.get('LoggerService') as ApplicationLogger;

  const requestDto = buildRequestLog(req);
  logger.log(requestDto);

  res.on('finish', () => {
    const responseDto = buildResponseLog(res);
    logger.log(responseDto);
  });

  next();
}

function buildRequestLog(req: express.Request): RequestLogDto {
  const requestId = req.headers[X_REQUEST_ID] as string;
  const url = req.url;
  const method = req.method;

  return { requestId, method, url };
}

function buildResponseLog(res: express.Response): ResponseLogDto {
  const requestId = res.getHeader(X_REQUEST_ID) as string;
  const code = res.statusCode;
  const message = res.statusMessage;
  const elapsedMs = Date.now() - Number(res.req.headers[X_REQUEST_TIMESTAMP]);

  return { requestId, code, message, elapsedMs };
}