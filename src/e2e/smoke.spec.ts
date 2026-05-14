import { expect, test } from "@playwright/test";

test("login page smoke test", async ({ page, request }) => {
  const health = await request.get("/login").catch(() => null);

  test.skip(!health?.ok(), "Target server is not running.");

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
});
