import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { Request, RequestHandler, Response } from '@src/utils/application';
import { RequestLogDto, ResponseLogDto } from './logging.interface';
import { ApplicationLogger } from './logging.utils';

const logRequest: RequestHandler = (req, res, next) => {
  const logger = req.app.get('LoggerService') as ApplicationLogger;

  const requestDto = buildRequestLog(req);
  logger.log(requestDto);

  const $ = res.json;
  res.json = function (data: object) {
    const responseDto = buildResponseLog(res);
    logger.log(responseDto);
    return $.call(this, data);
  };

  next();
};

function buildRequestLog(req: Request): RequestLogDto {
  const requestId = req.headers[X_REQUEST_ID] as string;
  const url = req.url;
  const method = req.method;

  return { requestId, method, url };
}

function buildResponseLog(res: Response): ResponseLogDto {
  const requestId = res.getHeader(X_REQUEST_ID) as string;
  const code = res.statusCode;
  const message = res.statusMessage;
  const elapsedMs = Date.now() - Number(res.req.headers[X_REQUEST_TIMESTAMP]);

  return { requestId, code, message, elapsedMs };
}

export default logRequest;
