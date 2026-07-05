// e2e/pages/payroll.page.ts
// Sprint 6 1.6.F7 — Payroll page object

import type { Page } from "@playwright/test";

export class PayrollPage {
  constructor(private page: Page) {}

  async gotoRuns() {
    await this.page.goto("/payroll/runs");
  }

  async createRun(period: string) {
    await this.page.click('[data-testid="new-run-btn"]');
    await this.page.fill('[data-testid="period-input"]', period);
    await this.page.click('[data-testid="create-run-btn"]');
  }

  async computeRun(runId: string) {
    await this.page.goto(`/payroll/runs/${runId}`);
    await this.page.click('[data-testid="compute-btn"]');
    await this.page.waitForSelector('[data-testid="entries-table"]');
  }

  async generatePayslips(runId: string) {
    await this.page.click('[data-testid="generate-payslips-btn"]');
    await this.page.waitForSelector('[data-testid="payslips-queued-toast"]');
  }
}
