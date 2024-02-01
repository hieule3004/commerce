import { fromEnv } from '@src/config/dotenv';
import exceptionFilter from '@src/config/http/exception.filter';
import customHeaders from '@src/config/http/header.middleware';
import logResponseData from '@src/config/logging/logging.interceptor';
import logRequest from '@src/config/logging/logging.middleware';
import { configureRoutes } from '@src/route';
import { Application, serveStatic } from '@src/utils/application';
import {
  compression,
  cookieParser,
  cookieSession,
  cors,
  helmet,
  json,
  methodOverride,
  rateLimit,
  session,
  urlencoded,
} from '@src/utils/application/middleware';
import { HttpStatus } from '@src/utils/http';
import { nsid } from '@src/utils/nsid';

export function configureMiddleware(app: Application) {
  app.use(serveStatic('public'));

  app.use(cors({}));
  app.use(helmet());
  // app.disable('X-Powered-By'.toLowerCase());
  app.use(methodOverride());
  app.use(compression());

  const limit = fromEnv('HTTP_REQUEST_SIZE_LIMIT');
  app.use(json({ limit }));
  app.use(urlencoded({ extended: true, limit }));
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
    session({
      name: fromEnv('API_SESSION_NAME'),
      secret: fromEnv('API_SESSION_KEYS'),
      genid: () => nsid(),
      resave: true,
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

  // routing
  configureRoutes(app);

  // exception filter
  app.use(exceptionFilter);
}
