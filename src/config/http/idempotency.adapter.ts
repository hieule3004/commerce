import { IIdempotencyDataAdapter, IdempotencyResource } from 'express-idempotency';
import { Cache } from '@src/config/cache/cache.service';


/** Idempotency adapter.
 *  Modified from https://github.com/alias-rahil/express-idempotency-redis-adapter */
const idempotencyAdapter = (cache: Cache, ttl: number): IIdempotencyDataAdapter => ({
  findByIdempotencyKey: async (idempotencyKey: string) => {
    const str = await cache.get(idempotencyKey);
    return str ? (JSON.parse(str) as IdempotencyResource) : null;
  },
  create: async (resource: IdempotencyResource) => {
    await cache.set(resource.idempotencyKey, JSON.stringify(resource), { EX: ttl });
  },
  update: async (resource: IdempotencyResource) => {
    await cache.set(resource.idempotencyKey, JSON.stringify(resource), { EX: ttl });
  },
  delete: async (idempotencyKey: string) => {
    await cache.del(idempotencyKey);
  },
});

export { idempotencyAdapter };
