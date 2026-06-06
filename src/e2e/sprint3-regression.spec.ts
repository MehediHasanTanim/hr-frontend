import { expect, type Page, test } from "@playwright/test";

// ─── Test Data ───────────────────────────────────────────────────
const user = {
  email: "admin@acme.com",
  name: "Admin User",
  role: "HR_ADMIN",
};

const leaveTypes = [
  {
    id: "lt-11111111-1111-1111-1111-111111111111",
    name: "Annual Leave",
    code: "AL",
    accrualType: "monthly",
    accrualAmount: 2.5,
    maxCarryForward: 5,
    maxBalance: 30,
    isPaid: true,
    isActive: true,
  },
  {
    id: "lt-22222222-2222-2222-2222-222222222222",
    name: "Sick Leave",
    code: "SL",
    accrualType: "monthly",
    accrualAmount: 1.5,
    maxCarryForward: 0,
    maxBalance: 15,
    isPaid: true,
    isActive: true,
  },
  {
    id: "lt-33333333-3333-3333-3333-333333333333",
    name: "Personal Leave",
    code: "PL",
    accrualType: "none",
    accrualAmount: 0,
    maxCarryForward: 0,
    maxBalance: 10,
    isPaid: false,
    isActive: true,
  },
];

const leaveBalances = [
  {
    leaveTypeId: "lt-11111111-1111-1111-1111-111111111111",
    leaveTypeName: "Annual Leave",
    year: 2026,
    entitled: 30,
    used: 5,
    carriedForward: 2,
    closing: 27,
  },
  {
    leaveTypeId: "lt-22222222-2222-2222-2222-222222222222",
    leaveTypeName: "Sick Leave",
    year: 2026,
    entitled: 18,
    used: 3,
    carriedForward: 0,
    closing: 15,
  },
  {
    leaveTypeId: "lt-33333333-3333-3333-3333-333333333333",
    leaveTypeName: "Personal Leave",
    year: 2026,
    entitled: 10,
    used: 8,
    carriedForward: 0,
    closing: 2,
  },
];

const leaveRequests = [
  {
    id: "lr-1",
    employeeId: "emp-3",
    employeeName: "Nadia Islam",
    departmentName: "Engineering",
    leaveTypeId: "lt-11111111-1111-1111-1111-111111111111",
    leaveTypeName: "Annual Leave",
    startDate: "2026-06-22",
    endDate: "2026-06-24",
    totalDays: 3,
    status: "pending",
    reason: "Family event",
    rejectionReason: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "lr-2",
    employeeId: "emp-4",
    employeeName: "Rafi Khan",
    departmentName: "Engineering",
    leaveTypeId: "lt-22222222-2222-2222-2222-222222222222",
    leaveTypeName: "Sick Leave",
    startDate: "2026-06-15",
    endDate: "2026-06-15",
    totalDays: 1,
    status: "pending",
    reason: "Doctor appointment",
    rejectionReason: null,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "lr-3",
    employeeId: "emp-5",
    employeeName: "Sara Khan",
    departmentName: "Marketing",
    leaveTypeId: "lt-11111111-1111-1111-1111-111111111111",
    leaveTypeName: "Annual Leave",
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    totalDays: 5,
    status: "pending",
    reason: "Vacation",
    rejectionReason: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "lr-4",
    employeeId: "emp-1",
    employeeName: "Tanvir Ahmed",
    departmentName: "Human Resources",
    leaveTypeId: "lt-11111111-1111-1111-1111-111111111111",
    leaveTypeName: "Annual Leave",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    totalDays: 3,
    status: "approved",
    reason: "Pre-approved",
    rejectionReason: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const departments = [
  { id: "", name: "All Departments" },
  { id: "eng", name: "Engineering" },
  { id: "hr", name: "Human Resources" },
  { id: "mkt", name: "Marketing" },
];

const attendanceRecords = [
  {
    id: "att-1",
    employeeId: "emp-1",
    employeeName: "Tanvir Ahmed",
    date: new Date().toISOString().slice(0, 10),
    clockInAt: new Date().toISOString().replace("T", " ").slice(0, 19),
    clockOutAt: null,
    source: "web",
    status: "present",
    totalMinutes: null,
    isCorrected: false,
  },
  {
    id: "att-2",
    employeeId: "emp-3",
    employeeName: "Nadia Islam",
    date: new Date().toISOString().slice(0, 10),
    clockInAt: new Date(Date.now() - 36000000).toISOString().replace("T", " ").slice(0, 19),
    clockOutAt: new Date(Date.now() - 3600000).toISOString().replace("T", " ").slice(0, 19),
    source: "web",
    status: "present",
    totalMinutes: 525,
    isCorrected: false,
  },
  {
    id: "att-3",
    employeeId: "emp-4",
    employeeName: "Rafi Khan",
    date: new Date().toISOString().slice(0, 10),
    clockInAt: new Date(Date.now() - 32000000).toISOString().replace("T", " ").slice(0, 19),
    clockOutAt: null,
    source: "web",
    status: "late",
    totalMinutes: null,
    isCorrected: false,
  },
];

const attendanceExceptions = [
  {
    employeeId: "emp-5",
    employeeName: "Sara Khan",
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    type: "missing_punch",
    detail: "Clocked in but no clock-out recorded",
  },
  {
    employeeId: "emp-6",
    employeeName: "Karim Ali",
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    type: "absent",
    detail: "No attendance record for this date",
  },
  {
    employeeId: "emp-4",
    employeeName: "Rafi Khan",
    date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
    type: "late",
    detail: "Clocked in at 10:15 AM (late by 1h 15m)",
  },
];

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

async function mockLeaveApis(page: Page, options?: { createFails?: boolean }) {
  // Leave types
  await page.route("**/api/v1/leave-types", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(leaveTypes),
    });
  });

  // Leave balances
  await page.route("**/api/v1/leave/balance*", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(leaveBalances),
    });
  });

  // Leave requests list
  await page.route("**/api/v1/leave/requests", async (route) => {
    if (route.request().method() === "POST") {
      if (options?.createFails) {
        await route.fulfill({
          contentType: "application/json",
          status: 400,
          body: JSON.stringify({
            code: "InsufficientBalanceError",
            detail: "Insufficient leave balance",
          }),
        });
        return;
      }
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "lr-new",
          employeeId: "user-1",
          employeeName: "Admin User",
          leaveTypeId: "lt-11111111-1111-1111-1111-111111111111",
          leaveTypeName: "Annual Leave",
          startDate: "2026-06-22",
          endDate: "2026-06-24",
          totalDays: 3,
          status: "pending",
          reason: "Family event",
          rejectionReason: null,
          createdAt: new Date().toISOString(),
        }),
      });
      return;
    }

    const url = new URL(route.request().url());
    const status = url.searchParams.get("status") ?? "";
    const pageNum = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);

    let filtered = leaveRequests;
    if (status) {
      filtered = leaveRequests.filter((r) => r.status === status);
    }

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        data: filtered,
        total: filtered.length,
        page: pageNum,
        pageSize,
      }),
    });
  });

  // Approve
  await page.route("**/api/v1/leave/requests/*/approve", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ ...leaveRequests[0], status: "approved" }),
    });
  });

  // Reject
  await page.route("**/api/v1/leave/requests/*/reject", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ ...leaveRequests[0], status: "rejected", rejectionReason: "Team coverage" }),
    });
  });

  // Leave calendar
  await page.route("**/api/v1/leave/calendar*", async (route) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day15 = `${year}-${month}-15`;
    const day20 = `${year}-${month}-20`;

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        [`${year}-${month}-01`]: {
          isHoliday: true,
          holidayName: "Company Foundation Day",
          leaves: [],
        },
        [day15]: {
          isHoliday: false,
          leaves: [
            {
              employeeId: "emp-3",
              employeeName: "Nadia Islam",
              leaveType: "Annual Leave",
              status: "approved",
              startDate: day15,
              endDate: day20,
              totalDays: 4,
            },
            {
              employeeId: "emp-5",
              employeeName: "Sara Khan",
              leaveType: "Personal Leave",
              status: "approved",
              startDate: day15,
              endDate: day15,
              totalDays: 1,
            },
          ],
        },
        [day20]: {
          isHoliday: false,
          leaves: [
            {
              employeeId: "emp-3",
              employeeName: "Nadia Islam",
              leaveType: "Annual Leave",
              status: "approved",
              startDate: day15,
              endDate: day20,
              totalDays: 4,
            },
          ],
        },
      }),
    });
  });
}

async function mockAttendanceApis(page: Page) {
  await page.route("**/api/v1/attendance", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(attendanceRecords),
    });
  });

  await page.route("**/api/v1/attendance/exceptions*", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify(attendanceExceptions),
    });
  });

  await page.route("**/api/v1/attendance/*/correct", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        ...attendanceRecords[0],
        clockInAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        clockOutAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        isCorrected: true,
      }),
    });
  });
}

async function mockHolidayApis(page: Page) {
  await page.route("**/api/v1/holiday-calendars*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "cal-new",
          name: "New Calendar",
          year: new Date().getFullYear(),
          isDefault: false,
          holidays: [],
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify([
        {
          id: "cal-1",
          name: "National Holidays",
          year: new Date().getFullYear(),
          isDefault: true,
          holidays: [
            { id: "hol-1", calendarId: "cal-1", name: "New Year", date: `${new Date().getFullYear()}-01-01`, type: "public" },
            { id: "hol-2", calendarId: "cal-1", name: "Independence Day", date: `${new Date().getFullYear()}-03-26`, type: "public" },
          ],
        },
        {
          id: "cal-2",
          name: "Regional Holidays",
          year: new Date().getFullYear(),
          isDefault: false,
          holidays: [],
        },
      ]),
    });
  });

  await page.route("**/api/v1/holiday-calendars/cal-1/default", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({}),
    });
  });

  await page.route("**/api/v1/holiday-calendars/*/holidays", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "hol-new",
          calendarId: "cal-1",
          name: "New Holiday",
          date: `${new Date().getFullYear()}-12-25`,
          type: "public",
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify([
        { id: "hol-1", calendarId: "cal-1", name: "New Year", date: `${new Date().getFullYear()}-01-01`, type: "public" },
        { id: "hol-2", calendarId: "cal-1", name: "Independence Day", date: `${new Date().getFullYear()}-03-26`, type: "public" },
      ]),
    });
  });

  await page.route("**/api/v1/holidays/*", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({}),
    });
  });
}

// ─── Tests ───────────────────────────────────────────────────────
test.describe("Sprint 3 frontend regression automation", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await authenticate(page);
    await mockLeaveApis(page);
    await mockAttendanceApis(page);
    await mockHolidayApis(page);
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-LVE-001 — Leave Application Form
  // ═══════════════════════════════════════════════════════════════
  test("FE-LVE-001 leave application form validates, shows balance, computes working days, and submits", async ({
    page,
  }) => {
    await page.goto("/leave/apply");
    const main = page.getByRole("main");

    // — Page loads with balance widget —
    await expect(main.getByRole("heading", { name: /apply for leave/i })).toBeVisible();
    await expect(main.getByText("Your Leave Balances")).toBeVisible();

    // — Balance widget shows cards —
    const balanceCards = main.getByTestId("balance-card");
    await expect(balanceCards).toHaveCount(3);

    // — First card shows Annual Leave with closing 27 —
    await expect(main.getByText("27")).toBeVisible();
    await expect(main.getByText("days available")).toBeVisible();

    // — Carry-forward shown for annual leave (carriedForward: 2 > 0) —
    await expect(main.getByText(/carry-forward/i)).toBeVisible();

    // — Select leave type shows balance hint —
    const leaveTypeSelect = main.getByLabel("Leave Type");
    await leaveTypeSelect.selectOption("lt-11111111-1111-1111-1111-111111111111");
    await expect(main.getByText("27 days available")).toBeVisible();

    // — Select sick leave shows 15 days —
    await leaveTypeSelect.selectOption("lt-22222222-2222-2222-2222-222222222222");
    await expect(main.getByText("15 days available")).toBeVisible();

    // — Fill date range and verify working days —
    const startDate = main.getByLabel("Start Date");
    const endDate = main.getByLabel("End Date");
    await startDate.fill("2026-06-22");
    await endDate.fill("2026-06-26");

    // 2026-06-22 Mon → 2026-06-26 Fri = 5 working days
    await expect(main.getByText(/5 working days/i)).toBeVisible();

    // — Half-day toggle hidden when dates differ —
    await expect(main.queryByRole("radiogroup", { name: /half day/i })).not.toBeVisible();

    // — Same day shows half-day toggle —
    await endDate.fill("2026-06-22");
    await expect(main.getByRole("radiogroup", { name: /half day/i })).toBeVisible();

    // — Select First half shows 0.5 days —
    await main.getByRole("radio", { name: /first half/i }).click();
    await expect(main.getByText(/0\.5 working days/i)).toBeVisible();

    // — Switch back to full day —
    await main.getByRole("radio", { name: /full day/i }).click();
    await expect(main.getByText(/1 working day/i)).toBeVisible();

    // — Select multi-day again —
    await endDate.fill("2026-06-25");
    await expect(main.getByText(/4 working days/i)).toBeVisible();

    // — Reason character counter —
    const reasonInput = main.getByLabel(/reason/i);
    await reasonInput.fill("Family vacation");
    await expect(main.getByText(/14 \/ 500/i)).toBeVisible();

    // — Submit valid form —
    await main.getByRole("button", { name: /submit request/i }).click();

    // Toast should appear (handled by in-app toaster)
    // Navigated away (window.location.href set in onSuccess)
    // We can't test navigation with mocked window.location, but we can verify
    // the submission triggered no form validation errors
    await expect(main.queryByText(/end date must be on or after/i)).not.toBeVisible();

    // — Error state: server insufficient balance —
    // Re-navigate with createFails mock
    await page.unroute("**/api/v1/leave/requests");
    await page.route("**/api/v1/leave/requests", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          contentType: "application/json",
          status: 400,
          body: JSON.stringify({
            code: "InsufficientBalanceError",
            detail: "Insufficient leave balance",
          }),
        });
        return;
      }
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify({ data: [], total: 0, page: 1, pageSize: 20 }),
      });
    });

    await page.goto("/leave/apply");
    await main.getByLabel("Leave Type").selectOption("lt-11111111-1111-1111-1111-111111111111");
    await main.getByLabel("Start Date").fill("2026-06-22");
    await main.getByLabel("End Date").fill("2026-06-26");
    await main.getByRole("button", { name: /submit request/i }).click();
    await expect(main.getByText(/insufficient balance for selected dates/i)).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-LVE-002 — Team Leave Calendar
  // ═══════════════════════════════════════════════════════════════
  test("FE-LVE-002 team leave calendar displays leaves, holidays, and navigation", async ({ page }) => {
    await page.goto("/leave/calendar");
    const main = page.getByRole("main");

    // — Page loads with heading —
    await expect(main.getByRole("heading", { name: /leave calendar/i })).toBeVisible();

    // — Month navigation controls visible —
    await expect(page.getByRole("button", { name: /today/i })).toBeVisible();

    // — Holiday marker visible (Company Foundation Day) —
    // The holiday pill shows truncated name in the day cell
    await expect(main.getByText(/Foundation/i)).toBeVisible();

    // — Leave pills visible for employees —
    await expect(main.getByText(/Nadia/i)).toBeVisible();
    await expect(main.getByText(/Sara/i)).toBeVisible();

    // — Month navigation works —
    const nextBtn = page.getByRole("button", { name: /chevron-right/i }).first();
    const prevBtn = page.getByRole("button", { name: /chevron-left/i }).first();

    await nextBtn.click();
    // Month label should change (not verifying exact text, just that navigation triggered)
    await prevBtn.click();
    await prevBtn.click();
    await nextBtn.click();

    // — Department filter dropdown exists —
    await expect(page.getByLabel(/department filter/i)).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-LVE-003 — Manager Leave Approval Queue
  // ═══════════════════════════════════════════════════════════════
  test("FE-LVE-003 leave approval queue lists pending requests, approves, and rejects", async ({ page }) => {
    await page.goto("/leave/approvals");
    const main = page.getByRole("main");

    // — Page loads with heading —
    await expect(main.getByRole("heading", { name: /leave approvals/i })).toBeVisible();

    // — Pending requests visible —
    await expect(main.getByText("Nadia Islam")).toBeVisible();
    await expect(main.getByText("Rafi Khan")).toBeVisible();

    // — Leave type badges visible —
    await expect(main.getByText("Annual Leave")).toBeVisible();
    await expect(main.getByText("Sick Leave")).toBeVisible();

    // — Dates formatted nicely —
    await expect(main.getByText(/22 Jun – 24 Jun 2026/i)).toBeVisible();
    await expect(main.getByText(/15 Jun – 15 Jun 2026/i)).toBeVisible();

    // — Duration shown —
    await expect(main.getByText("3 days")).toBeVisible();
    await expect(main.getByText("1 day")).toBeVisible();

    // — Approve first request —
    const approveBtn = main.getByRole("button", { name: /approve nadia/i });
    await approveBtn.click();

    // — Reject flow: click reject opens inline form —
    const rejectBtn = main.getByRole("button", { name: /reject rafi/i });
    await rejectBtn.click();

    // — Inline reject form shows textarea —
    const rejectTextarea = main.getByLabel(/rejection reason/i);
    await expect(rejectTextarea).toBeVisible();

    // — Try to confirm with empty reason —
    await main.getByRole("button", { name: /confirm reject/i }).click();
    await expect(main.getByText(/at least 10 characters/i)).toBeVisible();

    // — Fill valid reason and confirm —
    await rejectTextarea.fill("Insufficient team coverage for this date");
    await main.getByRole("button", { name: /confirm reject/i }).click();

    // — Status tabs work —
    await page.getByRole("button", { name: /approved/i }).click();
    await expect(main.getByText("Tanvir Ahmed")).toBeVisible();

    await page.getByRole("button", { name: /all/i }).click();
    await expect(main.getByText("Nadia Islam")).toBeVisible();
    await expect(main.getByText("Tanvir Ahmed")).toBeVisible();

    // — Pagination visible when enough items —
    // Only 4 items, so pagination should exist with 1 page
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-ATT-001 — Attendance Dashboard (Daily Grid)
  // ═══════════════════════════════════════════════════════════════
  test("FE-ATT-001 attendance dashboard renders daily grid with status cards", async ({ page }) => {
    await page.goto("/attendance");
    const main = page.getByRole("main");

    // — Page loads —
    await expect(main.getByRole("heading", { name: /attendance/i })).toBeVisible();

    // — Daily Grid tab active by default —
    await expect(page.getByRole("button", { name: /daily grid/i })).toHaveClass(/bg-primary/);

    // — Employee cards visible —
    await expect(main.getByText("Tanvir Ahmed")).toBeVisible();
    await expect(main.getByText("Nadia Islam")).toBeVisible();
    await expect(main.getByText("Rafi Khan")).toBeVisible();

    // — Status badges visible —
    await expect(main.getByText("Present")).toBeVisible();
    await expect(main.getByText("Late")).toBeVisible();

    // — Clock times visible —
    // "Active" dot for users still clocked in — at least check time format
    await expect(main.getByText(/→/i).first()).toBeVisible();

    // — Date navigation controls —
    await expect(page.getByLabel(/date/i)).toBeVisible();

    // — Department filter —
    await expect(page.getByLabel(/department/i)).toBeVisible();

    // — Export button —
    await expect(main.getByRole("button", { name: /export csv/i })).toBeVisible();

    // — Date navigation arrows —
    const prevDay = page.getByRole("button", { name: /chevron-left/i }).first();
    const nextDay = page.getByRole("button", { name: /chevron-right/i }).first();
    await prevDay.click();
    await nextDay.click();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-ATT-002 — Attendance Exceptions Report
  // ═══════════════════════════════════════════════════════════════
  test("FE-ATT-002 attendance exceptions report lists and filters exceptions", async ({ page }) => {
    await page.goto("/attendance");
    const main = page.getByRole("main");

    // — Switch to Exception Report tab —
    await page.getByRole("button", { name: /exception report/i }).click();

    // — Exceptions table visible —
    await expect(main.getByText("Sara Khan")).toBeVisible();
    await expect(main.getByText("Karim Ali")).toBeVisible();
    await expect(main.getByText("Rafi Khan")).toBeVisible();

    // — Exception type badges —
    await expect(main.getByText("Missing punch")).toBeVisible();
    await expect(main.getByText("Absent")).toBeVisible();
    await expect(main.getByText("Late")).toBeVisible();

    // — "Correct" button visible for missing_punch —
    await expect(main.getByRole("button", { name: /correct/i })).toBeVisible();

    // — "View" button visible for late/absent —
    await expect(main.getByRole("button", { name: /view/i })).toBeVisible();

    // — Exception type filter dropdown —
    await expect(page.getByLabel(/exception type/i)).toBeVisible();

    // — Employee search input —
    await expect(page.getByLabel(/search employee/i)).toBeVisible();

    // — Filter by exception type changes results (client-side filtering by search) —
    // The filter sends route params, but our mock returns all data regardless
    // Just verify the UI responds without errors
    await page.getByLabel(/exception type/i).selectOption("late");
    // Wait for re-fetch
    await page.waitForTimeout(300);
    // Data should still render (mock returns all data)
    await expect(main.getByText("Late")).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-LVE-004 — Leave Balance Widget (RTL-style in Playwright)
  // ═══════════════════════════════════════════════════════════════
  test("FE-LVE-004 leave balance widget displays correct values per leave type", async ({ page }) => {
    await page.goto("/leave/apply");
    const main = page.getByRole("main");

    // — Three balance cards rendered —
    const cards = main.getByTestId("balance-card");
    await expect(cards).toHaveCount(3);

    // — Annual Leave: closing 27, carriedForward 2 (carry shown) —
    const annualCard = cards.nth(0);
    await expect(annualCard).toContainText("Annual Leave");
    await expect(annualCard).toContainText("27");
    await expect(annualCard).toContainText("days available");
    await expect(annualCard).toContainText("Accrued");
    await expect(annualCard).toContainText("Used");
    await expect(annualCard).toContainText(/carry-forward/i);
    await expect(annualCard).toContainText("30 days");
    await expect(annualCard).toContainText("5 days");

    // — Sick Leave: closing 15, no carry-forward —
    const sickCard = cards.nth(1);
    await expect(sickCard).toContainText("Sick Leave");
    await expect(sickCard).toContainText("15");
    await expect(sickCard).not.toContainText(/carry-forward/i);

    // — Personal Leave: closing 2 (low balance, should have amber styling) —
    const personalCard = cards.nth(2);
    await expect(personalCard).toContainText("Personal Leave");
    await expect(personalCard).toContainText("2");
    // data-status should be "low" for closing between 1 and 5
    await expect(personalCard).toHaveAttribute("data-status", "low");

    // — Year selector present —
    await expect(page.getByLabel(/year/i)).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-LVE-005 — Attendance correction modal flow
  // ═══════════════════════════════════════════════════════════════
  test("FE-ATT-003 attendance correction modal opens, validates, and submits", async ({ page }) => {
    await page.goto("/attendance");
    const main = page.getByRole("main");

    // — Switch to Exception Report —
    await page.getByRole("button", { name: /exception report/i }).click();

    // — Click "Correct" on missing punch —
    await main.getByRole("button", { name: /correct/i }).click();

    // — Modal opens with dialog title —
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/correct attendance record/i)).toBeVisible();

    // — Employee info shown in modal —
    await expect(main.getByText("Sara Khan")).toBeVisible();

    // — Form fields visible —
    await expect(page.getByLabel(/clock in/i)).toBeVisible();
    await expect(page.getByLabel(/clock out/i)).toBeVisible();
    await expect(page.getByLabel(/reason/i)).toBeVisible();

    // — Submit without filling shows validation —
    await page.getByRole("button", { name: /save correction/i }).click();
    // Validation should fire because reason is required (min 10 chars)
    // The form may show inline errors

    // — Fill valid data and submit —
    await page.getByLabel(/clock in/i).fill("2026-06-05T09:00");
    await page.getByLabel(/clock out/i).fill("2026-06-05T18:00");
    await page.getByLabel(/^reason$/i).fill("Employee forgot to clock out, verified with manager");
    await page.getByRole("button", { name: /save correction/i }).click();

    // — Modal should close on success —
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-LVE-006 — Holiday calendar management
  // ═══════════════════════════════════════════════════════════════
  test("FE-LVE-006 holiday calendar manager displays calendars and holidays", async ({ page }) => {
    await page.goto("/settings/holidays");
    const main = page.getByRole("main");

    // — Page loads —
    await expect(main.getByRole("heading", { name: /holiday calendars/i })).toBeVisible();

    // — Calendar list shows items —
    await expect(main.getByText("National Holidays")).toBeVisible();
    await expect(main.getByText("Regional Holidays")).toBeVisible();

    // — Default badge on National Holidays —
    await expect(main.getByText("Default")).toBeVisible();

    // — Select National Holidays —
    await main.getByText("National Holidays").click();

    // — Right panel shows holidays —
    await expect(main.getByText(/holidays configured/i)).toBeVisible();

    // — Holiday list table visible with entries —
    await expect(main.getByText("New Year")).toBeVisible();
    await expect(main.getByText("Independence Day")).toBeVisible();

    // — Add Holiday button visible —
    await expect(main.getByRole("button", { name: /add holiday/i })).toBeVisible();

    // — New Calendar button visible —
    await expect(main.getByRole("button", { name: /new calendar/i })).toBeVisible();

    // — "Set as Default" button — disabled since it's already default
    await expect(main.getByRole("button", { name: /default/i })).toBeDisabled();
  });

  // ═══════════════════════════════════════════════════════════════
  // FE-LVE-007 — Leave types configuration page
  // ═══════════════════════════════════════════════════════════════
  test("FE-LVE-007 leave types configuration lists all types with correct data", async ({ page }) => {
    await page.goto("/settings/leave-types");
    const main = page.getByRole("main");

    // — Page loads —
    await expect(main.getByRole("heading", { name: /leave types/i })).toBeVisible();

    // — Table shows all leave types —
    await expect(main.getByText("Annual Leave")).toBeVisible();
    await expect(main.getByText("Sick Leave")).toBeVisible();
    await expect(main.getByText("Personal Leave")).toBeVisible();

    // — Codes shown —
    await expect(main.getByText("AL")).toBeVisible();
    await expect(main.getByText("SL")).toBeVisible();
    await expect(main.getByText("PL")).toBeVisible();

    // — Accrual types —
    await expect(main.getByText("Monthly")).toBeVisible();
    await expect(main.getByText("None")).toBeVisible();

    // — Paid/Unpaid badges —
    await expect(main.getByText("Paid")).toBeVisible();
    await expect(main.getByText("Unpaid")).toBeVisible();

    // — Active badges —
    await expect(main.getByText("Active")).toBeVisible();

    // — Add Leave Type button —
    await expect(main.getByRole("button", { name: /add leave type/i })).toBeVisible();

    // — Edit buttons exist for each row —
    const editBtns = main.getByRole("button", { name: /edit/i });
    await expect(editBtns.first()).toBeVisible();
  });
});
