import express from 'express';
import { X_REQUEST_ID } from '@src/config/http/http.constant';
import { ApplicationLogger } from '@src/config/logging/logging.utils';

export default function logResponseData(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const logger = req.app.get('LoggerService') as ApplicationLogger;
  const requestId = req.headers[X_REQUEST_ID] as string;

  const $ = res.json;
  res.json = function (data: object) {
    if ('error' in data) logger.debug({ requestId, error: data.error });
    else logger.debug({ requestId, data });

    return $.call(this, data);
  };

  next();
}