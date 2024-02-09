import { major, minVersion } from 'semver';
import { JsonDto, JsonErrorDto } from '@src/common/dtos/json.dto';
import { Config } from '@src/config/env/config.service';
import { X_REQUEST_ID, X_REQUEST_TIMESTAMP } from '@src/config/http/http.constant';
import { Layer, Request, RequestHandler, Response } from '@src/utils/application';
import { HttpMethod, HttpStatus, StatusCodes } from '@src/utils/http/http';
import { ApplicationLogger } from './logging.utils';


const ignores: Record<string, (keyof typeof HttpMethod)[]> = {
  '/health': ['GET'],
};

const logRequest: RequestHandler = (req, res, next) => {
  dryRunRoute(req, res, next);

  if (!isIgnoredEndpoint(req)) {
    const logger = req.app.get('Logger') as ApplicationLogger;

    const requestDto = buildRequestLog(req);
    logger.log(requestDto);

    const $ = res.json;
    res.json = function (data: object) {
      const responseDto = buildResponseLog(res);
      logger.log(responseDto);
      return $.call(this, data);
    };
  }

  next();
};

const logData: RequestHandler = function (req, res, next) {
  if (!isIgnoredEndpoint(req)) {
    const logger = req.app.get('Logger') as ApplicationLogger;
    const id = req.headers[X_REQUEST_ID] as string;
    const sid = req.sessionID;

    const $ = res.json;
    res.json = function (data: object) {
      if ('error' in data) logger.debug({ id, sid, type: 'error', ...data } as JsonErrorDto);
      else logger.debug({ id, sid, type: 'data', data } as JsonDto);

      return $.call(this, data);
    };
  }

  next();
};

const dryRunRoute: RequestHandler = (req, res, next) => {
  const config = req.app.get('Config') as Config;

  const isV5 = major(minVersion(config.fromEnv('npm_package_dependencies_express'))!) === 5;
  const routerName = isV5 ? 'router' : '_router';
  const layerHandleProp = isV5 ? 'handleRequest' : 'handle_request';
  const baseHandleName = isV5 ? 'handle' : 'bound dispatch';

  const router = req.app[routerName] as unknown as Layer;
  const prototype = Object.getPrototypeOf(router.stack[0]) as Layer;
  const handleRequest = prototype[layerHandleProp];
  prototype[layerHandleProp] = function (req, res, next) {
    if (this.name === baseHandleName) return;
    if (this.name === 'router') this.handle(req, res, next);
    next();
  };
  router.handle(req, res, next);
  prototype[layerHandleProp] = handleRequest;
}

function isIgnoredEndpoint(req: Request) {
  const path = (req.route as { path?: string })?.path;
  return path && ignores[path]?.includes(req.method.toUpperCase() as keyof typeof HttpMethod);
}

function buildRequestLog(req: Request): JsonDto {
  const id = req.headers[X_REQUEST_ID] as string;

  const route = req.route as { path: string } | undefined;
  if (!route) throw HttpStatus.NOT_FOUND.toException();
  const params = req.params;
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
