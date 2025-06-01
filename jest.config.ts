// jest.config.ts
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'mjs',
        'cjs',
        'json',
        'node',
    ],
    moduleNameMapper: {
        '^../../../../(src/.+)\\.js$': '<rootDir>/$1.ts',
        '^(\\.{1,2}/.*)\\.js$': '$1',
        // If absolute aliases are used, add them here, e.g.:
        // '^@src/(.*)$': '<rootDir>/src/$1.ts',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
    ],
    testMatch: ['**/tests/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
};

export default config;