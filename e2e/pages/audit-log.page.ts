// e2e/pages/audit-log.page.ts
// Sprint 6 1.6.F7 — Audit log page object

import type { Page } from "@playwright/test";

export class AuditLogPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/admin/audit-logs");
  }

  async getFirstEntryAction() {
    return this.page.textContent(
      '[data-testid="audit-log-row"]:first-child [data-testid="action"]',
    );
  }

  async isAccessDenied() {
    return this.page.locator('[data-testid="403-message"]').isVisible();
  }
}
