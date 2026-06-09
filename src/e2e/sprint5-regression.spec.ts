import { expect, type Page, test } from "@playwright/test";

// ─── Test data ──────────────────────────────────────────────────
const hrUser = {
  email: "hr@acme.com",
  name: "HR Manager",
  role: "hr_manager",
};

const employeeUser = {
  id: "emp-001",
  email: "tanvir@example.com",
  name: "Tanvir Ahmed",
  code: "EMP-001",
  department: "Human Resources",
};

// ─── Payroll cycle test data ────────────────────────────────────
const payrollCycles = [
  {
    id: "cycle-jan-2025",
    companyId: "c1",
    month: 1,
    year: 2025,
    status: "draft",
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
    employeeCount: 48,
    runAt: null,
    approvedAt: null,
    disbursedAt: null,
  },
  {
    id: "cycle-feb-2025",
    companyId: "c1",
    month: 2,
    year: 2025,
    status: "disbursed",
    totalGross: 2400000,
    totalDeductions: 480000,
    totalNet: 1920000,
    employeeCount: 48,
    runAt: "2025-02-01T10:00:00Z",
    approvedAt: "2025-02-01T12:00:00Z",
    disbursedAt: "2025-02-01T14:00:00Z",
  },
];

const payrollEntries = Array.from({ length: 5 }, (_, i) => ({
  id: `entry-${i + 1}`,
  cycleId: "cycle-jan-2025",
  employeeId: `emp-${i + 1}`,
  employeeName: `Employee ${i + 1}`,
  employeeCode: `EMP-00${i + 1}`,
  department: i < 3 ? "Human Resources" : "Engineering",
  monthlyCTC: 50000 + i * 5000,
  workingDays: 22,
  presentDays: 22,
  lopDays: 0,
  grossEarnings: 50000 + i * 5000,
  totalDeductions: 10000 + i * 1000,
  netPayable: 40000 + i * 4000,
  status: "computed" as const,
  payslipKey: null,
}));

const entryComponents = [
  { componentId: "comp-basic", componentCode: "BASIC", componentName: "Basic Pay", type: "earning" as const, amount: 25000 },
  { componentId: "comp-hra", componentCode: "HRA", componentName: "HRA", type: "earning" as const, amount: 10000 },
  { componentId: "comp-pf", componentCode: "PF", componentName: "Provident Fund", type: "deduction" as const, amount: 3000 },
  { componentId: "comp-tax", componentCode: "IT", componentName: "Income Tax", type: "deduction" as const, amount: 2000 },
];

// ─── Salary structure test data ─────────────────────────────────
const salaryComponents = [
  { id: "comp-basic", companyId: "c1", name: "Basic Pay", code: "BASIC", type: "earning" as const, calculationType: "fixed" as const, formula: null, isActive: true },
  { id: "comp-hra", companyId: "c1", name: "HRA", code: "HRA", type: "earning" as const, calculationType: "percentage_of_base" as const, formula: null, isActive: true },
  { id: "comp-pf", companyId: "c1", name: "Provident Fund", code: "PF", type: "deduction" as const, calculationType: "formula" as const, formula: "BASIC * 0.12", isActive: true },
  { id: "comp-sa", companyId: "c1", name: "Special Allowance", code: "SA", type: "earning" as const, calculationType: "fixed" as const, formula: null, isActive: true },
];

const salaryStructures = [
  {
    id: "struct-1",
    name: "Standard Full-Time",
    description: null,
    isActive: true,
    components: [
      { id: "sc-1", componentId: "comp-basic", component: salaryComponents[0], sortOrder: 1, defaultValue: 25000 },
      { id: "sc-2", componentId: "comp-hra", component: salaryComponents[1], sortOrder: 2, defaultValue: 40 },
      { id: "sc-3", componentId: "comp-pf", component: salaryComponents[2], sortOrder: 3, defaultValue: 0 },
    ],
  },
];

// ─── Payslip test data ──────────────────────────────────────────
const payslips = [
  {
    id: "payslip-jan-2025",
    entryId: "entry-1",
    employeeId: "emp-001",
    cycleId: "cycle-jan-2025",
    month: 1,
    year: 2025,
    netPayable: 40000,
    generatedAt: "2025-02-01T14:30:00Z",
    downloadUrl: "/api/v1/payslips/payslip-jan-2025/download",
  },
];

// ─── Helpers ────────────────────────────────────────────────────
async function ensureTargetRunning(page: Page) {
  const response = await page.request.get("/login").catch(() => null);
  test.skip(!response?.ok(), "Target server is not running.");
}

async function mockAuthApis(page: Page) {
  await page.route("**/api/v1/notifications", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ unreadCount: 0 }),
    });
  });

  await page.route("**/api/v1/auth/logout", async (route) => {
    await route.fulfill({ status: 204 });
  });

  await page.route("**/*auth/refresh*", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        access: "access-token",
        user: { id: "user-hr", name: hrUser.name, email: hrUser.email, role: hrUser.role },
      }),
    });
  });
}

async function authenticateAsHR(page: Page) {
  await mockAuthApis(page);
  await page.context().addCookies([
    {
      name: "refresh",
      value: "refresh-token",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

async function authenticateAsEmployee(page: Page) {
  await mockAuthApis(page);
  await page.context().addCookies([
    {
      name: "refresh",
      value: "refresh-token",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

async function mockPayrollCycleApis(page: Page) {
  // List cycles
  await page.route("**/api/v1/payroll/cycles?*", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ data: payrollCycles, total: payrollCycles.length }),
    });
  });

  // Single cycle detail
  await page.route("**/api/v1/payroll/cycles/*/entries", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(payrollEntries),
    });
  });

  await page.route("**/api/v1/payroll/cycles/*/run", async (route) => {
    // Simulate processing then completing
    const updated = { ...payrollCycles[0], status: "processing", totalGross: 2400000, totalDeductions: 480000, totalNet: 1920000, runAt: new Date().toISOString() };
    payrollCycles[0] = updated;
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(updated),
    });
  });

  await page.route("**/api/v1/payroll/cycles/*/approve", async (route) => {
    const updated = { ...payrollCycles[0], status: "approved", approvedAt: new Date().toISOString() };
    payrollCycles[0] = updated;
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(updated),
    });
  });

  await page.route("**/api/v1/payroll/cycles/*/disburse", async (route) => {
    const updated = { ...payrollCycles[0], status: "disbursed", disbursedAt: new Date().toISOString() };
    payrollCycles[0] = updated;
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(updated),
    });
  });

  await page.route("**/api/v1/payroll/cycles", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "cycle-mar-2025",
          companyId: "c1",
          month: 3,
          year: 2025,
          status: "draft",
          totalGross: 0,
          totalDeductions: 0,
          totalNet: 0,
          employeeCount: 0,
          runAt: null,
          approvedAt: null,
          disbursedAt: null,
        }),
      });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ data: payrollCycles, total: payrollCycles.length }),
    });
  });

  // Get single cycle
  await page.route(/\/api\/v1\/payroll\/cycles\/[^/]+$/, async (route) => {
    const url = route.request().url();
    const cycleId = url.split("/").pop()?.split("?")[0];
    const cycle = payrollCycles.find((c) => c.id === cycleId) ?? payrollCycles[0];
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(cycle),
    });
  });

  // Entry components
  await page.route("**/api/v1/payroll/entries/*/components", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(entryComponents),
    });
  });
}

async function mockPayslipApis(page: Page) {
  await page.route("**/api/v1/payslips", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(payslips),
    });
  });

  await page.route("**/api/v1/payslips/*", async (route) => {
    const url = route.request().url();
    if (url.includes("/download")) {
      await route.fulfill({
        contentType: "application/pdf",
        status: 200,
        body: Buffer.from("%PDF-1.4 mock payslip content"),
        headers: { "Content-Disposition": 'attachment; filename="payslip-jan-2025.pdf"' },
      });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(payslips[0]),
    });
  });
}

async function mockStructureApis(page: Page) {
  await page.route("**/api/v1/salary-components", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(salaryComponents),
    });
  });

  await page.route("**/api/v1/salary-structures", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "struct-new",
          name: "Standard Full-Time",
          description: null,
          isActive: true,
          components: salaryStructures[0].components,
        }),
      });
      return;
    }
    if (route.request().method() === "PUT") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify({ ...salaryStructures[0], components: salaryStructures[0].components.slice(1) }),
      });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(salaryStructures),
    });
  });

  await page.route("**/api/v1/salary-structures/*", async (route) => {
    const url = route.request().url();
    if (route.request().method() === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }
    const structureId = url.split("/").pop()?.split("?")[0];
    const structure = salaryStructures.find((s) => s.id === structureId) ?? salaryStructures[0];
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(structure),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// FE-PAY-001: Payroll cycle dashboard — status indicators & run flow
// ═══════════════════════════════════════════════════════════════
test.describe("FE-PAY-001 Payroll cycle dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await authenticateAsHR(page);
    await mockPayrollCycleApis(page);
  });

  test("status indicators display correctly for all cycle states", async ({ page }) => {
    await page.goto("/payroll/cycles");

    // Verify list renders with both cycles
    await expect(page.getByText("January 2025")).toBeVisible();
    await expect(page.getByText("February 2025")).toBeVisible();

    // Check status badges
    await expect(page.getByText("Draft").first()).toBeVisible();
    await expect(page.getByText("Disbursed").first()).toBeVisible();

    // Verify employee count column
    await expect(page.getByText("48")).toBeVisible();
  });

  test("run payroll flow for a draft cycle", async ({ page }) => {
    await page.goto("/payroll/cycles");

    // Click on Jan 2025 cycle to go to detail
    await page.getByText("January 2025").click();
    await expect(page).toHaveURL(/\/payroll\/cycles\/cycle-jan-2025/);

    // Verify detail page renders
    await expect(page.getByText("January 2025 Payroll")).toBeVisible();
    await expect(page.getByText("Draft")).toBeVisible();

    // Click Run Payroll
    await page.getByRole("button", { name: /run payroll/i }).click();

    // Confirmation modal appears
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: /confirm|run/i })).toBeVisible();

    // Confirm the run
    await page.getByRole("button", { name: /confirm|run/i }).click();

    // Status should change to processing/computed
    await expect(page.getByText(/processing|computed/i)).toBeVisible();
  });

  test("approve and disburse payroll cycle", async ({ page }) => {
    // Set cycle to computed state
    payrollCycles[0].status = "computed";
    payrollCycles[0].totalGross = 2400000;
    payrollCycles[0].totalDeductions = 480000;
    payrollCycles[0].totalNet = 1920000;

    await page.goto("/payroll/cycles/cycle-jan-2025");

    // Verify computed state shows approval panel
    await expect(page.getByText(/payroll ready for review/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /approve/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /reject/i })).toBeVisible();

    // Click Approve
    await page.getByRole("button", { name: /approve/i }).click();

    // Approval dialog
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/lock all entries/i)).toBeVisible();

    // Confirm approval
    await page.getByRole("button", { name: /approve/i }).last().click();

    // Should now show approved panel
    await expect(page.getByText(/payroll approved/i)).toBeVisible();
  });

  test("disbursed cycle has no run button", async ({ page }) => {
    await page.goto("/payroll/cycles/cycle-feb-2025");

    // Verify disbursed status
    await expect(page.getByText(/disbursed/i)).toBeVisible();

    // Run button should not exist
    await expect(page.getByRole("button", { name: /run payroll/i })).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// FE-PAY-002: Payslip viewer — view and download
// ═══════════════════════════════════════════════════════════════
test.describe("FE-PAY-002 Payslip viewer", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await mockPayslipApis(page);
  });

  test("employee can view payslip list and open a payslip", async ({ page }) => {
    await authenticateAsEmployee(page);
    await page.goto("/payslips");

    // Verify payslip list renders
    await expect(page.getByText("January 2025")).toBeVisible();
    await expect(page.getByText(/40,000/)).toBeVisible();

    // Click view on the payslip
    await page.getByRole("link", { name: /view/i }).click();
    await expect(page).toHaveURL(/\/payslips\/payslip-jan-2025/);

    // Verify payslip details
    await expect(page.getByText(/₹\s*40,000/)).toBeVisible();
  });

  test("download payslip PDF", async ({ page }) => {
    await authenticateAsEmployee(page);
    await page.goto("/payslips/payslip-jan-2025");

    // Click download button
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: /download pdf/i }).click();
    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toContain(".pdf");
  });

  test("HR can view all employee payslips with filters", async ({ page }) => {
    await authenticateAsHR(page);
    await page.goto("/payroll/payslips");

    // HR view should show employee details
    await expect(page.getByText("January 2025")).toBeVisible();

    // Month filter should be available
    await expect(page.getByLabel(/month/i)).toBeVisible();

    // Year filter should be available
    await expect(page.getByLabel(/year/i)).toBeVisible();
  });

  test("empty state when no payslips available", async ({ page }) => {
    // Override to return empty list
    await page.route("**/api/v1/payslips", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify([]),
      });
    });

    await authenticateAsEmployee(page);
    await page.goto("/payslips");

    await expect(page.getByText(/no payslips available yet/i)).toBeVisible();
  });

  test("error state when payslips fail to load", async ({ page }) => {
    // Override to return error
    await page.route("**/api/v1/payslips", async (route) => {
      await route.fulfill({ status: 500 });
    });

    await authenticateAsEmployee(page);
    await page.goto("/payslips");

    await expect(page.getByText(/could not load payslips/i)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// FE-PAY-003: Salary structure builder
// ═══════════════════════════════════════════════════════════════
test.describe("FE-PAY-003 Salary structure builder", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await authenticateAsHR(page);
    await mockStructureApis(page);
  });

  test("create a new salary structure with components", async ({ page }) => {
    await page.goto("/payroll/structures/new");

    // Enter structure name
    const nameInput = page.getByPlaceholder(/e\.g\. standard full-time/i);
    await expect(nameInput).toBeVisible();
    await nameInput.fill("Standard Full-Time");

    // Component picker should show available components
    await expect(page.getByText("Earnings")).toBeVisible();
    await expect(page.getByText("Deductions")).toBeVisible();

    // Add Basic Pay component
    const addButtons = page.getByRole("button", { name: /add/i });
    await addButtons.first().click();

    // Component should appear on canvas
    await expect(page.getByText("Basic Pay")).toBeVisible();

    // Live preview should show
    await expect(page.getByText(/live preview/i)).toBeVisible();
  });

  test("validation prevents saving without components", async ({ page }) => {
    await page.goto("/payroll/structures/new");

    // Enter only a name - no components
    const nameInput = page.getByPlaceholder(/e\.g\. standard full-time/i);
    await nameInput.fill("Test Structure");

    // Create button should be disabled without components
    const createBtn = page.getByRole("button", { name: /create structure/i });
    await expect(createBtn).toBeDisabled();
  });

  test("structure list shows all saved structures", async ({ page }) => {
    await page.goto("/payroll/structures");

    // Verify structure list
    await expect(page.getByText("Standard Full-Time")).toBeVisible();
    await expect(page.getByText(/1 components/)).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
  });

  test("edit existing structure and save changes", async ({ page }) => {
    await page.goto("/payroll/structures/struct-1");

    // Structure builder should be pre-filled
    const nameInput = page.getByPlaceholder(/e\.g\. standard full-time/i);
    await expect(nameInput).toHaveValue("Standard Full-Time");

    // Save changes button should be present
    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
  });

  test("structure list empty state", async ({ page }) => {
    // Override to return empty list
    await page.route("**/api/v1/salary-structures", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          contentType: "application/json",
          status: 200,
          body: JSON.stringify([]),
        });
        return;
      }
      await route.fulfill({ status: 500 });
    });

    await page.goto("/payroll/structures");

    await expect(page.getByText(/no salary structures yet/i)).toBeVisible();
  });

  test("error state when structures fail to load", async ({ page }) => {
    // Override to return error
    await page.route("**/api/v1/salary-structures", async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.goto("/payroll/structures");

    await expect(page.getByText(/could not load structures/i)).toBeVisible();
  });
});
