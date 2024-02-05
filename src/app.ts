import RedisStore from 'connect-redis';
import { Cache } from '@src/config/cache/cache.service';
import { fromEnv } from '@src/config/dotenv';
import { exceptionFilter } from '@src/config/http/exception.filter';
import { addCustomHeader } from '@src/config/http/header.middleware';
import { logData, logRequest } from '@src/config/logging/logging.middleware';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { configureRoutes } from '@src/route';
import { Application, serveStatic } from '@src/utils/application';
import {
  compression,
  cookieParser,
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

async function createApplication() {
  const app = Application();

  app.set('LoggerService', ApplicationLogger({ level: fromEnv('LOG_LEVEL') }));
  app.set('Cache', await Cache());

  configureMiddleware(app);

  return app;
}

function configureMiddleware(app: Application) {
  const cache = app.get('Cache') as Cache;

  app.use(serveStatic('public'));

  app.use(cors({}));
  app.use(helmet());
  // app.disable('X-Powered-By'.toLowerCase());
  app.use(methodOverride());
  app.use(compression());

  app.set('query parser', 'extended');
  const limit = fromEnv('HTTP_REQUEST_SIZE_LIMIT');
  app.use(json({ limit }));
  app.use(urlencoded({ extended: true, limit }));
  app.use(cookieParser(fromEnv('API_SESSION_KEYS')));

  // express session, setup after cookie session to avoid session modify
  // Reference: https://davidburgos.blog/expressjs-session-error-req-session-touch-not-function
  app.set('trust proxy', 1);
  app.use(
    session({
      store: new RedisStore({ client: cache, prefix: `${fromEnv('npm_package_name')}:session:` }),
      name: fromEnv('API_SESSION_NAME'),
      secret: fromEnv('API_SESSION_KEYS'),
      cookie: { maxAge: fromEnv('API_SESSION_EXPIRY_MS') },
      genid: () => nsid(),
      resave: true,
      saveUninitialized: true,
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
  app.use(addCustomHeader);
  app.use(logRequest);

  app.use(logData);

  // routing
  configureRoutes(app);

  // exception filter
  app.use(exceptionFilter);
}

export { createApplication };
