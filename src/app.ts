import { fromEnv } from '@src/config/dotenv';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { configureMiddleware } from '@src/middleware';
import { createApplication } from '@src/utils/application';

const app = createApplication();

const logger = ApplicationLogger({ level: fromEnv('LOG_LEVEL') });
app.set('LoggerService', logger);

configureMiddleware(app);

export default app;
