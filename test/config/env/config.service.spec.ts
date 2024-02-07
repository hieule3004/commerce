import { Config } from '@src/config/env/config.service';
import { ApplicationLogger } from '@src/config/logging/logging.utils';

describe('Config', () => {
  const config = Config({ logger: ApplicationLogger() });
  it('load package json', () => expect(config.fromEnv('npm_package_name')).toBeDefined());
  it('load from env file', () => expect(config.fromEnv('REDIS_URL')).toBeDefined());
});
