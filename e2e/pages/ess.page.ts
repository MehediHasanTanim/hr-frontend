// e2e/pages/ess.page.ts
// Sprint 6 1.6.F7 — ESS page object

import type { Page } from "@playwright/test";

export class EssPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/ess");
  }

  async getLeaveBalanceFor(leaveType: string) {
    return this.page.textContent(`[data-testid="leave-balance-${leaveType}"]`);
  }

  async clickApplyLeave() {
    await this.page.click('[data-testid="apply-leave-btn"]');
  }

  async getPayslipRows() {
    return this.page.locator('[data-testid="payslip-row"]').count();
  }

  async clickDownloadPayslip(index: number) {
    await this.page.locator('[data-testid="payslip-download-btn"]').nth(index).click();
  }

  async getPendingAcknowledgementsCount() {
    return this.page.textContent('[data-testid="pending-ack-count"]');
  }
}
