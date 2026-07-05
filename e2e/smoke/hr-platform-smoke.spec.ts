import { test, expect, APIRequestContext } from '@playwright/test';
import { HrApiClient } from '../helpers/api-client';

// ─── Prerequisite: Test server must be running at BASE_URL ─────────────────
// Seed users must be pre-created in the test database with these credentials.
// Credentials come from environment variables set by the CI seed script.

const HR_ADMIN_EMAIL = process.env.E2E_HR_ADMIN_EMAIL!;
const HR_ADMIN_PASSWORD = process.env.E2E_HR_ADMIN_PASSWORD ?? 'SmokeTest@1234';
const EMPLOYEE_EMAIL = process.env.E2E_EMPLOYEE_EMAIL!;
const EMPLOYEE_PASSWORD = process.env.E2E_EMPLOYEE_PASSWORD ?? 'SmokeTest@1234';
const MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL!;
const MANAGER_PASSWORD = process.env.E2E_MANAGER_PASSWORD ?? 'SmokeTest@1234';

// ─── Step 1: Register Company / HR Admin ──────────────────────────────────

test.describe('Step 1: Platform registration', () => {
  test('health check confirms server is running', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toMatch(/ok|healthy/i);
  });

  test('security headers are present on health endpoint', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['x-frame-options']).toBe('DENY');
    expect(res.headers()['content-security-policy']).toBeDefined();
  });

  test('HR admin can log in', async ({ request }) => {
    const client = new HrApiClient(request);
    await expect(client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD)).resolves.toBeUndefined();
  });

  test('unauthenticated request to protected endpoint returns 401', async ({ request }) => {
    const res = await request.get('/api/v1/me');
    expect(res.status()).toBe(401);
  });

  test('HR admin GET /auth/me returns correct role', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const res = await client.get('/api/v1/auth/me');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.role).toBe('HR_ADMIN');
    expect(body.leaveBalances).toBeDefined();
    expect(Array.isArray(body.leaveBalances)).toBeTruthy();
    expect(typeof body.pendingTaskCount).toBe('number');
    expect(typeof body.unreadNotificationCount).toBe('number');
  });
});

// ─── Step 2: Create Employee ───────────────────────────────────────────────

test.describe('Step 2: Employee creation', () => {
  let createdEmployeeId: string;

  test('HR admin can fetch employee list', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const res = await client.get('/api/v1/admin/employees');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('HR admin can view pre-seeded employee', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const listRes = await client.get('/api/v1/admin/employees');
    expect(listRes.ok()).toBeTruthy();

    const { data } = await listRes.json();
    const emp = data.find((e: { email: string }) => e.email === EMPLOYEE_EMAIL);

    if (emp) {
      createdEmployeeId = emp.id;
      const detailRes = await client.get(`/api/v1/admin/employees/${createdEmployeeId}`);
      expect(detailRes.ok()).toBeTruthy();

      const detail = await detailRes.json();
      expect(detail.id).toBe(createdEmployeeId);
      expect(detail.status).toBe('active');
    }
  });

  test('employee can log in and access their own profile', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const res = await client.get('/api/v1/auth/me');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.email).toBe(EMPLOYEE_EMAIL);
    expect(body.role).toBe('EMPLOYEE');
  });

  test('employee cannot access admin employee list', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const res = await client.get('/api/v1/admin/employees');
    expect(res.status()).toBe(403);
  });
});

// ─── Step 3: Assign Salary Structure ──────────────────────────────────────

test.describe('Step 3: Salary assignment', () => {
  let employeeId: string;

  test.beforeAll(async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const listRes = await client.get('/api/v1/admin/employees');
    const { data } = await listRes.json();
    const emp = data.find((e: { email: string }) => e.email === EMPLOYEE_EMAIL);
    employeeId = emp?.id;
  });

  test('HR admin can view salary structure for employee', async ({ request }) => {
    if (!employeeId) test.skip();

    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const res = await client.get(`/api/v1/admin/employees/${employeeId}/salary`);
    // 200 if already assigned, 404 if not yet — both acceptable at this stage
    expect([200, 404]).toContain(res.status());
  });

  test('employee cannot view their own salary breakdown via admin endpoint', async ({ request }) => {
    if (!employeeId) test.skip();

    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const res = await client.get(`/api/v1/admin/employees/${employeeId}/salary`);
    expect(res.status()).toBe(403);
  });
});

// ─── Step 4: Run Payroll ───────────────────────────────────────────────────

test.describe('Step 4: Payroll run', () => {
  // Use a unique period to avoid conflicts with other test runs
  const TEST_PERIOD = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  let payrollRunId: string;

  test('HR admin initiates a payroll run', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const res = await client.post('/api/v1/payroll/runs', {
      period: TEST_PERIOD,
      departmentId: null,
    });

    // 201 = created, 409 = already exists from a prior run (still a valid scenario for smoke)
    expect([201, 409]).toContain(res.status());

    if (res.status() === 201) {
      const body = await res.json();
      payrollRunId = body.id;
    }
  });

  test('payroll run appears in the list', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const res = await client.get('/api/v1/payroll/runs');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('HR admin can compute the payroll run', async ({ request }) => {
    if (!payrollRunId) test.skip();

    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const res = await client.post(`/api/v1/payroll/runs/${payrollRunId}/compute`);
    expect([200, 202]).toContain(res.status());
  });

  test('payroll entries are created after computation', async ({ request }) => {
    if (!payrollRunId) test.skip();

    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const res = await client.get(`/api/v1/payroll/runs/${payrollRunId}/entries`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('EMPLOYEE cannot list all payroll runs', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const res = await client.get('/api/v1/payroll/runs');
    expect(res.status()).toBe(403);
  });
});

// ─── Step 5: Download Payslip ─────────────────────────────────────────────

test.describe('Step 5: Payslip download', () => {
  test('employee can list their own payslips', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const res = await client.get('/api/v1/me/payslips');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('payslip download returns a URL (signed or redirect)', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const listRes = await client.get('/api/v1/me/payslips');
    const { data } = await listRes.json();

    if (data.length === 0) {
      test.skip(); // no payslips yet — skip gracefully
    }

    const payslipId = data[0].id;
    const downloadRes = await client.get(`/api/v1/payroll/payslips/${payslipId}/download`);

    expect(downloadRes.ok()).toBeTruthy();

    const body = await downloadRes.json();
    // Must return a URL — either a redirect URL or a presigned URL
    expect(body.url).toBeDefined();
    // URL must be a string — cannot be the raw S3 key
    expect(typeof body.url).toBe('string');
  });

  test('payslip download URL does not expose the raw S3 key path directly', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const listRes = await client.get('/api/v1/me/payslips');
    const { data } = await listRes.json();

    if (data.length === 0) test.skip();

    // The payslip entity's s3Key should NOT appear in any public API response field
    const payslip = data[0];
    const responseKeys = Object.keys(payslip);
    expect(responseKeys).not.toContain('s3Key');
    expect(responseKeys).not.toContain('s3_key');
  });
});

// ─── Step 6: Reports Smoke ────────────────────────────────────────────────

test.describe('Step 6: Reports smoke', () => {
  const REPORT_KEYS = [
    'headcount',
    'attrition',
    'payroll_summary',
    'leave_utilization',
    'attendance_summary',
    'new_hires',
    'exits',
  ] as const;

  for (const reportKey of REPORT_KEYS) {
    test(`HR admin can preview ${reportKey} report`, async ({ request }) => {
      const client = new HrApiClient(request);
      await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

      const res = await client.get(
        `/api/v1/reports/preview?reportKey=${reportKey}&startDate=2025-01-01&endDate=2025-06-30`,
      );

      expect(res.ok()).toBeTruthy();

      const body = await res.json();
      expect(body.reportKey).toBe(reportKey);
      expect(Array.isArray(body.rows)).toBeTruthy();
      expect(typeof body.totalRows).toBe('number');
      expect(body.generatedAt).toBeDefined();
    });
  }

  test('EMPLOYEE cannot access report preview', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const res = await client.get(
      '/api/v1/reports/preview?reportKey=headcount&startDate=2025-01-01&endDate=2025-06-30',
    );

    expect(res.status()).toBe(403);
  });

  test('HR admin can save a report definition', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const res = await client.post('/api/v1/reports/saved', {
      name: 'Monthly Headcount E2E',
      reportKey: 'headcount',
      parameters: {
        reportKey: 'headcount',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      },
    });

    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Monthly Headcount E2E');

    // Cleanup: delete the saved report
    if (body.id) {
      await client.delete(`/api/v1/reports/saved/${body.id}`);
    }
  });

  test('on-demand export returns 202 Accepted with a jobId', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    // First save a report
    const saveRes = await client.post('/api/v1/reports/saved', {
      name: 'E2E Export Test',
      reportKey: 'headcount',
      parameters: {
        reportKey: 'headcount',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
      },
    });
    const savedId = (await saveRes.json()).id;

    // Trigger export
    const exportRes = await client.post(`/api/v1/reports/saved/${savedId}/export`, {
      format: 'xlsx',
    });

    expect(exportRes.status()).toBe(202);
    const body = await exportRes.json();
    expect(body.jobId).toBeDefined();
    expect(body.message).toBeDefined();

    // Cleanup
    await client.delete(`/api/v1/reports/saved/${savedId}`);
  });
});

// ─── Step 7: MSS Smoke ────────────────────────────────────────────────────

test.describe('Step 7: Manager Self-Service smoke', () => {
  test('manager can fetch team leave requests', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(MANAGER_EMAIL, MANAGER_PASSWORD);

    const res = await client.get('/api/v1/leave/requests/team?page=1&limit=10');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(typeof body.total).toBe('number');
  });

  test('employee cannot access team leave endpoint', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

    const res = await client.get('/api/v1/leave/requests/team');
    expect(res.status()).toBe(403);
  });

  test('manager GET /auth/me reflects unreadNotificationCount', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(MANAGER_EMAIL, MANAGER_PASSWORD);

    const res = await client.get('/api/v1/auth/me');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(typeof body.unreadNotificationCount).toBe('number');
    expect(body.unreadNotificationCount).toBeGreaterThanOrEqual(0);
  });
});

// ─── Step 8: Security Regression Smoke ───────────────────────────────────

test.describe('Step 8: Security smoke', () => {
  test('SQL injection in search parameter is handled safely', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const injection = "'; DROP TABLE users; --";
    const res = await client.get(
      `/api/v1/admin/employees?search=${encodeURIComponent(injection)}`,
    );

    // Must return 200 (empty results) or 400 (validation) — NOT 500
    expect([200, 400]).toContain(res.status());
  });

  test('XSS payload in report name is stored escaped or rejected', async ({ request }) => {
    const client = new HrApiClient(request);
    await client.login(HR_ADMIN_EMAIL, HR_ADMIN_PASSWORD);

    const xssPayload = '<script>alert("xss")</script>';
    const res = await client.post('/api/v1/reports/saved', {
      name: xssPayload,
      reportKey: 'headcount',
      parameters: {
        reportKey: 'headcount',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
      },
    });

    if ([200, 201].includes(res.status())) {
      const body = await res.json();
      // If stored, name must not be an executable script tag
      expect(body.name).not.toContain('<script>');

      // Cleanup
      if (body.id) await client.delete(`/api/v1/reports/saved/${body.id}`);
    } else {
      // Rejected at validation — also acceptable
      expect([400, 422]).toContain(res.status());
    }
  });

  test('oversized request body returns 413', async ({ request }) => {
    const bigData = 'x'.repeat(11 * 1024 * 1024); // 11 MB
    const res = await request.post('/api/v1/reports/saved', {
      data: { name: bigData },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status()).toBe(413);
  });

  test('expired/invalid JWT returns 401 on protected endpoint', async ({ request }) => {
    const res = await request.get('/api/v1/auth/me', {
      headers: { Authorization: 'Bearer this.is.an.invalid.jwt' },
    });

    expect(res.status()).toBe(401);
  });
});
