import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { RedisClientType, createClient } from 'redis';
import { fromEnv } from '@src/config/dotenv';
import { Application } from '@src/utils/application';

const Cache = async (app: Application) => {
  const logger = app.get('LoggerService') as ApplicationLogger;
  const id = app.get('AppId') as string;

  const client = createClient({
    url: fromEnv('REDIS_URL'),
  });

  client.on('connect', () =>
    logger.log({ id, type: 'cache', data: { message: 'Redis connected' } }),
  );
  client.on('error', ({ message }: Error) =>
    logger.error({ id, type: 'cache', error: { message: `Redis connection failed: ${message}` } }),
  );
  return await client.connect();
};

type Cache = RedisClientType;

export { Cache };
