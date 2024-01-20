import defaultConfig from './jest.config';

module.exports = {
  ...defaultConfig,
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
  cache: false,
} satisfies typeof defaultConfig;
