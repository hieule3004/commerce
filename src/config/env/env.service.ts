import process from 'node:process';
import { DotEnv, dotEnvValidator } from '@src/config/env/env.utils';

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

export { fromEnv };
