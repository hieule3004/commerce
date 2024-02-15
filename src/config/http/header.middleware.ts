import { CustomHeaders } from '@src/common/http/header';
import { RequestHandler } from '@src/utils/application';
import { decodeTime, nsid } from '@src/utils/nsid';

const customHeader: RequestHandler = (req, res, next) => {
  // set custom request id
  const requestId = nsid();
  req.headers[CustomHeaders.X_REQUEST_ID] = requestId;
  res.setHeader(CustomHeaders.X_REQUEST_ID, requestId);

  // set custom request timestamp
  req.headers[CustomHeaders.X_REQUEST_TIMESTAMP] = String(decodeTime(requestId));

  // set permissions policy: https://github.com/helmetjs/helmet/issues/234
  res.setHeader(CustomHeaders.PERMISSIONS_POLICY, 'geolocation=(), payment=(), usb=()');

  next();
};

export { customHeader };
