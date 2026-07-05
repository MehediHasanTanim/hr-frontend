// e2e/pages/mss-approvals.page.ts
// Sprint 6 1.6.F7 — MSS Approvals page object

import type { Page } from "@playwright/test";

export class MssApprovalsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/mss/approvals");
  }

  async getPendingCount() {
    return this.page.textContent('[data-testid="pending-total-badge"]');
  }

  async approveFirst() {
    await this.page.locator('[data-testid="approve-btn"]').first().click();
    await this.page.click('[data-testid="confirm-approve-btn"]');
  }

  async rejectFirstWithReason(reason: string) {
    await this.page.locator('[data-testid="reject-btn"]').first().click();
    await this.page.fill('[data-testid="reject-reason-input"]', reason);
    await this.page.click('[data-testid="confirm-reject-btn"]');
  }

  async selectAll() {
    await this.page.click('[data-testid="select-all-checkbox"]');
  }

  async bulkApprove() {
    await this.page.click('[data-testid="bulk-approve-btn"]');
  }

  async getSuccessToast() {
    return this.page.textContent('[data-testid="toast-success"]');
  }
}
