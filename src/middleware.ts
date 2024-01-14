import compression from 'compression';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import expressSession from 'express-session';
import helmet from 'helmet';
import methodOverride from 'method-override';
import { fromEnv } from '@src/config/dotenv';
import exceptionFilter from '@src/config/http/exception.filter';
import customHeaders from '@src/config/http/header.middleware';
import logResponseData from '@src/config/logging/logging.interceptor';
import logRequest from '@src/config/logging/logging.middleware';
import { HttpStatus } from '@src/utils/http';
import { nsid } from '@src/utils/nsid';

export function configureMiddleware(app: express.Express) {
  app.use(express.static('public'));

  app.use(cors({}));
  app.use(helmet());
  // remove from request header
  app.disable('X-Powered-By'.toLowerCase());
  app.use(methodOverride());
  app.use(compression());

  const limit = fromEnv('HTTP_REQUEST_SIZE_LIMIT');
  app.use(express.json({ limit }));
  app.use(express.urlencoded({ extended: true, limit }));
  app.use(cookieParser());

  // cookie session
  app.use(
    cookieSession({
      name: fromEnv('COOKIE_SESSION_NAME'),
      keys: fromEnv('COOKIE_SESSION_KEYS'),
      secure: true,
      httpOnly: true,
      expires: new Date(Date.now() + fromEnv('COOKIE_SESSION_EXPIRY_MS')),
    }),
  );
  // express session, setup after cookie session to avoid session modify
  // Reference: https://davidburgos.blog/expressjs-session-error-req-session-touch-not-function
  app.set('trust proxy', 1);
  app.use(
    expressSession({
      name: fromEnv('API_SESSION_NAME'),
      secret: fromEnv('API_SESSION_KEYS'),
      genid: () => nsid(),
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(
    rateLimit({
      windowMs: fromEnv('HTTP_REQUEST_RATE_LIMIT_WINDOW_MS'),
      limit: fromEnv('HTTP_REQUEST_RATE_LIMIT'),
      handler: () => {
        throw HttpStatus.TOO_MANY_REQUESTS.toException();
      },
      standardHeaders: true,
    }),
  );

  // custom middleware
  app.use(customHeaders);
  app.use(logRequest);
  app.use(logResponseData);
}

export function configureErrMiddleware(app: express.Express) {
  app.use(exceptionFilter);
}