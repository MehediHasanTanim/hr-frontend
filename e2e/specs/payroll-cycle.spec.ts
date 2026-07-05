// e2e/specs/payroll-cycle.spec.ts
// Sprint 6 1.6.F7 — E2E: Full payroll run + payslip

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { PayrollPage } from "../pages/payroll.page";

const HR_ADMIN_EMAIL = process.env.E2E_HR_ADMIN_EMAIL!;
const PASSWORD = process.env.E2E_PASSWORD ?? "SmokeTest@1234";
const TEST_PERIOD = `${new Date().getFullYear()}-${String(new Date().getMonth() + 2).padStart(2, "0")}`;

test.describe("Payroll Cycle", () => {
  let runId: string;

  test("HR admin can create a payroll run", async ({ page }) => {
    const login = new LoginPage(page);
    const payroll = new PayrollPage(page);

    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await payroll.gotoRuns();
    await page.click('[data-testid="new-run-btn"]');
    await page.fill('[data-testid="period-input"]', TEST_PERIOD);
    await page.click('[data-testid="create-run-btn"]');

    await expect(page.locator('[data-testid="toast-success"]')).toContainText(
      "Payroll run created",
    );

    await page.waitForURL("**/payroll/runs/**");
    runId = page.url().split("/").pop()!;
    expect(runId).toBeTruthy();
  });

  test("HR admin can compute the payroll run", async ({ page }) => {
    test.skip(!runId, "Depends on prior test creating a run");

    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto(`/payroll/runs/${runId}`);
    await page.click('[data-testid="compute-btn"]');

    await expect(page.locator('[data-testid="entries-table"]')).toBeVisible({
      timeout: 15_000,
    });
    const entryCount = await page.locator('[data-testid="payroll-entry-row"]').count();
    expect(entryCount).toBeGreaterThan(0);
  });

  test("payroll entries show net pay amounts", async ({ page }) => {
    test.skip(!runId, "Depends on prior test computing entries");

    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto(`/payroll/runs/${runId}`);
    const firstNetPay = await page
      .locator('[data-testid="payroll-entry-row"]')
      .first()
      .locator('[data-testid="net-pay"]')
      .textContent();

    expect(firstNetPay).toMatch(/৳[\d,]+\.\d{2}/);
  });

  test("HR admin can trigger payslip generation", async ({ page }) => {
    test.skip(!runId, "Depends on prior test computing entries");

    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(HR_ADMIN_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();

    await page.goto(`/payroll/runs/${runId}`);
    await page.click('[data-testid="generate-payslips-btn"]');

    await expect(page.locator('[data-testid="payslips-queued-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="payslips-queued-toast"]')).toContainText("queued");
  });
});
