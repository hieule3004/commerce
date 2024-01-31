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
  handle_request: express.RequestHandler;
};

const createApplication = () => express();

export { Layer, createApplication };

export {
  Application,
  ErrorRequestHandler,
  RequestHandler,
  Request,
  Response,
  NextFunction,
  static as serveStatic,
  Router,
} from 'express';
