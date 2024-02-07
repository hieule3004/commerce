import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { RequestHandler } from '@src/utils/application';
import { decodeTime, nsid } from '@src/utils/nsid';

const customHeader: RequestHandler = (req, res, next) => {
  // set custom request id
  const requestId = nsid();
  req.headers[X_REQUEST_ID] = requestId;
  res.setHeader(X_REQUEST_ID, requestId);

  // set custom request timestamp
  req.headers[X_REQUEST_TIMESTAMP] = String(decodeTime(requestId));

  next();
};

export { customHeader };
