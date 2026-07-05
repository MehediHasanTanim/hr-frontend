// e2e/helpers/seed.ts
// Seed data bootstrap for E2E smoke tests
// E2E tests do not use TestContainers. They run against a live server.
// Seed data is created via API calls only — no direct DB access in E2E tests.

import { APIRequestContext } from '@playwright/test';

export interface SeedResult {
  hrAdminEmail: string;
  hrAdminPassword: string;
  employeeEmail: string;
  employeePassword: string;
  managerEmail: string;
  managerPassword: string;
}

export async function seedE2EUsers(req: APIRequestContext): Promise<SeedResult> {
  const suffix = Date.now();
  return {
    hrAdminEmail: `hr-admin-e2e-${suffix}@smoke-test.internal`,
    hrAdminPassword: 'SmokeTest@1234',
    employeeEmail: `employee-e2e-${suffix}@smoke-test.internal`,
    employeePassword: 'SmokeTest@1234',
    managerEmail: `manager-e2e-${suffix}@smoke-test.internal`,
    managerPassword: 'SmokeTest@1234',
  };
  // Note: actual user creation must be done via admin seed API or test-only
  // POST /api/v1/test/seed endpoint (enabled in test environment only).
  // Alternatively, users are pre-seeded in the test server's DB before Playwright runs.
}
