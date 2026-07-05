// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  // ── Per-file coverage thresholds (applies to unit project only) ────────────
  // These MUST live at the root Config level, not inside a project definition.
  // Key = file path relative to rootDir, value = threshold object.
  coverageThreshold: {
    './src/modules/reports/services/report-query.service.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    './src/modules/reports/services/saved-report.service.ts': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    './src/modules/reports/services/report-schedule.service.ts': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    './src/modules/reports/workers/report-export.processor.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/modules/reports/workers/schedule-dispatcher.processor.ts': {
      statements: 90,
      branches: 85,
      functions: 100,
      lines: 90,
    },
    './src/modules/mss/services/mss.service.ts': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },

  projects: [
    // ── Unit tests ─────────────────────────────────────────────────────────
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/*.spec.ts'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/test/integration/',
        '/e2e/',
      ],
      // CORRECT key: setupFilesAfterEach — runs after Jest test framework
      // is installed but before each test file. Used for custom matchers.
      setupFilesAfterEach: ['<rootDir>/test/jest-setup.ts'],
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
      },
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.dto.ts',
        '!src/**/*.entity.ts',
        '!src/**/*.module.ts',
        '!src/main.ts',
        '!src/**/__tests__/**',
        '!src/**/index.ts',
      ],
    },

    // ── Integration tests ───────────────────────────────────────────────────
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/test/integration/**/*.integration.spec.ts'],
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEach: ['<rootDir>/test/jest-setup.ts'],
      testTimeout: 120_000,
      maxWorkers: 1,
      forceExit: true,
    },
  ],
};

export default config;
