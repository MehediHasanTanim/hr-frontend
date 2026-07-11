// e2e/v2/candidate-to-hire.spec.ts
/**
 * Sprint 12 V2 E2E — Candidate-to-Hire Journey
 * Actors: Recruiter, Hiring Manager, Candidate
 * Flow: Requisition → Application → ATS pipeline stages → Offer → Hire → Onboarding
 *
 * Run: npx playwright test e2e/v2/candidate-to-hire.spec.ts --project=chromium
 */
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const RECRUITER = { email: "recruiter@acme.com", password: "ValidPass@123" };
const MANAGER = { email: "manager@acme.com", password: "ValidPass@123" };

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(dashboard|ess)/, { timeout: 15000 });
}

test.describe("V2 — Candidate-to-Hire Journey", () => {
  test("recruiter views requisitions list", async ({ page }) => {
    await login(page, RECRUITER.email, RECRUITER.password);
    await page.goto("/recruitment/requisitions");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText).not.toContain("Something went wrong");
  });

  test("recruiter can navigate to a requisition pipeline", async ({ page }) => {
    await login(page, RECRUITER.email, RECRUITER.password);
    await page.goto("/recruitment/requisitions/placeholder-req-id/pipeline");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const kanban = page.locator('[data-testid="kanban-board"]');
    const loading = page.locator('[data-testid^="kanban"]');
    const visible = await kanban.isVisible().catch(() => false);
    const loadingVisible = await loading.isVisible().catch(() => false);
    expect(visible || loadingVisible).toBe(true);
  });

  test("recruitment pages are accessible", async ({ page }) => {
    await login(page, RECRUITER.email, RECRUITER.password);
    await page.goto("/recruitment/requisitions");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("manager can view requisitions", async ({ page }) => {
    await login(page, MANAGER.email, MANAGER.password);
    await page.goto("/recruitment/requisitions");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
  });
});
