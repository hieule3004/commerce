import { fromEnv } from '@src/config/dotenv';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { configureErrorMiddleware, configureMiddleware } from '@src/middleware';
import { configureRoute } from '@src/route';
import { createApplication } from '@src/utils/application';

const app = createApplication();

const logger = ApplicationLogger({ level: fromEnv('LOG_LEVEL') });
app.set('LoggerService', logger);

configureMiddleware(app);
configureRoute(app);
configureErrorMiddleware(app);

export default app;