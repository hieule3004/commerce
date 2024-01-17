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
  static as serveStatic,
  Router,
} from 'express';