import process from 'node:process';
import { z } from 'zod';
import { Loglevels } from '@src/config/logging/logging.constant';
import { convert } from '@src/utils/math/convert';

const systemSchema = z.object({
  npm_package_name: z.string().min(1),
});

const serverSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  LOG_LEVEL: z.enum(Loglevels).default('INFO'),
});

const httpSchema = z.object({
  HTTP_REQUEST_SIZE_LIMIT: z
    .union([z.string().regex(/^\d+[kmgtp]?b$/i), z.number().int().positive()])
    .default(convert(5, 'MB').to('B')),
  HTTP_REQUEST_RATE_LIMIT: z.coerce.number().int().positive().default(100),
  HTTP_REQUEST_RATE_LIMIT_WINDOW_MS: z.coerce
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

const cookieSchema = z.object({
  API_SESSION_NAME: z.string().min(1),
  API_SESSION_KEYS: z.string().transform((s) => s.split(',')),

  COOKIE_SESSION_NAME: z.string().min(1),
  COOKIE_SESSION_KEYS: z.string().transform((s) => s.split(',')),
  COOKIE_SESSION_EXPIRY_MS: z.coerce.number().int().positive().default(convert(1, 'h').to('ms')),
});

/** DotEnv schema */
const dotEnvValidator = systemSchema
  .and(serverSchema)
  .and(httpSchema)
  .and(httpSecureSchema)
  .and(cookieSchema);

/** DotEnv type */
type DotEnv = z.infer<typeof dotEnvValidator>;

const parseEnv = (env: unknown) => {
  const result = dotEnvValidator.safeParse(env);
  if (!result.success) {
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
};

/** DotEnv object */
const dotEnv = parseEnv(process.env);

/** Get environment variable */
const fromEnv = <K extends keyof DotEnv>(key: K) => dotEnv[key];

export { DotEnv, fromEnv, parseEnv };
