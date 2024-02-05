"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_jest_1 = require("ts-jest");
var tsconfig_json_1 = require("../../tsconfig.json");
exports.default = {
    testEnvironment: 'node',
    rootDir: '../..',
    roots: ['<rootDir>'],
    modulePaths: [tsconfig_json_1.compilerOptions.baseUrl],
    moduleNameMapper: (0, ts_jest_1.pathsToModuleNameMapper)(tsconfig_json_1.compilerOptions.paths, { prefix: '<rootDir>' }),
    transform: { '^.+\\.(t|j)sx?$': '@swc/jest' },
    moduleFileExtensions: ['ts', 'js', 'json'],
    setupFilesAfterEnv: [
        '<rootDir>/test/setup/global.setup.ts',
        '<rootDir>/test/setup/dotenv.setup.ts',
    ],
    maxWorkers: 1,
    runner: '<rootDir>/test/setup/runner.config.ts' /* simulate --runInBand */,
};
