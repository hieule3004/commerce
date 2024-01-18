import { Config } from 'jest';

import defaultConfig from './jest.config';

module.exports = {
  ...defaultConfig,
  rootDir: `${defaultConfig.rootDir ?? '../..'}`,
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
  cache: false,
} satisfies Config;
