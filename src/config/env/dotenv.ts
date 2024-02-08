import { z } from 'zod';
import { Loglevels } from '@src/config/logging/logging.constant';
import { convert } from '@src/utils/math/convert';

const systemSchema = z.object({
  npm_package_name: z.string().min(1),

  npm_package_dependencies_express: z.string().min(1),
});

const serverSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  LOG_LEVEL: z.enum(Loglevels).default('INFO'),
});

const apiSchema = z.object({
  API_SESSION_NAME: z.string().min(1),
  API_SESSION_KEYS: z.string().transform((s) => s.split(',')),
  API_SESSION_EXPIRY_MS: z.coerce.number().int().positive().default(convert(1, 'h').to('ms')),

  API_REQUEST_SIZE_LIMIT: z
    .union([z.string().regex(/^\d+[kmgtp]?b$/i), z.number().int().positive()])
    .default(convert(5, 'MB').to('B')),
  API_REQUEST_RATE_LIMIT: z.coerce.number().int().positive().default(100),
  API_REQUEST_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(convert(1, 'min').to('ms')),
});

const httpSecureSchema = z
  .object({
    HTTP_SECURE: z
      .enum(['true', 'false'])
      .transform((s) => s === 'true')
      .default('false'),
    HTTP_CA_CERT: z.string().min(1).optional(),
    HTTP_CA_KEY: z.string().min(1).optional(),
    HTTP_CA_PASS: z.string().min(1).optional(),
  })
  .refine((e) => !e.HTTP_SECURE || (e.HTTP_CA_CERT && e.HTTP_CA_KEY && e.HTTP_CA_PASS), {
    message: 'Missing variables when feature is on: HTTP_SECURE',
  });

const redisSchema = z.object({
  REDIS_URL: z.string().url(),
});

const pgSchema = z.object({
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().positive(),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
});

/** DotEnv schema */
const dotEnvValidator = systemSchema
  .and(serverSchema)
  .and(apiSchema)
  .and(httpSecureSchema)
  .and(redisSchema)
  .and(pgSchema);

/** DotEnv type */
type DotEnv = z.infer<typeof dotEnvValidator>;

export { DotEnv, dotEnvValidator };
