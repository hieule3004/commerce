import process from 'node:process';
import { z } from 'zod';
import { Loglevels } from '@src/config/logging/logging.constant';
import { convert } from '@src/utils/math/convert';

const dotEnvValidator = z.object({
  PORT: z.coerce.number().int().positive(),
  LOG_LEVEL: z.enum(Loglevels).default('INFO'),

  HTTP_REQUEST_SIZE_LIMIT: z
    .union([z.string().regex(/^\d+[kmgtp]?b$/i), z.number().int().positive()])
    .default(convert(5, 'MB').to('B')),
  HTTP_REQUEST_RATE_LIMIT: z.coerce.number().int().positive().default(100),
  HTTP_REQUEST_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(convert(1, 'min').to('ms')),

  HTTP_SECURE: z
    .enum(['true', 'false'])
    .transform((s) => s === 'true')
    .default('false'),
  HTTP_CA_CERT: z.string().min(1),
  HTTP_CA_KEY: z.string().min(1),
  HTTP_CA_PASS: z.string().min(1),

  API_SESSION_NAME: z.string().min(1),
  API_SESSION_KEYS: z.string().transform((s) => s.split(',')),

  COOKIE_SESSION_NAME: z.string().min(1),
  COOKIE_SESSION_KEYS: z.string().transform((s) => s.split(',')),
  COOKIE_SESSION_EXPIRY_MS: z.coerce.number().int().positive().default(convert(1, 'h').to('ms')),
});

type DotEnv = z.infer<typeof dotEnvValidator>;

const dotEnv = dotEnvValidator.parse(process.env);

const fromEnv = <K extends keyof DotEnv>(key: K) => dotEnv[key];

export { DotEnv, fromEnv };