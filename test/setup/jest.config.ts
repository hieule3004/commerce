import { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  transform: { '^.+\\.(t|j)sx?$': 'ts-jest' },
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/global.setup.ts',
    '<rootDir>/test/setup/dotenv.setup.ts',
  ],
  maxWorkers: 1,
  runner: '<rootDir>/test/setup/runner.config.ts' /* simulate --runInBand */,
};

export default config;
