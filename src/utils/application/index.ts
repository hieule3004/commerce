import express from 'express';

const createApplication = () => express();

export { createApplication };

export {
  Application,
  ErrorRequestHandler,
  RequestHandler,
  Request,
  Response,
  NextFunction,
  json,
  urlencoded,
  static as serveStatic,
} from 'express';