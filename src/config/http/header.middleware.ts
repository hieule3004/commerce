import {
  X_REQUEST_ID,
  X_REQUEST_TIMESTAMP,
  PERMISSIONS_POLICY,
} from '@src/config/http/http.constant';
import { RequestHandler } from '@src/utils/application';
import { decodeTime, nsid } from '@src/utils/nsid';

const customHeader: RequestHandler = (req, res, next) => {
  // set custom request id
  const requestId = nsid();
  req.headers[X_REQUEST_ID] = requestId;
  res.setHeader(X_REQUEST_ID, requestId);

  // set custom request timestamp
  req.headers[X_REQUEST_TIMESTAMP] = String(decodeTime(requestId));

  // set permissions policy: https://github.com/helmetjs/helmet/issues/234
  res.setHeader(PERMISSIONS_POLICY.toLowerCase(), 'geolocation=(), payment=(), usb=()');

  next();
};

export { customHeader };
