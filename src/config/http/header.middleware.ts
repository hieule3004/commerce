import express from 'express';
import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { nsid } from '@src/utils/nsid';

export default function addCustomHeader(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  // set custom request timestamp
  req.headers[X_REQUEST_TIMESTAMP] = String(Date.now());

  // set custom request id
  const requestId = nsid();
  req.headers[X_REQUEST_ID] = requestId;
  res.setHeader(X_REQUEST_ID, requestId);

  next();
}