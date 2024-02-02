import { RedisClientType, createClient } from 'redis';
import { fromEnv } from '@src/config/dotenv';

const Cache = async () => {
  const client = createClient({
    url: fromEnv('REDIS_URL'),
  });
  return await client.connect();
};

type Cache = RedisClientType;

export { Cache };
