import express from 'express';
import * as core from 'express-serve-static-core';

type Layer<
  P = core.ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = core.Query,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> = {
  handle: express.RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>;
  name: string;
  params: object | undefined;
  path: string | undefined;
  regexp: RegExp | undefined;
  keys: { name: string; optional: boolean; offset: number }[];
  route?: { path: string; stack: unknown; methods: object };

  stack: Layer[];

  match: (path: string) => boolean;
  /** express 4 */
  handle_request: express.RequestHandler;
  /** express 5 */
  handleRequest: express.RequestHandler;
};

const Application = () => express();
type Application = express.Application;

export { Layer, Application };

export {
  ErrorRequestHandler,
  IRouter,
  IRouterMatcher,
  RequestHandler,
  Request,
  Response,
  NextFunction,
  static as serveStatic,
  Router,
} from 'express';

export * from './utils';
