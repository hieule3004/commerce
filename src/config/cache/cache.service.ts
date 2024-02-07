import { RedisClientType, createClient } from 'redis';
import { fromEnv } from '@src/config/env/env.service';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { Application } from '@src/utils/application';

const Cache = async (app: Application) => {
  const logger = app.get('Logger') as ApplicationLogger;
  const id = app.get('AppId') as string;

  const client = createClient({
    url: fromEnv('REDIS_URL'),
  });

  client.on('connect', () =>
    logger.log({ id, type: 'cache', data: { client: 'redis', message: 'connected' } }),
  );
  client.on('error', (e: Error) =>
    logger.error({ id, type: 'cache', error: { client: 'redis', message: e.message } }),
  );
  return await client.connect();
};

type Cache = RedisClientType;

export { Cache };
