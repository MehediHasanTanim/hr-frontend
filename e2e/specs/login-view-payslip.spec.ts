// e2e/specs/login-view-payslip.spec.ts
// Sprint 6 1.6.F7 — E2E: Login + payslip download (PII checks)

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { EssPage } from "../pages/ess.page";

const EMPLOYEE_EMAIL = process.env.E2E_EMPLOYEE_EMAIL!;
const PASSWORD = process.env.E2E_PASSWORD ?? "SmokeTest@1234";

test.describe("Login and View Payslip", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1, [data-testid='login-title']").first()).toBeVisible();
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('[type="submit"]')).toBeVisible();
  });

  test("invalid credentials show error message", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail("wrong@email.com");
    await login.fillPassword("WrongPassword123");
    await login.submit();

    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
    const errorText = await page.textContent('[data-testid="login-error"]');
    expect(errorText).not.toContain("stack");
    expect(errorText).not.toContain("Error:");
  });

  test("valid login redirects to ESS home", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();
    await login.waitForRedirect("/ess");

    await expect(page).toHaveURL(/\/ess/);
  });

  test("ESS home shows leave balances after login", async ({ page }) => {
    const login = new LoginPage(page);
    const ess = new EssPage(page);

    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();
    await login.waitForRedirect("/ess");

    await expect(page.locator('[data-testid="leave-balance-widget"]')).toBeVisible();
  });

  test("payslip widget renders without raw S3 key in DOM", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();
    await login.waitForRedirect("/ess");

    await page.waitForSelector('[data-testid="payslip-widget"]');
    const domContent = await page.content();

    expect(domContent).not.toContain("X-Amz-Signature");
    expect(domContent).not.toMatch(/payslips\/[a-z0-9-]+\/[0-9-]+\.pdf/);
  });

  test("payslip download button opens url in new tab (not raw key)", async ({
    page,
    context,
  }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();
    await login.waitForRedirect("/ess");

    await page.waitForSelector('[data-testid="payslip-widget"]');

    const downloadBtns = await page.locator('[data-testid="payslip-download-btn"]').count();
    if (downloadBtns === 0) {
      test.skip();
    }

    const [newTab] = await Promise.all([
      context.waitForEvent("page"),
      page.locator('[data-testid="payslip-download-btn"]').first().click(),
    ]);

    const newTabUrl = newTab.url();
    expect(newTabUrl).not.toMatch(/^\/payslips\//);
    expect(newTabUrl).not.toBe("about:blank");
  });

  test("logout clears session and redirects to login", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.fillEmail(EMPLOYEE_EMAIL);
    await login.fillPassword(PASSWORD);
    await login.submit();
    await login.waitForRedirect("/ess");

    await page.click('[data-testid="user-menu-trigger"]');
    await page.click('[data-testid="logout-btn"]');

    await expect(page).toHaveURL(/\/login/);

    await page.goto("/ess");
    await expect(page).toHaveURL(/\/login/);
  });
});
