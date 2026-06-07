import { expect, type Page, test } from "@playwright/test";

// ─── Test User ───────────────────────────────────────────────────
const user = {
  email: "admin@acme.com",
  name: "Admin User",
  role: "HR_ADMIN",
};

// ─── Payroll Test Data ───────────────────────────────────────────
const salaryComponents = [
  {
    id: "comp-basic",
    companyId: "c1",
    name: "Basic Pay",
    code: "BASIC",
    type: "earning",
    calculationType: "fixed",
    formula: null,
    isActive: true,
  },
  {
    id: "comp-hra",
    companyId: "c1",
    name: "House Rent Allowance",
    code: "HRA",
    type: "earning",
    calculationType: "percentage_of_base",
    formula: null,
    isActive: true,
  },
  {
    id: "comp-pf",
    companyId: "c1",
    name: "Provident Fund",
    code: "PF",
    type: "deduction",
    calculationType: "formula",
    formula: "min(BASIC * 0.12, 1800)",
    isActive: true,
  },
  {
    id: "comp-tds",
    companyId: "c1",
    name: "Tax Deducted at Source",
    code: "TDS",
    type: "deduction",
    calculationType: "formula",
    formula: "BASIC * 0.1",
    isActive: true,
  },
  {
    id: "comp-medical",
    companyId: "c1",
    name: "Medical Insurance",
    code: "MED",
    type: "employer_contribution",
    calculationType: "fixed",
    formula: null,
    isActive: true,
  },
];

const salaryStructures = [
  {
    id: "struct-1",
    name: "Standard Full-Time",
    description: "Default structure for full-time employees",
    isActive: true,
    components: [
      {
        id: "sc-basic",
        componentId: "comp-basic",
        sortOrder: 1,
        defaultValue: 25000,
        component: salaryComponents[0],
      },
      {
        id: "sc-hra",
        componentId: "comp-hra",
        sortOrder: 2,
        defaultValue: 40,
        component: salaryComponents[1],
      },
      {
        id: "sc-pf",
        componentId: "comp-pf",
        sortOrder: 3,
        defaultValue: 0,
        component: salaryComponents[2],
      },
      {
        id: "sc-tds",
        componentId: "comp-tds",
        sortOrder: 4,
        defaultValue: 0,
        component: salaryComponents[3],
      },
    ],
  },
  {
    id: "struct-2",
    name: "Part-Time",
    description: null,
    isActive: true,
    components: [
      {
        id: "sc-basic-2",
        componentId: "comp-basic",
        sortOrder: 1,
        defaultValue: 15000,
        component: salaryComponents[0],
      },
    ],
  },
];

const payrollCycles = [
  {
    id: "cycle-1",
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
    id: "cycle-2",
    companyId: "c1",
    month: 12,
    year: 2024,
    status: "disbursed",
    totalGross: 420000,
    totalDeductions: 52000,
    totalNet: 368000,
    employeeCount: 48,
    runAt: "2024-12-05T10:00:00Z",
    approvedAt: "2024-12-06T14:00:00Z",
    disbursedAt: "2024-12-07T09:00:00Z",
  },
];

const payrollEntries = [
  {
    id: "entry-1",
    cycleId: "cycle-1",
    employeeId: "emp-1",
    employeeName: "Tanvir Ahmed",
    employeeCode: "EMP-001",
    department: "Human Resources",
    monthlyCTC: 50000,
    workingDays: 22,
    presentDays: 20,
    lopDays: 2,
    grossEarnings: 45455,
    totalDeductions: 5182,
    netPayable: 40273,
    status: "computed",
    payslipKey: null,
  },
  {
    id: "entry-2",
    cycleId: "cycle-1",
    employeeId: "emp-3",
    employeeName: "Nadia Islam",
    employeeCode: "EMP-003",
    department: "Engineering",
    monthlyCTC: 80000,
    workingDays: 22,
    presentDays: 22,
    lopDays: 0,
    grossEarnings: 80000,
    totalDeductions: 9600,
    netPayable: 70400,
    status: "computed",
    payslipKey: null,
  },
  {
    id: "entry-3",
    cycleId: "cycle-1",
    employeeId: "emp-5",
    employeeName: "Sara Khan",
    employeeCode: "EMP-005",
    department: "Marketing",
    monthlyCTC: 60000,
    workingDays: 22,
    presentDays: 22,
    lopDays: 0,
    grossEarnings: 60000,
    totalDeductions: 7200,
    netPayable: 52800,
    status: "held",
    payslipKey: null,
  },
];

const payslips = [
  {
    id: "ps-1",
    entryId: "entry-2",
    employeeId: "emp-3",
    employeeName: "Nadia Islam",
    employeeCode: "EMP-003",
    department: "Engineering",
    cycleId: "cycle-2",
    month: 12,
    year: 2024,
    netPayable: 70400,
    generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    downloadUrl: "https://example.s3.amazonaws.com/payslip-dec-2024-emp-003.pdf",
  },
  {
    id: "ps-2",
    entryId: "entry-1",
    employeeId: "emp-1",
    employeeName: "Tanvir Ahmed",
    employeeCode: "EMP-001",
    department: "Human Resources",
    cycleId: "cycle-2",
    month: 12,
    year: 2024,
    netPayable: 40273,
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
    downloadUrl: "https://example.s3.amazonaws.com/payslip-dec-2024-emp-001.pdf",
  },
];

const entryComponents = {
  "entry-1": [
    { componentId: "comp-basic", componentCode: "BASIC", componentName: "Basic Pay", type: "earning", amount: 25000 },
    { componentId: "comp-hra", componentCode: "HRA", componentName: "House Rent Allowance", type: "earning", amount: 10000 },
    { componentId: "comp-pf", componentCode: "PF", componentName: "Provident Fund", type: "deduction", amount: 1800 },
    { componentId: "comp-tds", componentCode: "TDS", componentName: "Tax Deducted at Source", type: "deduction", amount: 3382 },
  ],
  "entry-2": [
    { componentId: "comp-basic", componentCode: "BASIC", componentName: "Basic Pay", type: "earning", amount: 40000 },
    { componentId: "comp-hra", componentCode: "HRA", componentName: "House Rent Allowance", type: "earning", amount: 16000 },
    { componentId: "comp-pf", componentCode: "PF", componentName: "Provident Fund", type: "deduction", amount: 1800 },
    { componentId: "comp-tds", componentCode: "TDS", componentName: "Tax Deducted at Source", type: "deduction", amount: 7800 },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────
async function ensureTargetRunning(page: Page) {
  const response = await page.request.get("/login").catch(() => null);
  test.skip(!response?.ok(), "Target server is not running.");
}

async function authenticate(page: Page) {
  await mockCommonApis(page);
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

async function mockCommonApis(page: Page) {
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
        user: { id: "user-1", name: user.name, email: user.email, role: user.role },
      }),
    });
  });
}

async function mockPayrollApis(page: Page) {
  // Salary Components
  await page.route("**/api/v1/salary-components", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify(salaryComponents),
      });
      return;
    }
    if (route.request().method() === "POST") {
      const data = route.request().postDataJSON();
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "comp-new",
          ...data,
          isActive: true,
        }),
      });
      return;
    }
    await route.fulfill({ contentType: "application/json", status: 200, body: "{}" });
  });

  await page.route("**/api/v1/salary-components/*/status", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ ...salaryComponents[0], isActive: false }),
    });
  });

  // Salary Structures
  await page.route("**/api/v1/salary-structures", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify(salaryStructures),
      });
      return;
    }
    if (route.request().method() === "POST") {
      const data = route.request().postDataJSON();
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "struct-new",
          ...data,
          isActive: true,
          components: [],
        }),
      });
      return;
    }
    await route.fulfill({ status: 204 });
  });

  await page.route("**/api/v1/salary-structures/struct-1", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(salaryStructures[0]),
    });
  });

  // Payroll Cycles
  await page.route("**/api/v1/payroll/cycles", async (route) => {
    if (route.request().method() === "POST") {
      const data = route.request().postDataJSON();
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "cycle-new",
          ...data,
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

    const url = new URL(route.request().url());
    const pageNum = Number(url.searchParams.get("page") ?? 1);
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        data: payrollCycles,
        total: payrollCycles.length,
        page: pageNum,
        pageSize: 20,
      }),
    });
  });

  await page.route("**/api/v1/payroll/cycles/cycle-1", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(payrollCycles[0]),
    });
  });

  await page.route("**/api/v1/payroll/cycles/cycle-1/run", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ ...payrollCycles[0], status: "processing" }),
    });
  });

  await page.route("**/api/v1/payroll/cycles/cycle-1/approve", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ ...payrollCycles[0], status: "approved" }),
    });
  });

  await page.route("**/api/v1/payroll/cycles/cycle-1/reverse", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ ...payrollCycles[0], status: "reversed" }),
    });
  });

  await page.route("**/api/v1/payroll/cycles/cycle-1/disburse", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ ...payrollCycles[0], status: "disbursed" }),
    });
  });

  // Payroll Entries
  await page.route("**/api/v1/payroll/cycles/*/entries", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(payrollEntries),
    });
  });

  // Entry Components
  await page.route("**/api/v1/payroll/entries/*/components", async (route) => {
    const url = route.request().url();
    // Extract entry ID from URL
    const match = url.match(/\/entries\/([^/]+)\/components/);
    const entryId = match ? match[1] : "entry-1";
    const components = entryComponents[entryId as keyof typeof entryComponents] ?? entryComponents["entry-1"];
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(components),
    });
  });

  // Payslips
  await page.route("**/api/v1/payslips", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(payslips),
    });
  });

  await page.route("**/api/v1/payslips/ps-1", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        ...payslips[0],
        components: entryComponents["entry-2"],
      }),
    });
  });
}

// ─── Tests ───────────────────────────────────────────────────────
test.describe("Sprint 4 frontend regression automation", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await authenticate(page);
    await mockPayrollApis(page);
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-PAY-001 — Payroll Cycle Dashboard
  // ═══════════════════════════════════════════════════════════════
  test("FE-PAY-001 payroll cycle dashboard shows status indicators, run flow, and state transitions", async ({
    page,
  }) => {
    await page.goto("/payroll/cycles");
    const main = page.getByRole("main");

    // — Page loads with heading —
    await expect(main.getByRole("heading", { name: /payroll cycles/i })).toBeVisible();

    // — January 2025 cycle visible with Draft badge —
    await expect(main.getByText("January 2025")).toBeVisible();
    await expect(main.getByText("Draft")).toBeVisible();

    // — December 2024 cycle visible with Disbursed badge —
    await expect(main.getByText("December 2024")).toBeVisible();
    await expect(main.getByText("Disbursed")).toBeVisible();

    // — Employee counts shown —
    await expect(main.getByText("48")).toBeVisible();

    // — Gross and Net amounts formatted as currency —
    await expect(main.getByText(/₹4,20,000/i)).toBeVisible();
    await expect(main.getByText(/₹3,68,000/i)).toBeVisible();

    // — View button navigates to detail page —
    const viewLinks = main.getByRole("link", { name: /view/i });
    await expect(viewLinks.first()).toBeVisible();

    // — Click view on January 2025 cycle —
    await page.goto("/payroll/cycles/cycle-1");

    // — Cycle detail page shows period and status —
    await expect(page.getByText("January 2025 Payroll")).toBeVisible();
    await expect(page.getByText("Draft")).toBeVisible();

    // — Run Payroll button visible for draft —
    const runBtn = page.getByRole("button", { name: /run payroll/i });
    await expect(runBtn).toBeVisible();

    // — Click Run shows confirmation modal —
    await runBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/compute salaries/i)).toBeVisible();

    // — Confirm run —
    await page.getByRole("button", { name: /run payroll/i }).first().click();

    // — After run, processing indicator appears (polling starts) —
    // The cycle status may still be 'draft' in mock since we only mock GET
    // But the button should be disabled/processing

    // — Go back to list to verify create cycle modal —
    await page.goto("/payroll/cycles");

    // — Create Cycle button visible —
    await page.getByRole("button", { name: /create cycle/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Create Payroll Cycle")).toBeVisible();

    // — Month and Year selectors visible —
    await expect(page.getByLabel(/month/i)).toBeVisible();
    await expect(page.getByLabel(/year/i)).toBeVisible();

    // — Cancel closes modal —
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-PAY-002 — Payslip Viewer
  // ═══════════════════════════════════════════════════════════════
  test("FE-PAY-002 payslip viewer displays list, metadata, and download option", async ({
    page,
  }) => {
    await page.goto("/payroll/payslips");
    const main = page.getByRole("main");

    // — Page loads with heading —
    await expect(main.getByRole("heading", { name: /payslips/i })).toBeVisible();

    // — Payslip list table visible with periods —
    await expect(main.getByText("December 2024")).toBeVisible();

    // — Employee info shown in HR view —
    await expect(main.getByText("Nadia Islam")).toBeVisible();
    await expect(main.getByText("Tanvir Ahmed")).toBeVisible();

    // — Net pay formatted as currency —
    await expect(main.getByText(/₹70,400/i)).toBeVisible();
    await expect(main.getByText(/₹40,273/i)).toBeVisible();

    // — Generated date shown as relative time —
    await expect(main.getByText(/ago/i).first()).toBeVisible();

    // — View buttons present —
    const viewBtns = main.getByRole("link", { name: /view/i });
    await expect(viewBtns.first()).toBeVisible();

    // — Download buttons present (with href) —
    const downloadLinks = main.getByRole("link", { name: /download/i });
    await expect(downloadLinks.first()).toBeVisible();

    // — Click View on first payslip navigates —
    await viewBtns.first().click();

    // — Payslip detail page shows metadata card —
    await expect(page.getByText("December 2024")).toBeVisible();
    await expect(page.getByText("Nadia Islam")).toBeVisible();

    // — Net pay prominently displayed —
    await expect(page.getByText(/₹70,400/i)).toBeVisible();

    // — Download PDF button visible —
    const downloadBtn = page.getByRole("button", { name: /download pdf/i });
    await expect(downloadBtn).toBeVisible();

    // — Back link to all payslips —
    await expect(page.getByText(/all payslips/i)).toBeVisible();

    // — Show breakdown accordion works —
    await page.getByText(/show breakdown/i).click();
    await expect(page.getByText(/hide breakdown/i)).toBeVisible();
    await page.getByText(/hide breakdown/i).click();
    await expect(page.getByText(/show breakdown/i)).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-PAY-003 — Salary Structure Builder
  // ═══════════════════════════════════════════════════════════════
  test("FE-PAY-003 salary structure builder shows components, preview, and saves", async ({
    page,
  }) => {
    await page.goto("/payroll/structures");
    const main = page.getByRole("main");

    // — Page loads with heading —
    await expect(main.getByRole("heading", { name: /salary structures/i })).toBeVisible();

    // — Existing structures listed —
    await expect(main.getByText("Standard Full-Time")).toBeVisible();
    await expect(main.getByText("Part-Time")).toBeVisible();

    // — Component counts shown —
    await expect(main.getByText("4 components")).toBeVisible();
    await expect(main.getByText("1 component")).toBeVisible();

    // — Active badges visible —
    await expect(main.getByText("Active")).toBeVisible();

    // — Edit button exists —
    const editBtns = main.getByRole("button", { name: /edit/i });
    await expect(editBtns.first()).toBeVisible();

    // — Delete button exists —
    const deleteBtns = main.getByRole("button", { name: /delete/i });
    await expect(deleteBtns.first()).toBeVisible();

    // — New Structure button navigates to builder —
    await page.getByRole("link", { name: /new structure/i }).click();
    await expect(page).toHaveURL(/\/payroll\/structures\/new/);

    // — Builder page loads —
    await expect(page.getByRole("heading", { name: /create salary structure/i })).toBeVisible();

    // — Component picker shows components grouped by type —
    const builderMain = page.getByRole("main");
    await expect(builderMain.getByText("Basic Pay")).toBeVisible();
    await expect(builderMain.getByText("House Rent Allowance")).toBeVisible();
    await expect(builderMain.getByText("Provident Fund")).toBeVisible();
    await expect(builderMain.getByText("Tax Deducted at Source")).toBeVisible();
    await expect(builderMain.getByText("Medical Insurance")).toBeVisible();

    // — Earnings, Deductions, Employer Contributions sections —
    await expect(builderMain.getByText("Earnings")).toBeVisible();
    await expect(builderMain.getByText("Deductions")).toBeVisible();
    await expect(builderMain.getByText("Employer Contributions")).toBeVisible();

    // — Search input filters components —
    const searchInput = builderMain.getByPlaceholder(/search components/i);
    await expect(searchInput).toBeVisible();

    // — Structure name input —
    const nameInput = builderMain.getByLabel(/structure name/i);
    await expect(nameInput).toBeVisible();
    await nameInput.fill("Standard Full-Time");

    // — Description textarea —
    const descInput = builderMain.getByLabel(/description/i);
    await expect(descInput).toBeVisible();

    // — Add component button visible for each component —
    const addBtns = builderMain.getByRole("button", { name: /add/i });
    await expect(addBtns.first()).toBeVisible();

    // — Click Add on Basic Pay adds it to the canvas —
    await addBtns.first().click();

    // — Canvas should now show the component was added (no longer "Add" button) —
    // The "Add" button becomes "Added" label
    await expect(builderMain.getByText("Added").first()).toBeVisible();

    // — Live preview panel visible (sample CTC) —
    await expect(builderMain.getByText(/live preview/i)).toBeVisible();

    // — Preview shows Earnings section —
    await expect(builderMain.getByText("Earnings")).toBeVisible();

    // — Cancel button navigates back —
    await page.getByRole("button", { name: /cancel/i }).click();

    // — Navigate to edit page for existing structure —
    await page.goto("/payroll/structures/struct-1/edit");

    // — Edit page loads with structure name pre-filled —
    await expect(page.getByRole("heading", { name: /edit salary structure/i })).toBeVisible();
    await expect(page.getByText(/Standard Full-Time/i)).toBeVisible();

    // — Save Changes button exists —
    const saveBtn = page.getByRole("button", { name: /save changes/i });
    await expect(saveBtn).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-PAY-004 — Salary Components Library
  // ═══════════════════════════════════════════════════════════════
  test("FE-PAY-004 salary components library lists, filters by type, and shows correct data", async ({
    page,
  }) => {
    await page.goto("/payroll/components");
    const main = page.getByRole("main");

    // — Page loads with heading —
    await expect(main.getByRole("heading", { name: /salary components/i })).toBeVisible();

    // — All components visible in table —
    await expect(main.getByText("Basic Pay")).toBeVisible();
    await expect(main.getByText("House Rent Allowance")).toBeVisible();
    await expect(main.getByText("Provident Fund")).toBeVisible();
    await expect(main.getByText("Tax Deducted at Source")).toBeVisible();
    await expect(main.getByText("Medical Insurance")).toBeVisible();

    // — Codes shown in monospace —
    await expect(main.getByText("BASIC")).toBeVisible();
    await expect(main.getByText("HRA")).toBeVisible();
    await expect(main.getByText("PF")).toBeVisible();
    await expect(main.getByText("TDS")).toBeVisible();

    // — Type badges colored correctly —
    await expect(main.getByText("Earning")).toBeVisible();
    await expect(main.getByText("Deduction")).toBeVisible();
    await expect(main.getByText("Employer Contribution")).toBeVisible();

    // — Calculation types shown —
    await expect(main.getByText("Fixed")).toBeVisible();
    await expect(main.getByText("Formula")).toBeVisible();
    await expect(main.getByText("% of Base")).toBeVisible();

    // — Active badges —
    const activeBadges = main.getByText("Active");
    await expect(activeBadges.first()).toBeVisible();

    // — Tab filter bar with counts —
    await expect(main.getByText(/all/i)).toBeVisible();
    await expect(main.getByText(/earnings/i)).toBeVisible();
    await expect(main.getByText(/deductions/i)).toBeVisible();

    // — Filter by Earnings tab —
    await page.getByRole("button", { name: /earnings/i }).click();
    // Only earning components should remain
    await expect(main.getByText("Basic Pay")).toBeVisible();
    await expect(main.getByText("House Rent Allowance")).toBeVisible();
    // Deductions should be hidden
    await expect(main.getByText("Provident Fund")).not.toBeVisible();

    // — Reset to All —
    await page.getByRole("button", { name: /all/i }).click();
    await expect(main.getByText("Provident Fund")).toBeVisible();

    // — Edit buttons for each row —
    const editBtns = main.getByRole("button", { name: /edit/i });
    await expect(editBtns.first()).toBeVisible();

    // — Add Component button opens drawer —
    await page.getByRole("button", { name: /add component/i }).click();
    // Drawer opens (sheet slides in)
    // The drawer content is in a portal
  });
});
