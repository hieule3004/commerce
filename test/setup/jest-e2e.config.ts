import { Config } from 'jest';

import defaultConfig from './jest.config';

module.exports = {
  ...defaultConfig,
  rootDir: `${defaultConfig.rootDir ?? '../..'}`,
  testRegex: '.*\\.e2e-spec\\.ts$',
  // setupFiles: ['<rootDir>/test/setup/e2e/dotenv-e2e.ts'],
  testTimeout: 10_000,
  cache: false,
} satisfies Config;
