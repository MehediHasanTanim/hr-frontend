// e2e/pages/login.page.ts
// Sprint 6 1.6.F7 — Login page object

import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async fillEmail(email: string) {
    await this.page.fill('[name="email"]', email);
  }

  async fillPassword(pw: string) {
    await this.page.fill('[name="password"]', pw);
  }

  async submit() {
    await this.page.click('[type="submit"]');
  }

  async waitForRedirect(path: string) {
    await this.page.waitForURL(`**${path}`);
  }

  async getErrorMessage() {
    return this.page.textContent('[data-testid="login-error"]');
  }
}
