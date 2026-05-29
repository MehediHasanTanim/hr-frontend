import { expect, type Page, test } from "@playwright/test";

const user = {
  email: "admin@acme.com",
  name: "Admin User",
};

const employees = [
  {
    id: "emp-1",
    firstName: "Tanvir",
    lastName: "Ahmed",
    employeeNumber: "EMP-001",
    email: "tanvir@example.com",
    workEmail: "tanvir@acme.test",
    phone: "+8801712345678",
    dateOfBirth: "1992-02-10",
    gender: "male",
    nationalId: "NID-001",
    passportNumber: "P-001",
    departmentId: "hr",
    departmentName: "Human Resources",
    jobTitle: "HR Manager",
    status: "active",
    employeeType: "full_time",
    location: "Dhaka",
    joiningDate: "2024-01-15",
    probationEndDate: "2024-04-15",
    payGrade: "G7",
    managerId: "emp-2",
    managerName: "Maya Rahman",
    bankName: "City Bank",
    branchName: "Gulshan",
    accountHolderName: "Tanvir Ahmed",
    accountNumber: "1234567890",
    routingNumber: "1201001",
  },
  {
    id: "emp-2",
    firstName: "Maya",
    lastName: "Rahman",
    employeeNumber: "EMP-002",
    email: "maya@example.com",
    departmentId: "eng",
    departmentName: "Engineering",
    jobTitle: "Engineering Director",
    status: "on_leave",
    employeeType: "contractor",
    location: "Chattogram",
    joiningDate: "2023-03-20",
  },
];

const departments = [
  {
    id: "hr",
    name: "Human Resources",
    code: "HR",
    parentId: null,
    status: "active",
    headId: "emp-1",
    headName: "Tanvir Ahmed",
    children: [
      {
        id: "recruiting",
        name: "Recruiting",
        code: "REC",
        parentId: "hr",
        status: "active",
        headName: "Nadia Islam",
        children: [],
      },
    ],
  },
  {
    id: "eng",
    name: "Engineering",
    code: "ENG",
    parentId: null,
    status: "active",
    headId: "emp-2",
    headName: "Maya Rahman",
    children: [],
  },
];

async function ensureTargetRunning(page: Page) {
  const response = await page.request.get("/login").catch(() => null);
  test.skip(!response?.ok(), "Target server is not running.");
}

async function mockCommonApis(page: Page) {
  await page.route("**/api/v1/notifications", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ unreadCount: 2 }),
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
        user: { id: "user-1", name: user.name, email: user.email, role: "admin" },
      }),
    });
  });
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

async function mockEmployeeApis(page: Page) {
  await page.route("**/api/v1/departments", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify(departments),
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 201,
      body: JSON.stringify({
        id: "ops",
        name: "Operations",
        code: "OPS",
        parentId: "",
        status: "active",
        children: [],
      }),
    });
  });

  await page.route("**/api/v1/departments/*", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ ...departments[0], status: "inactive" }),
    });
  });

  await page.route("**/api/v1/employees/import/job-1", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        id: "job-1",
        status: "completed",
        progress: 100,
        totalRows: 3,
        successfulRows: 2,
        failedRows: 1,
        errorReportUrl: "/reports/import-errors.csv",
        errors: [{ rowNumber: 3, field: "email", message: "Invalid email", rawValue: "bad-email" }],
      }),
    });
  });

  await page.route("**/api/v1/employees/import", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 202,
      body: JSON.stringify({ id: "job-1", status: "pending", progress: 10 }),
    });
  });

  await page.route("**/api/v1/employees/emp-1/history", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify([
        {
          id: "hist-2",
          eventType: "promoted",
          effectiveDate: "2025-01-01",
          oldValue: "HR Specialist",
          newValue: "HR Manager",
          changedBy: "Admin User",
          remarks: "Annual promotion cycle",
        },
        {
          id: "hist-1",
          eventType: "hired",
          effectiveDate: "2024-01-15",
          newValue: "HR Specialist",
          changedBy: "Admin User",
          remarks: "Initial hire",
        },
      ]),
    });
  });

  await page.route("**/api/v1/employees/emp-3", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        ...employees[0],
        id: "emp-3",
        firstName: "Nadia",
        lastName: "Islam",
        employeeNumber: "EMP-003",
        email: "nadia@example.com",
      }),
    });
  });

  await page.route("**/api/v1/employees/emp-1", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(employees[0]),
    });
  });

  await page.route(/\/api\/v1\/employees(?:\?.*)?$/, async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          ...employees[0],
          id: "emp-3",
          firstName: "Nadia",
          lastName: "Islam",
          employeeNumber: "EMP-003",
          email: "nadia@example.com",
        }),
      });
      return;
    }

    const url = new URL(route.request().url());
    const search = url.searchParams.get("search") ?? "";
    const filtered = search === "no-match" ? [] : employees;
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        data: filtered,
        total: search === "no-match" ? 0 : 25,
        page: Number(url.searchParams.get("page") ?? 1),
        pageSize: Number(url.searchParams.get("pageSize") ?? 10),
      }),
    });
  });
}

async function mockOrgChart(page: Page) {
  await page.route("**/api/v1/org-chart", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        id: "emp-2",
        name: "Maya Rahman",
        jobTitle: "Engineering Director",
        department: "Engineering",
        directReportCount: 2,
        headcount: 3,
        children: [
          {
            id: "emp-1",
            name: "Tanvir Ahmed",
            jobTitle: "HR Manager",
            department: "Human Resources",
            directReportCount: 1,
            headcount: 2,
            children: [
              {
                id: "emp-4",
                name: "Rafi Khan",
                jobTitle: "Recruiter",
                department: "Recruiting",
                directReportCount: 0,
                headcount: 1,
                children: [],
              },
            ],
          },
        ],
      }),
    });
  });
}

async function fillValidEmployeeForm(page: Page) {
  const main = page.getByRole("main");
  await main.getByLabel("First name").fill("Nadia");
  await main.getByLabel("Last name").fill("Islam");
  await main.getByLabel("Email", { exact: true }).fill("nadia@example.com");
  await main.getByLabel("Phone").fill("+8801812345678");
  await main.getByLabel("Employee number").fill("EMP-003");
  await main.getByLabel("Employee type").selectOption("full_time");
  await main.getByLabel("Employment status").selectOption("active");
  await main.getByLabel("Joining date").fill("2026-01-15");
  await main.getByLabel("Department", { exact: true }).selectOption("hr");
  await main.getByLabel("Job title").fill("Recruiter");
  await main.getByLabel("Location").fill("Dhaka");
  await main.getByLabel("Account number").fill("555001122");
}

test.describe("Sprint 2 frontend regression automation", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await authenticate(page);
    await mockEmployeeApis(page);
  });

  test("FE-EMP-001 employee list filters, searches, sorts, paginates, and handles empty state", async ({
    page,
  }) => {
    await page.goto("/employees");
    const main = page.getByRole("main");

    await expect(main.getByRole("heading", { name: "Employees" })).toBeVisible();
    await expect(main.getByRole("cell", { name: "Tanvir Ahmed" })).toBeVisible();
    await expect(main.getByRole("cell", { name: "EMP-001" })).toBeVisible();

    await main.getByLabel("Department", { exact: true }).selectOption("hr");
    await expect(page).toHaveURL(/departmentId=hr/);
    await main.getByLabel("Status").selectOption("active");
    await expect(page).toHaveURL(/status=active/);
    await main.getByLabel("Employee type").selectOption("full_time");
    await expect(page).toHaveURL(/employeeType=full_time/);

    await main.getByLabel("Search employees").fill("tanvir");
    await expect(page).toHaveURL(/search=tanvir/);
    await page.getByRole("button", { name: /employee number/i }).click();
    await expect(page).toHaveURL(/sortBy=employeeNumber/);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);

    await main.getByLabel("Search employees").fill("no-match");
    await expect(page.getByText("No employees found.")).toBeVisible();
  });

  test("FE-EMP-002 employee create form validates required fields and navigates after submit", async ({
    page,
  }) => {
    await page.goto("/employees/create");
    const main = page.getByRole("main");

    await main.getByRole("button", { name: "Save employee" }).click();
    await expect(page.getByText("First name is required")).toBeVisible();
    await expect(page.getByText("Employee number is required")).toBeVisible();
    await expect(page.getByText("Account number is required")).toBeVisible();

    await main.getByLabel("Email", { exact: true }).fill("bad-email");
    await main.getByLabel("Phone").fill("abc");
    await main.getByRole("button", { name: "Save employee" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Enter a valid phone number")).toBeVisible();

    await fillValidEmployeeForm(page);
    await page.getByRole("button", { name: "Save employee" }).click();

    await expect(page).toHaveURL(/\/employees\/emp-3$/);
    await expect(page.getByRole("heading", { name: "Nadia Islam" })).toBeVisible();
  });

  test("FE-EMP-003 employee profile tabs render overview, masked bank data, placeholders, and history", async ({
    page,
  }) => {
    await page.goto("/employees/emp-1");

    await expect(page.getByRole("heading", { name: "Tanvir Ahmed" })).toBeVisible();
    await expect(page.getByText("**** **** 7890")).toBeVisible();
    await expect(page.getByText("Maya Rahman")).toBeVisible();

    await page.getByRole("button", { name: "Documents" }).click();
    await expect(page.getByText(/Documents will appear here/i)).toBeVisible();
    await page.getByRole("button", { name: "History" }).click();
    await expect(page.getByText("Promoted")).toBeVisible();
    await expect(page.getByText("Annual promotion cycle")).toBeVisible();
    await page.getByRole("button", { name: "Leave" }).click();
    await expect(page.getByText("Leave summary")).toBeVisible();
    await page.getByRole("button", { name: "Payroll" }).click();
    await expect(page.getByText("Payroll summary")).toBeVisible();
  });

  test("FE-ORG-001 org chart renders hierarchy, headcount, drill-down, and zoom controls", async ({
    page,
  }) => {
    await mockOrgChart(page);
    await page.goto("/org-chart");

    await expect(page.getByRole("heading", { name: "Organization chart" })).toBeVisible();
    await expect(page.getByText("Headcount overlay: 3")).toBeVisible();
    await expect(page.getByText("Maya Rahman")).toBeVisible();
    await expect(page.getByText("Tanvir Ahmed")).toBeVisible();

    await page.getByRole("button", { name: /Tanvir Ahmed/i }).click();
    await expect(page.getByText("Headcount overlay: 2")).toBeVisible();
    await page.getByLabel("Zoom in").click();
    await page.getByLabel("Zoom out").click();
    await page.getByRole("button", { name: "Reset drill-down" }).click();
    await expect(page.getByText("Headcount overlay: 3")).toBeVisible();
  });

  test("FE-ORG-002 department tree adds, edits, deactivates, and excludes invalid parent choice", async ({
    page,
  }) => {
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/departments");
    const main = page.getByRole("main");

    await expect(main.getByRole("heading", { name: "Departments" })).toBeVisible();
    await expect(main.locator("p").filter({ hasText: "Human Resources" })).toBeVisible();
    await expect(main.getByText("Head: Tanvir Ahmed")).toBeVisible();

    await page.getByLabel("Edit Human Resources").click();
    await expect(main.getByLabel("Parent department")).not.toContainText("Human Resources");
    await main.getByLabel("Department name").fill("People Operations");
    await main.getByRole("button", { name: "Save department" }).click();
    await expect(page.getByRole("status")).toContainText("Department saved");

    await main.getByRole("button", { name: "New" }).click();
    await main.getByLabel("Department name").fill("Operations");
    await main.getByLabel("Code").fill("OPS");
    await main.getByLabel("Parent department").selectOption("eng");
    await main.getByRole("button", { name: "Save department" }).click();
    await expect(page.getByRole("status")).toContainText("Department saved");

    await page.getByLabel("Deactivate Human Resources").click();
    await expect(page.getByRole("status")).toContainText("Department deactivated");
  });

  test("FE-IMPORT-001 CSV import validates file type, starts job, polls status, and shows row errors", async ({
    page,
  }) => {
    await page.goto("/employees/import");

    await page.setInputFiles('input[type="file"]', {
      name: "employees.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not,csv"),
    });
    await expect(page.getByRole("status")).toContainText("Choose a CSV file");

    await page.setInputFiles('input[type="file"]', {
      name: "employees.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("firstName,lastName,email\nTanvir,Ahmed,tanvir@example.com\n"),
    });
    await expect(page.getByText(/employees.csv/)).toBeVisible();
    await page.getByRole("button", { name: "Start import" }).click();

    await expect(page.getByText("completed")).toBeVisible();
    await expect(page.getByText("Total rows")).toBeVisible();
    await expect(page.locator("p").filter({ hasText: "Total rows" }).getByText("3")).toBeVisible();
    await expect(page.getByText("Invalid email")).toBeVisible();
    await expect(page.getByText("bad-email")).toBeVisible();
    await expect(page.getByRole("link", { name: "Download error report" })).toHaveAttribute(
      "href",
      "/reports/import-errors.csv",
    );
  });
});
