import { major, minVersion } from 'semver';
import { JsonDto, JsonErrorDto } from '@src/common/dtos/json.dto';
import { fromEnv } from '@src/config/dotenv';
import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { Layer, NextFunction, Request, RequestHandler, Response } from '@src/utils/application';
import { HttpStatus, StatusCodes } from '@src/utils/http';
import { ApplicationLogger } from './logging.utils';

const isV5 = () => major(minVersion(fromEnv('npm_package_dependencies_express'))!) === 5;

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
};

const logData: RequestHandler = function (req, res, next) {
  const logger = req.app.get('LoggerService') as ApplicationLogger;
  const id = req.headers[X_REQUEST_ID] as string;
  const sid = req.sessionID;

  const $ = res.json;
  res.json = function (data: object) {
    if ('error' in data) logger.debug({ id, sid, type: 'error', ...data } as JsonErrorDto);
    else logger.debug({ id, sid, type: 'data', data } as JsonDto);

    return $.call(this, data);
  };

  next();
};

function buildRequestLog(req: Request, res: Response, next: NextFunction): JsonDto {
  const id = req.headers[X_REQUEST_ID] as string;

  const v5 = isV5();
  const routerName = v5 ? 'router' : '_router';
  const layerHandleProp = v5 ? 'handleRequest' : 'handle_request';
  const baseHandleName = v5 ? 'handle' : 'bound dispatch';

  const params = {};
  const router = req.app[routerName] as unknown as Layer;
  const prototype = Object.getPrototypeOf(router.stack[0]) as Layer;
  const handleRequest = prototype[layerHandleProp];
  prototype[layerHandleProp] = function (req, res, next) {
    if (this.name === baseHandleName) Object.assign(params, req.params);
    else if (this.name === 'router') this.handle(req, res, next);
    next();
  };
  router.handle(req, res, next);
  prototype[layerHandleProp] = handleRequest;
  const route = req.route as { path: string } | undefined;
  if (!route) throw HttpStatus.NOT_FOUND.toException();
  const path = route.path;

  const sid = req.sessionID;
  const { method, url, query } = req;
  const { body } = req as Record<keyof typeof req, unknown>;

  return { id, sid, type: 'request', data: { method, url, path, params, query, body } };
}

function buildResponseLog(res: Response): JsonDto {
  const id = res.getHeader(X_REQUEST_ID) as string;
  const sid = res.req.sessionID;

  const code = res.statusCode;
  const message = res.statusMessage ?? StatusCodes[code];
  const responseTime = Date.now() - Number(res.req.headers[X_REQUEST_TIMESTAMP]);

  return { id, sid, type: 'response', data: { code, message, responseTime } };
}

export { logRequest, logData };
