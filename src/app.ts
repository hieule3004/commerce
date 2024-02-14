import { idempotencyAdapter } from '@src/config/cache/adapter/idempotency.adapter';
import { SessionStore } from '@src/config/cache/adapter/session.store';
import { Cache } from '@src/config/cache/cache.service';
import { configureModelRoutes } from '@src/config/crud';
import { setupDatabase } from '@src/config/database/database.config';
import { Database } from '@src/config/database/database.service';
import { Config } from '@src/config/env/config.service';
import { exceptionFilter } from '@src/config/http/exception.filter';
import { customHeader } from '@src/config/http/header.middleware';
import { X_IDEMPOTENCY_KEY } from '@src/config/http/header/header.constant';
import { ApplicationLogger } from '@src/config/logging/logging.config';
import { logData, logRequest } from '@src/config/logging/logging.middleware';
import { VersionInfo } from '@src/config/version';
import { configureModels } from '@src/model';
import { configureRoutes } from '@src/route';
import { Application, asyncHandler, serveStatic } from '@src/utils/application';
import {
  compression,
  cookieParser,
  cors,
  helmet,
  idempotency,
  json,
  methodOverride,
  rateLimit,
  session,
  urlencoded,
} from '@src/utils/application/middleware';
import { HttpStatus } from '@src/utils/http/http';
import { nsid } from '@src/utils/nsid';

async function configureApplication() {
  const appId = nsid();
  const config = Config({ logger: ApplicationLogger() });
  const logger = ApplicationLogger({
    level: config.fromEnv('LOG_LEVEL'),
    defaultMeta: { name: config.fromEnv('npm_package_name') },
  });
  const cache = await Cache(
    {
      url: config.fromEnv('REDIS_URL'),
      pingInterval: 10_000,
    },
    { logger, appId },
  );
  const database = await Database(
    {
      dialect: 'postgres',
      host: config.fromEnv('POSTGRES_HOST'),
      port: config.fromEnv('POSTGRES_PORT'),
      database: config.fromEnv('POSTGRES_DB'),
      username: config.fromEnv('POSTGRES_USER'),
      password: config.fromEnv('POSTGRES_PASSWORD'),
    },
    { logger, appId },
  );

  const settings = {
    AppId: appId,
    Config: config,
    Logger: logger,
    Cache: cache,
    Database: database,
  } as const;

  const app = Application();
  for (const [key, value] of Object.entries(settings)) app.set(key, value);

  configureModels(database);
  await setupDatabase(database);

  configureMiddleware(app);

  return app;
}

function configureMiddleware(app: Application) {
  const config = app.get('Config') as Config;
  const cache = app.get('Cache') as Cache;

  app.set('ApiPrefix', config.fromEnv('API_PREFIX'));
  app.set('VersionInfo', VersionInfo(config.fromEnv('npm_package_dependencies_express')));

  app.use(serveStatic('public'));

  app.set('x-powered-by', false);
  app.use(cors({}));
  app.use(helmet());
  app.use(methodOverride());
  app.use(compression());

  app.set('query parser', 'extended');
  const limit = config.fromEnv('API_REQUEST_SIZE_LIMIT');
  app.use(json({ limit }));
  app.use(urlencoded({ extended: true, limit }));
  app.use(cookieParser(config.fromEnv('API_SESSION_KEYS')));

  // express session, setup after cookie session to avoid session modify
  // Reference: https://davidburgos.blog/expressjs-session-error-req-session-touch-not-function
  app.set('trust proxy', 1);
  app.use(
    session({
      store: new SessionStore({
        client: cache,
        prefix: `${config.fromEnv('npm_package_name')}:session:`,
      }),
      name: config.fromEnv('API_SESSION_NAME'),
      secret: config.fromEnv('API_SESSION_KEYS'),
      cookie: { maxAge: config.fromEnv('API_SESSION_EXPIRY_MS') },
      genid: () => nsid(),
      resave: true,
      saveUninitialized: true,
    }),
  );

  app.use(
    rateLimit({
      windowMs: config.fromEnv('API_REQUEST_RATE_LIMIT_WINDOW_MS'),
      limit: config.fromEnv('API_REQUEST_RATE_LIMIT'),
      handler: () => {
        throw HttpStatus.TOO_MANY_REQUESTS.toException();
      },
      standardHeaders: true,
    }),
  );

  // custom middleware
  app.use(customHeader);
  app.use(logRequest);
  app.use(logData);

  // routing

  app.use(
    asyncHandler(
      idempotency({
        idempotencyKeyHeader: X_IDEMPOTENCY_KEY,
        dataAdapter: idempotencyAdapter(
          cache,
          `${config.fromEnv('npm_package_name')}:idempotency:`,
          config.fromEnv('API_IDEMPOTENCY_KEY_TTL'),
        ),
        intentValidator: { isValidIntent: (req) => req.method === 'POST' },
      }),
    ),
  );
  configureModelRoutes(app);
  configureRoutes(app);

  // exception filter
  app.use(exceptionFilter);
}

export { configureApplication };
