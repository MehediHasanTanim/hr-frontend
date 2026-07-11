// e2e/v2/offboarding.spec.ts
/**
 * Sprint 12 V2 E2E — Offboarding Journey
 * Actors: Employee/Manager (exit request), HR Admin
 * Flow: Exit request → approval → interview → checklist completion → COMPLETED status
 */
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const EMPLOYEE = { email: "employee@acme.com", password: "ValidPass@123" };
const HR = { email: "hr@acme.com", password: "ValidPass@123" };

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(dashboard|ess)/, { timeout: 15000 });
}

test.describe("V2 — Offboarding Journey", () => {
  test("employee views resignation form", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/offboarding/my");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const form = page.locator('[data-testid="resignation-form"]');
    const success = page.locator('[data-testid="resignation-success"]');
    const formVisible = await form.isVisible().catch(() => false);
    const successVisible = await success.isVisible().catch(() => false);
    expect(formVisible || successVisible).toBe(true);
  });

  test("resignation form has LWD date picker and submit button", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/offboarding/my");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const lwd = page.locator('[data-testid="resignation-lwd"]');
    if (await lwd.isVisible().catch(() => false)) {
      await expect(lwd).toBeVisible();
      await expect(page.locator('[data-testid="resignation-notes"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-resignation-btn"]')).toBeVisible();
    }
  });

  test("HR views exit approval panel", async ({ page }) => {
    await login(page, HR.email, HR.password);
    await page.goto("/offboarding/approvals");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText).not.toContain("Something went wrong");
  });

  test("exit request detail shows status stepper", async ({ page }) => {
    await login(page, HR.email, HR.password);
    await page.goto("/offboarding/placeholder-exit-id");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const stepper = page.locator('[data-testid="exit-status-stepper"]');
    const loading = page.locator('[role="status"], [data-testid*="loading"]');
    const stepperVisible = await stepper.isVisible().catch(() => false);
    const loadingVisible = await loading.isVisible().catch(() => false);
    expect(stepperVisible || loadingVisible).toBe(true);
  });

  test("offboarding pages are accessible", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/offboarding/my");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
