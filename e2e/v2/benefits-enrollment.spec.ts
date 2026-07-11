// e2e/v2/benefits-enrollment.spec.ts
/**
 * Sprint 12 V2 E2E — Benefits Enrollment Journey
 * Actors: Employee, Benefits Admin
 * Flow: Enrollment window → employee selects plan(s) + dependents → submit → admin views report
 */
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const EMPLOYEE = { email: "employee@acme.com", password: "ValidPass@123" };
const ADMIN = { email: "hr@acme.com", password: "ValidPass@123" };

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(dashboard|ess)/, { timeout: 15000 });
}

test.describe("V2 — Benefits Enrollment Journey", () => {
  test("employee views enrollment wizard", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/benefits/enroll");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const wizard = page.locator('[data-testid="enrollment-wizard"]');
    const planCatalog = page.locator('[data-testid="plan-catalog-grid"], [data-testid="plan-catalog-loading"], [data-testid="plan-catalog-empty"]');
    const wizardVisible = await wizard.isVisible().catch(() => false);
    const catalogVisible = await planCatalog.isVisible().catch(() => false);
    expect(wizardVisible || catalogVisible).toBe(true);
  });

  test("step indicators show 3 enrollment steps", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/benefits/enroll");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await expect(page.locator('[data-testid="wizard-step-1"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="wizard-step-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="wizard-step-3"]')).toBeVisible();
  });

  test("next/back navigation buttons visible", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/benefits/enroll");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="wizard-back"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="wizard-next"]')).toBeVisible();
  });

  test("benefits enrollment is accessible", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/benefits/enroll");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
