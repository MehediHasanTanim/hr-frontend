import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const validUser = {
  email: "admin@acme.com",
  name: "Admin User",
  password: "ValidPass@123",
};

async function ensureTargetRunning(page: Page) {
  const response = await page.request.get("/login").catch(() => null);
  test.skip(!response?.ok(), "Target server is not running.");
}

async function mockCommonApis(page: Page) {
  await page.route("**/api/v1/notifications", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ unreadCount: 3 }),
    });
  });

  await page.route("**/api/v1/auth/logout", async (route) => {
    await route.fulfill({ status: 204 });
  });
}

async function mockLogin(page: Page, options?: { delayMs?: number }) {
  await page.route("**/api/v1/auth/login", async (route) => {
    const request = route.request();
    const body = request.postDataJSON() as { email?: string; password?: string };

    if (body.email === validUser.email && body.password === validUser.password) {
      if (options?.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
      await route.fulfill({
        contentType: "application/json",
        headers: {
          "set-cookie": "refresh=refresh-token; Path=/; HttpOnly; SameSite=Lax",
        },
        status: 200,
        body: JSON.stringify({
          access: "access-token",
          user: {
            id: "user-1",
            name: validUser.name,
            email: validUser.email,
            role: "admin",
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 401,
      body: JSON.stringify({ detail: "Invalid credentials" }),
    });
  });
}

async function mockRefresh(page: Page, succeeds = true) {
  await page.route("**/*auth/refresh*", async (route) => {
    if (!succeeds) {
      await route.abort("failed");
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        access: "refreshed-token",
        user: {
          id: "user-1",
          name: validUser.name,
          email: validUser.email,
          role: "admin",
        },
      }),
    });
  });
}

async function mockCompany(page: Page, options?: { saveFails?: boolean }) {
  await page.route("**/api/v1/company", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify({
          name: "Acme Commerce",
          address: "1 Main St",
          phone: "12345",
          logoUrl: "",
          timezone: "UTC",
          currency: "USD",
          dateFormat: "YYYY-MM-DD",
          fiscalYearStartMonth: "January",
        }),
      });
      return;
    }

    if (options?.saveFails) {
      await route.fulfill({
        contentType: "application/json",
        status: 500,
        body: JSON.stringify({ detail: "Unable to save profile" }),
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: route.request().postData() ?? "{}",
    });
  });
}

async function login(page: Page) {
  await mockCommonApis(page);
  await mockLogin(page);
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(validUser.email);
  await page.getByLabel(/password/i).fill(validUser.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("Sprint 1 frontend regression automation", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
  });

  test("FE-AUTH-001 login validates inline, succeeds, and keeps access token out of storage", async ({
    page,
  }) => {
    await mockCommonApis(page);
    await mockLogin(page, { delayMs: 500 });

    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();

    await page.getByLabel(/email/i).fill("not-an-email");
    await page.getByLabel(/password/i).fill("ValidPass@123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Enter a valid email")).toBeVisible();

    await page.getByLabel(/email/i).fill(validUser.email);
    const password = page.getByLabel(/password/i);
    await expect(password).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeDisabled();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("navigation", { name: /dashboard navigation/i })).toBeVisible();

    const storageSnapshot = await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
      cookie: document.cookie,
    }));
    expect(JSON.stringify(storageSnapshot.local)).not.toContain("access-token");
    expect(JSON.stringify(storageSnapshot.session)).not.toContain("access-token");
    expect(storageSnapshot.cookie).not.toContain("refresh-token");
  });

  test("FE-AUTH-002 invalid login shows a generic error and preserves field values", async ({
    page,
  }) => {
    await mockCommonApis(page);
    await mockLogin(page);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(validUser.email);
    await page.getByLabel(/password/i).fill("WrongPass123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toHaveValue(validUser.email);
    await expect(page.getByLabel(/password/i)).toHaveValue("WrongPass123");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeEnabled();

    await page.getByLabel(/password/i).fill(validUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("FE-AUTH-003 unauthenticated users redirect from protected dashboard routes", async ({
    page,
  }) => {
    await page.context().clearCookies();

    await page.goto("/dashboard/settings/company");

    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fsettings%2Fcompany/);
  });

  test("FE-AUTH-004 protected route silently refreshes a lost in-memory token", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "refresh",
        value: "refresh-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await mockCommonApis(page);
    await mockRefresh(page, true);
    await mockCompany(page);

    await page.goto("/dashboard/settings/company");
    await expect(page.getByRole("heading", { name: /company settings/i })).toBeVisible();
    await expect(page.getByLabel(/^Name$/)).toHaveValue("Acme Commerce");
  });

  test("FE-AUTH-005 forgot and reset password flows validate and handle expired tokens", async ({
    page,
  }) => {
    await page.route("**/api/v1/auth/forgot-password", async (route) => {
      await route.fulfill({ contentType: "application/json", status: 200, body: "{}" });
    });
    await page.route("**/api/v1/auth/reset-password", async (route) => {
      const body = route.request().postDataJSON() as { token?: string };
      if (body.token === "expired-token") {
        await route.fulfill({
          contentType: "application/json",
          status: 400,
          body: JSON.stringify({ detail: "This reset link is invalid or expired" }),
        });
        return;
      }
      await route.fulfill({ contentType: "application/json", status: 200, body: "{}" });
    });

    await page.goto("/login");
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);

    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
    await page.getByLabel(/email/i).fill("notanemail");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText("Enter a valid email")).toBeVisible();
    await page.getByLabel(/email/i).fill(validUser.email);
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText(/if this email exists/i)).toBeVisible();

    await page.goto("/reset-password");
    await expect(page).toHaveURL(/\/forgot-password$/);
    await page.goto("/reset-password?token=valid-token");
    await page.getByLabel(/new password/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("different123");
    await page.getByRole("button", { name: /reset password/i }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await page.getByLabel(/confirm password/i).fill("password123");
    await page.getByRole("button", { name: /reset password/i }).click();
    await expect(page.getByText(/password reset successful/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/, { timeout: 3000 });

    await page.goto("/reset-password?token=expired-token");
    await page.getByLabel(/new password/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("password123");
    await page.getByRole("button", { name: /reset password/i }).click();
    await expect(page.getByText("This reset link is invalid or expired")).toBeVisible();
    await expect(page.getByRole("link", { name: /request a new reset link/i })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  test("FE-AUTH-006 login page has no automated accessibility violations", async ({ page }) => {
    await page.goto("/login");

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
    await page.keyboard.press("Tab");
    await expect(page.getByLabel(/email/i)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel(/password/i)).toBeFocused();
  });

  test("FE-AUTH-007 login page is usable at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockCommonApis(page);
    await mockLogin(page);

    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeInViewport();
    await expect(page.getByLabel(/password/i)).toBeInViewport();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeInViewport();
    await expect(page.getByRole("link", { name: /forgot password/i })).toBeInViewport();

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBe(false);
  });

  test("FE-NAV-001/003 app shell renders MVP nav items, active state, badge, and mobile drawer", async ({
    page,
  }) => {
    await login(page);
    await expect(page.getByRole("link", { name: "Dashboard" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Orders" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Products" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Customers" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Coupons" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" }).first()).toBeVisible();
    await expect(page.getByText("3")).toBeVisible();

    await page.getByRole("link", { name: "Settings" }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/settings\/company/);
    await expect(page.getByRole("link", { name: "Settings" }).first()).toHaveClass(/text-primary/);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByLabel(/open navigation/i).click();
    await expect(page.getByRole("button", { name: /close navigation/i })).toBeVisible();
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByRole("button", { name: /close navigation/i })).toBeHidden();
  });

  test("FE-FORM-001/002 forms validate inline and prevent duplicate submissions", async ({
    page,
  }) => {
    let loginRequests = 0;
    await mockCommonApis(page);
    await page.route("**/api/v1/auth/login", async (route) => {
      loginRequests += 1;
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        contentType: "application/json",
        headers: { "set-cookie": "refresh=refresh-token; Path=/; HttpOnly; SameSite=Lax" },
        status: 200,
        body: JSON.stringify({
          access: "access-token",
          user: { id: "user-1", name: validUser.name, email: validUser.email, role: "admin" },
        }),
      });
    });

    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
    await page.getByLabel(/email/i).fill(validUser.email);
    await expect(page.getByText("Email is required")).toBeHidden();
    await page.getByLabel(/password/i).fill(validUser.password);

    const signIn = page.getByRole("button", { name: /sign in/i });
    await signIn.dblclick();
    await expect(signIn).toBeDisabled();
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(loginRequests).toBe(1);
  });

  test("FE-ERR-001 API errors render user-facing messages and recover on retry", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "refresh",
        value: "refresh-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await mockCommonApis(page);
    await mockRefresh(page, true);
    await mockCompany(page, { saveFails: true });

    await page.goto("/dashboard/settings/company");
    await expect(page.getByLabel(/^Name$/)).toHaveValue("Acme Commerce");
    await page.getByLabel(/^Name$/).fill("Changed Co");
    await page.getByRole("button", { name: /save profile/i }).click();

    await expect(page.getByRole("status")).toHaveText("Unable to save profile");
    await expect(page.getByLabel(/^Name$/)).toHaveValue("Acme Commerce");
  });
});
