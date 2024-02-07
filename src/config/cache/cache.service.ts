import { RedisClientType, createClient } from 'redis';
import { ApplicationLogger } from '@src/config/logging/logging.utils';

type CacheOptions = Parameters<typeof createClient>[0];
type LoggerOptions = { logger: ApplicationLogger; appId: string };

const Cache = async (options: CacheOptions, loggerOptions: LoggerOptions) => {
  const { logger, appId: id } = loggerOptions;

  const client = createClient(options);

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
