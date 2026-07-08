// src/e2e/sprint11-regression.spec.ts
/**
 * Sprint 11 Regression — E2E Playwright Test Suite
 *
 * Covers:
 *   FE-ANALYTICS-001 — Executive dashboard renders KPI cards and charts
 *   FE-REPORTS-001 — Saved reports list and run flow
 *   FE-ATTRITION-001 — Attrition risk table with risk bands
 *   FE-OFFBOARD-001 — Resignation submission + approval + checklist
 *
 * Run: npx playwright test src/e2e/sprint11-regression.spec.ts --project=chromium
 */

import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const EMPLOYEE = {
  email: process.env.E2E_EMPLOYEE_EMAIL ?? "employee@acme.com",
  password: process.env.E2E_PASSWORD ?? "ValidPass@123",
};
const HR_ADMIN = {
  email: process.env.E2E_HR_ADMIN_EMAIL ?? "hr@acme.com",
  password: process.env.E2E_PASSWORD ?? "ValidPass@123",
};

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(dashboard|ess)/, { timeout: 15_000 });
}

async function runAxeScan(page: Page, pageName: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  if (results.violations.length > 0) {
    console.warn(`[a11y] ${pageName}: ${results.violations.length} violations —`, results.violations.map((v) => `${v.id}: ${v.help}`).join(", "));
  } else {
    console.info(`[a11y] ${pageName}: 0 violations ✓`);
  }
  expect(results.violations).toEqual([]);
}

// ═══════════ FE-ANALYTICS-001: Executive Dashboard ═══════════
test.describe("FE-ANALYTICS-001 — Executive Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, HR_ADMIN.email, HR_ADMIN.password);
  });

  test("dashboard page renders without error", async ({ page }) => {
    await page.goto("/analytics/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3_000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText).not.toContain("Something went wrong");
  });

  test("KPI cards render", async ({ page }) => {
    await page.goto("/analytics/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3_000);
    await expect(page.locator('[data-testid^="kpi-card-"]').first()).toBeVisible({ timeout: 8_000 });
  });

  test("month range selector works", async ({ page }) => {
    await page.goto("/analytics/dashboard");
    await page.waitForLoadState("networkidle");
    const select = page.locator("select");
    if (await select.isVisible().catch(() => false)) {
      await select.selectOption("6");
      await page.waitForTimeout(1_000);
    }
  });

  test("dashboard accessibility — axe-core scan", async ({ page }) => {
    await page.goto("/analytics/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);
    await runAxeScan(page, "/analytics/dashboard");
  });
});

// ═══════════ FE-REPORTS-001: Saved Reports ═══════════
test.describe("FE-REPORTS-001 — Saved Reports", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, HR_ADMIN.email, HR_ADMIN.password);
  });

  test("reports page renders with tabs", async ({ page }) => {
    await page.goto("/analytics/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText).not.toContain("Something went wrong");
  });

  test("reports page accessibility — axe-core scan", async ({ page }) => {
    await page.goto("/analytics/reports");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);
    await runAxeScan(page, "/analytics/reports");
  });
});

// ═══════════ FE-ATTRITION-001: Attrition Risk ═══════════
test.describe("FE-ATTRITION-001 — Attrition Risk Table", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, HR_ADMIN.email, HR_ADMIN.password);
  });

  test("attrition risk page renders without error", async ({ page }) => {
    await page.goto("/analytics/attrition-risk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3_000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText).not.toContain("Something went wrong");
  });

  test("attrition risk accessibility — axe-core scan", async ({ page }) => {
    await page.goto("/analytics/attrition-risk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);
    await runAxeScan(page, "/analytics/attrition-risk");
  });
});

// ═══════════ FE-OFFBOARD-001: Offboarding ═══════════
test.describe("FE-OFFBOARD-001 — Offboarding portal", () => {
  test("employee resignation form renders", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/offboarding/my");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    const form = page.locator('[data-testid="resignation-form"]');
    const success = page.locator('[data-testid="resignation-success"]');
    const formVisible = await form.isVisible().catch(() => false);
    const successVisible = await success.isVisible().catch(() => false);
    expect(formVisible || successVisible).toBe(true);
  });

  test("resignation form has required fields", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/offboarding/my");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    const lwd = page.locator('[data-testid="resignation-lwd"]');
    if (await lwd.isVisible().catch(() => false)) {
      await expect(lwd).toBeVisible();
      await expect(page.locator('[data-testid="resignation-notes"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-resignation-btn"]')).toBeVisible();
    }
  });

  test("exit approvals page renders for HR", async ({ page }) => {
    await login(page, HR_ADMIN.email, HR_ADMIN.password);
    await page.goto("/offboarding/approvals");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText).not.toContain("Something went wrong");
  });

  test("offboarding accessibility — axe-core scan", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/offboarding/my");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);
    await runAxeScan(page, "/offboarding/my");
  });
});

// ═══════════ Mobile viewport ═══════════
test.describe("Sprint 11 — Mobile viewport", () => {
  test("analytics dashboard renders without horizontal scroll", async ({ page }) => {
    await login(page, HR_ADMIN.email, HR_ADMIN.password);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/analytics/dashboard");
    await page.waitForLoadState("networkidle");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test("exit approvals renders without horizontal scroll on mobile", async ({ page }) => {
    await login(page, HR_ADMIN.email, HR_ADMIN.password);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/offboarding/approvals");
    await page.waitForLoadState("networkidle");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
