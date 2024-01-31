import { NextFunction } from 'express';
import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { Layer, Request, RequestHandler, Response, Router } from '@src/utils/application';
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
    if (this.name === 'router') {
      this.handle(req, res, next);
      Object.assign(Object.assign(params, this.params), scanParams(this.handle as Router));
    }
    next();
  };
  router.handle(req, res, next);
  prototype.handle_request = handleRequest;

  const { path } = req;

  const { method, url, query } = req;
  const body = req.body as unknown;

  return { requestId, method, url, path, params, query, body };
}

function scanParams(router: Router) {
  return (router.stack as Layer[])
    .map((layer): object => {
      switch (layer.name) {
        case 'bound dispatch':
          return layer.params as object;
        case 'router':
          return scanParams(layer.handle as Router);
        default:
          return {};
      }
    })
    .reduce((t, o) => Object.assign(t, o), {});
}

function buildResponseLog(res: Response): ResponseLogDto {
  const requestId = res.getHeader(X_REQUEST_ID) as string;
  const code = res.statusCode;
  const message = res.statusMessage;
  const elapsedMs = Date.now() - Number(res.req.headers[X_REQUEST_TIMESTAMP]);

  return { requestId, code, message, elapsedMs };
}

export default logRequest;
