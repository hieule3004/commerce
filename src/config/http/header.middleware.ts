import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { RequestHandler } from '@src/utils/application';
import { nsid } from '@src/utils/nsid';

const addCustomHeader: RequestHandler = (req, res, next) => {
  // set custom request timestamp
  req.headers[X_REQUEST_TIMESTAMP] = String(Date.now());

  // set custom request id
  const requestId = nsid();
  req.headers[X_REQUEST_ID] = requestId;
  res.setHeader(X_REQUEST_ID, requestId);

  next();
};

export default addCustomHeader;