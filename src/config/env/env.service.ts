import process from 'node:process';
import dotenv from 'dotenv';
import { DotEnv, dotEnvValidator } from '@src/config/env/env.utils';

const parseEnv = (env: unknown) => {
  const result = dotEnvValidator.safeParse(env);
  if (!result.success) {
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
};

const Config = () => {
  dotenv.config({ path: process.env.DOTENV_CONFIG_PATH! });
  const dotEnv = parseEnv(process.env);
  return { fromEnv: <K extends keyof DotEnv>(key: K) => dotEnv[key] };
};
type Config = ReturnType<typeof Config>;

export { Config };
