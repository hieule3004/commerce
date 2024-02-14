import { IIdempotencyDataAdapter, IdempotencyResource } from 'express-idempotency';
import { Cache } from '@src/config/cache/cache.service';


/** Idempotency adapter.
 *  Modified from https://github.com/alias-rahil/express-idempotency-redis-adapter */
const idempotencyAdapter = (
  cache: Cache,
  keyPrefix: string,
  ttl: number,
): IIdempotencyDataAdapter => {
  const getKey = (idempotencyKey: string) => `${keyPrefix}${idempotencyKey}`;
  return {
    findByIdempotencyKey: async (idempotencyKey: string) => {
      const str = await cache.get(getKey(idempotencyKey));
      return str ? (JSON.parse(str) as IdempotencyResource) : null;
    },
    create: async (resource: IdempotencyResource) => {
      await cache.set(getKey(resource.idempotencyKey), JSON.stringify(resource), { EX: ttl });
    },
    update: async (resource: IdempotencyResource) => {
      await cache.set(getKey(resource.idempotencyKey), JSON.stringify(resource), { EX: ttl });
    },
    delete: async (idempotencyKey: string) => {
      await cache.del(getKey(idempotencyKey));
    },
  };
};

export { idempotencyAdapter };
