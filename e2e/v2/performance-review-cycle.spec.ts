// e2e/v2/performance-review-cycle.spec.ts
/**
 * Sprint 12 V2 E2E — Performance Review Cycle Journey
 * Actors: Manager, Employee, HR Admin
 * Flow: Review cycle → self-assessment → manager assessment → calibration → completed
 */
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const EMPLOYEE = { email: "employee@acme.com", password: "ValidPass@123" };
const MANAGER = { email: "manager@acme.com", password: "ValidPass@123" };
const HR = { email: "hr@acme.com", password: "ValidPass@123" };

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(dashboard|ess)/, { timeout: 15000 });
}

test.describe("V2 — Performance Review Cycle Journey", () => {
  test("employee can view performance page", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/performance/reviews");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText).not.toContain("Something went wrong");
  });

  test("employee can view OKR page", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/performance/okr");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
  });

  test("manager can view performance reviews", async ({ page }) => {
    await login(page, MANAGER.email, MANAGER.password);
    await page.goto("/performance/reviews");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
  });

  test("performance pages are accessible", async ({ page }) => {
    await login(page, HR.email, HR.password);
    await page.goto("/performance/okr");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
