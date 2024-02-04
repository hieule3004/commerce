import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../../tsconfig.json';

export default {
  testEnvironment: 'node',
  rootDir: '../..',
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  transform: { '^.+\\.(t|j)sx?$': '@swc/jest' },
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/global.setup.ts',
    '<rootDir>/test/setup/dotenv.setup.ts',
  ],
  maxWorkers: 1,
  runner: '<rootDir>/test/setup/runner.config.ts' /* simulate --runInBand */,
} as JestConfigWithTsJest;
