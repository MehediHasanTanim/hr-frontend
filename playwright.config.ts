import { defineConfig, devices } from "@playwright/test";

const defaultBaseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const stagingBaseUrl =
  process.env.STAGING_BASE_URL ?? "https://staging.yourapi.com";

export default defineConfig({
  testDir: "./src/e2e",
  outputDir: "test-results/",
  retries: process.env.CI === "true" ? 2 : 0,
  use: {
    baseURL: defaultBaseUrl,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: defaultBaseUrl,
      },
    },
    {
      name: "staging",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: stagingBaseUrl,
      },
    },
  ],
});
