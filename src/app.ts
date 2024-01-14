import express from 'express';
import { fromEnv } from '@src/config/dotenv';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { configureErrMiddleware, configureMiddleware } from '@src/middleware';
import { configureRoute } from '@src/route';

const app = express();

const logger = ApplicationLogger({ level: fromEnv('LOG_LEVEL') });
app.set('LoggerService', logger);

configureMiddleware(app);
configureRoute(app);
configureErrMiddleware(app);

export default app;