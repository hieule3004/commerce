import defaultConfig from './jest.config';

module.exports = {
  ...defaultConfig,
  testRegex: '.*\\.e2e-spec\\.ts$',
  testTimeout: 10_000,
  cache: false,
} satisfies typeof defaultConfig;
