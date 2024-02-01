import { NextFunction } from 'express';
import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { Layer, Request, RequestHandler, Response } from '@src/utils/application';
import { RequestLogDto, ResponseLogDto } from './logging.interface';
import { ApplicationLogger } from './logging.utils';


const logRequest: RequestHandler = (req, res, next) => {
  const logger = req.app.get('LoggerService') as ApplicationLogger;

  const requestDto = buildRequestLog(req, res, next);
  logger.log(requestDto);

  const $ = res.json;
  res.json = function (data: object) {
    const responseDto = buildResponseLog(res);
    logger.log(responseDto);
    return $.call(this, data);
  };

  next();
};

function buildRequestLog(req: Request, res: Response, next: NextFunction): RequestLogDto {
  const requestId = req.headers[X_REQUEST_ID] as string;

  const params = {};
  const router = req.app._router as Layer;
  const prototype = Object.getPrototypeOf(router.stack[0]) as Layer;
  const handleRequest = prototype.handle_request;
  prototype.handle_request = function (req, res, next) {
    if (this.name === 'bound dispatch') Object.assign(params, req.params);
    else if (this.name === 'router') this.handle(req, res, next);
    next();
  };
  router.handle(req, res, next);
  prototype.handle_request = handleRequest;

  const { path } = req.route as { path: string };
  const { method, url, query } = req;
  const body = req.body as unknown;

  return { requestId, method, url, path, params, query, body };
}

function buildResponseLog(res: Response): ResponseLogDto {
  const requestId = res.getHeader(X_REQUEST_ID) as string;
  const code = res.statusCode;
  const message = res.statusMessage;
  const elapsedMs = Date.now() - Number(res.req.headers[X_REQUEST_TIMESTAMP]);

  return { requestId, code, message, elapsedMs };
}

export default logRequest;
