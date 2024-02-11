import dotenv from 'dotenv';
import { ValidationException } from '@src/common/exceptions/ValidationException';
import { DotEnv, dotEnvValidator } from '@src/config/env/dotenv';
import { ApplicationLogger } from '@src/config/logging/logging.config';
import * as process from '@src/utils/node/process';

const parseEnv = (env: unknown, logger?: ApplicationLogger) => {
  const result = dotEnvValidator.safeParse(env);
  if (!result.success) {
    (logger ?? console).error(result.error.format());
    throw new ValidationException(result.error);
  }
  return result.data;
};

type ConfigOptions = { logger?: ApplicationLogger };

const Config = ({ logger }: ConfigOptions = {}) => {
  const env = { ...process.env } as Record<string, string>;
  dotenv.config({ path: process.env.ENV_PATH!, processEnv: env });
  const dotEnv = parseEnv(env, logger);

  return { fromEnv: <K extends keyof DotEnv>(key: K) => dotEnv[key] };
};
type Config = ReturnType<typeof Config>;

export { Config };
