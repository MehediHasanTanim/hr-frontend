// e2e/specs/audit-log-access.spec.ts
// Sprint 6 1.6.F7 — E2E: Audit log role-based access control

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { AuditLogPage } from "../pages/audit-log.page";

const HR_ADMIN_EMAIL = process.env.E2E_HR_ADMIN_EMAIL!;
const EMPLOYEE_EMAIL = process.env.E2E_EMPLOYEE_EMAIL!;
const MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL!;
const PASSWORD = process.env.E2E_PASSWORD ?? "SmokeTest@1234";

test.describe("Audit Log Access", () => {
  test("HR admin can access audit log page", async ({ page }) => {
    const login = new LoginPage(page);
    const auditLog = new AuditLogPage(page);

    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await auditLog.goto();
    await expect(page).toHaveURL(/\/admin\/audit-logs/);
    await expect(page.locator('[data-testid="audit-log-table"]')).toBeVisible();
  });

  test("audit log table renders action, actor, and timestamp columns", async ({ page }) => {
    const login = new LoginPage(page);
    const auditLog = new AuditLogPage(page);

    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await auditLog.goto();

    await expect(page.locator('th:has-text("Action")')).toBeVisible();
    await expect(page.locator('th:has-text("Actor")')).toBeVisible();
    await expect(page.locator('th:has-text("Timestamp")')).toBeVisible();
  });

  test("audit log entries are present", async ({ page }) => {
    const login = new LoginPage(page);
    const auditLog = new AuditLogPage(page);

    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await auditLog.goto();
    await page.waitForSelector('[data-testid="audit-log-row"]');

    const rowCount = await page.locator('[data-testid="audit-log-row"]').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("audit log entries do not display PII field values", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto("/admin/audit-logs");
    await page.waitForSelector('[data-testid="audit-log-row"]');

    const pageContent = await page.content();
    const PII_PATTERNS = ["passwordHash", "base64Signature", "otpCode", "rawToken"];
    PII_PATTERNS.forEach((pattern) => {
      expect(pageContent).not.toContain(pattern);
    });
  });

  test("EMPLOYEE is redirected from audit log page", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto("/admin/audit-logs");
    await expect(page).toHaveURL(/\/(403|login|ess)/);
  });

  test("MANAGER is redirected from audit log page", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(MANAGER_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto("/admin/audit-logs");
    await expect(page).toHaveURL(/\/(403|login|dashboard)/);
  });

  test("audit log filter by action type works", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto("/admin/audit-logs");
    await page.waitForSelector('[data-testid="audit-log-row"]');

    await page.selectOption('[data-testid="action-filter"]', "LOGIN_SUCCESS");
    await page.waitForResponse((resp) => resp.url().includes("/audit-logs"));

    const actions = await page.locator('[data-testid="action-cell"]').allTextContents();
    actions.forEach((action) => {
      expect(action).toContain("LOGIN");
    });
  });
});
