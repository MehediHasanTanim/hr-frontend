import { chromium, expect, test } from "@playwright/test";

test("home page smoke test", async ({ request }) => {
  const health = await request.get("/").catch(() => null);

  test.skip(!health?.ok(), "Target server is not running.");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "HR Frontend" })).toBeVisible();

  await browser.close();
});
