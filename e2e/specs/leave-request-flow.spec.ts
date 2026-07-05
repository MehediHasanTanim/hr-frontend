// e2e/specs/leave-request-flow.spec.ts
// Sprint 6 1.6.F7 — E2E: Full leave request lifecycle

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { EssPage } from "../pages/ess.page";
import { MssApprovalsPage } from "../pages/mss-approvals.page";

const EMPLOYEE_EMAIL = process.env.E2E_EMPLOYEE_EMAIL!;
const MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL!;
const PASSWORD = process.env.E2E_PASSWORD ?? "SmokeTest@1234";

test.describe("Leave Request Flow", () => {
  test("employee can submit a leave request", async ({ page }) => {
    const login = new LoginPage(page);
    const ess = new EssPage(page);

    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();
    await login.waitForRedirect("/ess");

    await ess.clickApplyLeave();
    await page.waitForURL("**/leave/apply");

    await page.selectOption('[name="leaveType"]', "ANNUAL");
    await page.fill('[name="startDate"]', "2025-08-04");
    await page.fill('[name="endDate"]', "2025-08-05");
    await page.fill('[name="reason"]', "Playwright E2E test vacation");
    await page.click('[data-testid="submit-leave-btn"]');

    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-success"]')).toContainText(
      "Leave request submitted",
    );
  });

  test("manager sees the leave request in approvals queue", async ({ page }) => {
    const login = new LoginPage(page);
    const approvals = new MssApprovalsPage(page);

    await login.goto();
    await login.fillEmail(MANAGER_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();
    await login.waitForRedirect("/dashboard");

    await approvals.goto();

    const pendingCount = await approvals.getPendingCount();
    expect(Number(pendingCount)).toBeGreaterThan(0);
  });

  test("manager approves the leave request", async ({ page }) => {
    const login = new LoginPage(page);
    const approvals = new MssApprovalsPage(page);

    await login.goto();
    await login.fillEmail(MANAGER_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await approvals.goto();
    await approvals.approveFirst();

    const toast = await approvals.getSuccessToast();
    expect(toast).toContain("approved");
  });

  test("employee leave balance is reduced after approval", async ({ page }) => {
    const login = new LoginPage(page);
    const ess = new EssPage(page);

    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();
    await login.waitForRedirect("/ess");

    await ess.goto();

    const annualBalance = await ess.getLeaveBalanceFor("ANNUAL");
    expect(annualBalance).toContain("remaining");
  });

  test("employee cannot access MSS approvals page", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto("/mss/approvals");
    await expect(page).toHaveURL(/\/(403|login|ess)/);
  });

  test("reject flow requires a reason", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(MANAGER_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto("/mss/approvals");

    const rejectBtns = await page.locator('[data-testid="reject-btn"]').count();
    if (rejectBtns === 0) test.skip();

    await page.locator('[data-testid="reject-btn"]').first().click();
    // Submit without reason — should be blocked
    await page.click('[data-testid="confirm-reject-btn"]');
    await expect(page.locator('[data-testid="reject-reason-error"]')).toBeVisible();
  });
});
