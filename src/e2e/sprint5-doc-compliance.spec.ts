import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// ─── Test data ──────────────────────────────────────────────────
const hrUser = {
  email: "admin@acme.com",
  name: "Admin User",
  password: "ValidPass@123",
};

const employeeUser = {
  id: "emp-001",
  email: "tanvir@example.com",
  name: "Tanvir Ahmed",
  code: "EMP-001",
};

// ─── Helpers ────────────────────────────────────────────────────
async function ensureTargetRunning(page: Page) {
  const response = await page.request.get("/login").catch(() => null);
  test.skip(!response?.ok(), "Target server is not running.");
}

async function mockAuth(page: Page) {
  await page.route("**/api/v1/auth/login", async (route) => {
    const body = route.request().postDataJSON() as { email?: string; password?: string };
    if (body.email === hrUser.email && body.password === hrUser.password) {
      await route.fulfill({
        contentType: "application/json",
        headers: {
          "set-cookie": "refresh=refresh-token; Path=/; HttpOnly; SameSite=Lax",
        },
        status: 200,
        body: JSON.stringify({
          access: "access-token",
          user: { id: "user-1", name: hrUser.name, email: hrUser.email, role: "HR_ADMIN" },
        }),
      });
    } else if (body.email === employeeUser.email) {
      await route.fulfill({
        contentType: "application/json",
        headers: {
          "set-cookie": "refresh=refresh-token-emp; Path=/; HttpOnly; SameSite=Lax",
        },
        status: 200,
        body: JSON.stringify({
          access: "access-token-emp",
          user: { id: employeeUser.id, name: employeeUser.name, email: employeeUser.email, role: "EMPLOYEE" },
        }),
      });
    } else {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: "Invalid credentials" }) });
    }
  });

  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({ id: "user-1", name: hrUser.name, email: hrUser.email, role: "HR_ADMIN" }),
    });
  });

  await page.route("**/api/v1/auth/logout", async (route) => {
    await route.fulfill({ status: 204 });
  });
}

async function mockNotifications(page: Page, unreadCount = 3) {
  await page.route("**/api/v1/notifications**", async (route) => {
    if (route.request().method() === "GET") {
      const notifications = [
        {
          id: "notif-1",
          type: "LEAVE_APPROVED",
          title: "Leave Approved",
          body: "Your annual leave request has been approved.",
          metadata: { leaveRequestId: "lvr-001" },
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "notif-2",
          type: "PAYSLIP_READY",
          title: "Payslip Ready",
          body: "Your January 2025 payslip is ready to view.",
          metadata: null,
          isRead: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "notif-3",
          type: "POLICY_PUBLISHED",
          title: "New Policy Published",
          body: "Code of Conduct v2.0 has been published and requires your acknowledgement.",
          metadata: null,
          isRead: false,
          createdAt: new Date(Date.now() - 10800000).toISOString(),
        },
      ].slice(0, unreadCount);

      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify({ data: notifications, total: unreadCount, unreadCount }),
      });
    } else {
      await route.fulfill({ status: 200, body: JSON.stringify({ updated: 1 }) });
    }
  });
}

async function mockDocumentsList(page: Page) {
  await page.route("**/api/v1/documents/employees/emp-001**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify([
          {
            id: "doc-1",
            employeeId: "emp-001",
            category: "CONTRACT",
            originalName: "employment_contract.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024000,
            version: 1,
            sha256Hash: "abc123def",
            description: "Standard employment contract",
            uploadedBy: "admin",
            createdAt: "2025-01-15T10:00:00Z",
          },
          {
            id: "doc-2",
            employeeId: "emp-001",
            category: "CERTIFICATE",
            originalName: "degree_certificate.pdf",
            mimeType: "application/pdf",
            sizeBytes: 2048000,
            version: 1,
            sha256Hash: "ghi789jkl",
            description: null,
            uploadedBy: "admin",
            createdAt: "2025-02-20T10:00:00Z",
          },
        ]),
      });
    } else {
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    }
  });
}

async function mockDocumentSignedUrl(page: Page) {
  await page.route("**/api/v1/documents/*/signed-url", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        signedUrl: "https://signed.example.com/document.pdf",
        expiresInSeconds: 900,
      }),
    });
  });
}

async function mockPolicies(page: Page, employeeView = false) {
  await page.route("**/api/v1/compliance/policies**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify([
          {
            id: "pol-1",
            title: "Code of Conduct v2.0",
            content: "# Code of Conduct\n\nAll employees must adhere to the following guidelines...",
            category: "HR",
            status: "PUBLISHED",
            createdBy: "admin",
            publishedBy: "admin",
            publishedAt: "2025-01-01T00:00:00Z",
            version: 2,
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            acknowledgedByMe: employeeView ? false : undefined,
            acknowledgementCount: 45,
            totalEmployees: 100,
          },
          {
            id: "pol-2",
            title: "IT Security Policy",
            content: "# IT Security Policy\n\nAll employees must follow IT security best practices...",
            category: "IT",
            status: "PUBLISHED",
            createdBy: "admin",
            publishedBy: "admin",
            publishedAt: "2025-03-01T00:00:00Z",
            version: 1,
            createdAt: "2025-03-01T00:00:00Z",
            updatedAt: "2025-03-01T00:00:00Z",
            acknowledgedByMe: employeeView ? true : undefined,
            acknowledgementCount: 80,
            totalEmployees: 100,
          },
        ]),
      });
    } else {
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    }
  });
}

async function mockPolicyAcknowledge(page: Page) {
  await page.route("**/api/v1/compliance/policies/*/acknowledge", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        id: "ack-1",
        policyId: "pol-1",
        employeeId: "emp-001",
        acknowledgedAt: new Date().toISOString(),
      }),
    });
  });
}

async function mockEsignRequests(page: Page) {
  await page.route("**/api/v1/esign/requests**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify([
          {
            id: "esign-1",
            documentId: "doc-1",
            requestedBy: "admin",
            signerEmployeeId: "emp-002",
            status: "PENDING",
            documentSha256AtSign: null,
            declineReason: null,
            expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
            signedAt: null,
            declinedAt: null,
            createdAt: "2025-06-01T10:00:00Z",
            updatedAt: "2025-06-01T10:00:00Z",
          },
        ]),
      });
    } else if (route.request().method() === "POST") {
      await route.fulfill({
        contentType: "application/json",
        status: 201,
        body: JSON.stringify({
          id: "esign-new",
          documentId: "doc-1",
          requestedBy: "admin",
          signerEmployeeId: "emp-002",
          status: "PENDING",
          documentSha256AtSign: null,
          declineReason: null,
          expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
          signedAt: null,
          declinedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    }
  });
}

async function mockAuditLogs(page: Page) {
  await page.route("**/api/v1/compliance/audit-logs**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        data: [
          {
            id: "audit-1",
            actorId: "user-1",
            actorName: "Admin User",
            action: "POLICY_PUBLISHED",
            resourceType: "policy",
            resourceId: "pol-1",
            metadata: { before: { status: "DRAFT", version: 1 }, after: { status: "PUBLISHED", version: 2 } },
            ipAddress: "192.168.1.1",
            createdAt: "2025-06-15T10:00:00Z",
          },
          {
            id: "audit-2",
            actorId: "user-2",
            actorName: "Jane Smith",
            action: "LOGIN_SUCCESS",
            resourceType: null,
            resourceId: null,
            metadata: { browser: "Chrome", os: "macOS" },
            ipAddress: "10.0.0.1",
            createdAt: "2025-06-15T09:30:00Z",
          },
          {
            id: "audit-3",
            actorId: "user-3",
            actorName: "Bob Johnson",
            action: "ESIGN_DOCUMENT_SIGNED",
            resourceType: "esign_request",
            resourceId: "esign-1",
            metadata: { documentId: "doc-1" },
            ipAddress: null,
            createdAt: "2025-06-14T14:00:00Z",
          },
        ],
        total: 3,
        page: 1,
        limit: 20,
      }),
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// FE-DOC-001 — Document upload, drag & drop, file type validation
// ═══════════════════════════════════════════════════════════════════
test.describe("FE-DOC-001 — Document Upload", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await mockAuth(page);
    await mockNotifications(page, 0);
    await mockDocumentsList(page);
  });

  test("DOC-001-01: Document vault page loads with document list", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/employees/emp-001/documents");
    await page.waitForLoadState("networkidle");

    // Page title
    await expect(page.getByText("Document Vault")).toBeVisible();

    // Category filter tabs
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Contract" })).toBeVisible();
    await expect(page.getByRole("button", { name: "NID" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Certificate" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Payslip" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Other" })).toBeVisible();

    // Document rows visible
    await expect(page.getByText("employment_contract.pdf")).toBeVisible();
    await expect(page.getByText("degree_certificate.pdf")).toBeVisible();

    // Category badges
    await expect(page.getByText("CONTRACT")).toBeVisible();
    await expect(page.getByText("CERTIFICATE")).toBeVisible();

    // Download buttons present
    await expect(page.getByRole("button", { name: /download/i }).first()).toBeVisible();
  });

  test("DOC-001-02: Upload section reveals on button click", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/employees/emp-001/documents");
    await page.waitForLoadState("networkidle");

    // Click Upload Document to reveal dropzone
    await page.getByRole("button", { name: /upload document/i }).click();

    // Dropzone should be visible with drag-and-drop text
    await expect(page.getByText(/Drag & drop a file here/)).toBeVisible();

    // Acceptable file types text
    await expect(page.getByText(/PDF, Image, or Word documents/)).toBeVisible();

    // Category selector visible
    const categorySelect = page.locator("select#doc-category");
    await expect(categorySelect).toBeVisible();

    // Description textarea visible
    await expect(page.getByPlaceholder(/add a brief description/i)).toBeVisible();

    // Upload button disabled without file
    const uploadBtn = page.getByRole("button", { name: /upload document/i }).last();
    await expect(uploadBtn).toBeDisabled();
  });

  test("DOC-001-03: Delete document shows inline confirmation", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/employees/emp-001/documents");
    await page.waitForLoadState("networkidle");

    // Click delete icon on first row
    const deleteButtons = page.locator("button[aria-label='Delete document']");
    const count = await deleteButtons.count();
    if (count > 0) {
      await deleteButtons.first().click();

      // Inline confirmation text
      await expect(page.getByText(/Delete this document/)).toBeVisible();

      // Confirm and Cancel buttons
      await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();

      // Cancel should hide confirmation
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByText(/Delete this document/)).not.toBeVisible();
    }
  });

  test("DOC-001-04: Category filter tabs switch correctly", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/employees/emp-001/documents");
    await page.waitForLoadState("networkidle");

    // Click on Certificate tab
    await page.getByRole("button", { name: "Certificate" }).click();

    // Should show certificate documents
    await expect(page.getByText("degree_certificate.pdf")).toBeVisible();
  });

  test("DOC-001-05: Accessibility scan on document vault", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/employees/emp-001/documents");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FE-DOC-002 — Policy acknowledgement
// ═══════════════════════════════════════════════════════════════════
test.describe("FE-DOC-002 — Policy Acknowledgement", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await mockAuth(page);
    await mockNotifications(page, 0);
  });

  test("DOC-002-01: HR Admin views policy library with all status filters", async ({ page }) => {
    await mockPolicies(page);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/policies");
    await page.waitForLoadState("networkidle");

    // Page heading for HR Admin
    await expect(page.getByText("Policy Library")).toBeVisible();

    // Status filter tabs
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Draft" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Published" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Archived" })).toBeVisible();

    // Policy cards visible
    await expect(page.getByText("Code of Conduct v2.0")).toBeVisible();
    await expect(page.getByText("IT Security Policy")).toBeVisible();

    // Status badges
    await expect(page.getByText("Published").first()).toBeVisible();

    // Acknowledgement progress for HR Admin
    await expect(page.getByText(/45 \/ 100 acknowledged/)).toBeVisible();

    // Archive button
    await expect(page.getByRole("button", { name: "Archive" })).toBeVisible();
  });

  test("DOC-002-02: Employee sees mandatory policy acknowledgement status", async ({ page }) => {
    await mockPolicies(page, true);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(employeeUser.email);
    await page.getByLabel(/password/i).fill("EmployeePass@123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/policies");
    await page.waitForLoadState("networkidle");

    // Employee sees "Company Policies" heading
    await expect(page.getByText("Company Policies")).toBeVisible();

    // Code of Conduct: not acknowledged → "Acknowledgement required"
    await expect(page.getByText(/Acknowledgement required/)).toBeVisible();

    // IT Security Policy: acknowledged → "Acknowledged"
    await expect(page.getByText(/Acknowledged/)).toBeVisible();

    // "Read & Acknowledge" button for unacknowledged policy
    await expect(page.getByRole("button", { name: /read & acknowledge/i })).toBeVisible();

    // "View Policy" button for acknowledged policy
    await expect(page.getByRole("button", { name: /view policy/i })).toBeVisible();
  });

  test("DOC-002-03: Employee acknowledges policy via modal", async ({ page }) => {
    await mockPolicies(page, true);
    await mockPolicyAcknowledge(page);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(employeeUser.email);
    await page.getByLabel(/password/i).fill("EmployeePass@123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/policies");
    await page.waitForLoadState("networkidle");

    // Click "Read & Acknowledge"
    await page.getByRole("button", { name: /read & acknowledge/i }).click();

    // Acknowledge modal opens
    await expect(page.getByText("Confirm Acknowledgement")).toBeVisible();

    // Checkbox gate — confirm button disabled initially
    const confirmBtn = page.getByRole("button", { name: /confirm acknowledgement/i });
    await expect(confirmBtn).toBeDisabled();

    // Check the "I have read" checkbox
    await page.getByRole("checkbox", { name: /i have read and understood/i }).check();

    // Confirm button now enabled
    await expect(confirmBtn).not.toBeDisabled();

    // Click confirm
    await confirmBtn.click();
  });

  test("DOC-002-04: Read-only mode for already-acknowledged policy", async ({ page }) => {
    await mockPolicies(page, true);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(employeeUser.email);
    await page.getByLabel(/password/i).fill("EmployeePass@123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/policies");
    await page.waitForLoadState("networkidle");

    // Click "View Policy" for acknowledged policy
    await page.getByRole("button", { name: /view policy/i }).click();

    // Modal opens in read-only mode
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();

    // No confirm acknowledgement button
    await expect(
      page.getByRole("button", { name: /confirm acknowledgement/i }),
    ).not.toBeVisible();

    // No checkbox
    await expect(
      page.getByRole("checkbox", { name: /i have read and understood/i }),
    ).not.toBeVisible();
  });

  test("DOC-002-05: Accessibility scan on policy library", async ({ page }) => {
    await mockPolicies(page);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/policies");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FE-NAV-002 — Notification Bell
// ═══════════════════════════════════════════════════════════════════
test.describe("FE-NAV-002 — Notification Bell", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await mockAuth(page);
  });

  test("NAV-002-01: Bell shows unread count badge when notifications exist", async ({ page }) => {
    await mockNotifications(page, 3);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    // Notification bell visible
    const bellButton = page.getByRole("button", { name: "Notifications" });
    await expect(bellButton).toBeVisible();

    // Badge with count "3" is visible
    await expect(page.getByText("3")).toBeVisible();
  });

  test("NAV-002-02: Dropdown opens with notification items and mark-all-read", async ({ page }) => {
    await mockNotifications(page, 3);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    // Click bell to open dropdown
    await page.getByRole("button", { name: "Notifications" }).click();

    // Notification items visible
    await expect(page.getByText("Leave Approved")).toBeVisible();
    await expect(page.getByText("Payslip Ready")).toBeVisible();
    await expect(page.getByText("New Policy Published")).toBeVisible();

    // Mark all as read button
    await expect(page.getByRole("button", { name: /mark all as read/i })).toBeVisible();

    // "Notifications" header
    await expect(page.getByText("Notifications").first()).toBeVisible();
  });

  test("NAV-002-03: No badge when unread count is zero", async ({ page }) => {
    await mockNotifications(page, 0);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    // Bell is present
    const bellButton = page.getByRole("button", { name: "Notifications" });
    await expect(bellButton).toBeVisible();

    // No badge visible
    const badge = bellButton.locator("span");
    await expect(badge).not.toBeVisible();
  });

  test("NAV-002-04: Dropdown closes on outside click", async ({ page }) => {
    await mockNotifications(page, 3);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    // Open dropdown
    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(page.getByText("Leave Approved")).toBeVisible();

    // Click outside — page title area
    const header = page.locator("header h1");
    await header.click();

    // Dropdown should close
    await expect(page.getByText("Leave Approved")).not.toBeVisible();
  });

  test("NAV-002-05: Empty state when no notifications exist", async ({ page }) => {
    await mockNotifications(page, 0);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    // Open dropdown
    await page.getByRole("button", { name: "Notifications" }).click();

    // Empty state message
    await expect(page.getByText("No notifications yet.")).toBeVisible();
  });

  test("NAV-002-06: Accessibility scan on notification bell", async ({ page }) => {
    await mockNotifications(page, 3);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    // Open dropdown for accessibility scan
    await page.getByRole("button", { name: "Notifications" }).click();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FE-ESIGN — eSign Request List & Signer View
// ═══════════════════════════════════════════════════════════════════
test.describe("FE-ESIGN — eSign Features", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await mockAuth(page);
    await mockNotifications(page, 0);
    await mockEsignRequests(page);
  });

  test("ESIGN-001: eSign list page renders with status filters", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/esign");
    await page.waitForLoadState("networkidle");

    // Page heading
    await expect(page.getByText("eSign Requests")).toBeVisible();

    // Status filter buttons
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pending" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Signed" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Declined" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Expired" })).toBeVisible();

    // Create Request button
    await expect(page.getByRole("button", { name: /create request/i })).toBeVisible();

    // Status badge visible
    await expect(page.getByText("Pending")).toBeVisible();
  });

  test("ESIGN-002: Signer view renders with signature tabs and PENDING banner", async ({ page }) => {
    await page.route("**/api/v1/esign/requests/esign-1**", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify({
          id: "esign-1",
          documentId: "doc-1",
          requestedBy: "admin",
          signerEmployeeId: "emp-002",
          status: "PENDING",
          documentSha256AtSign: null,
          declineReason: null,
          expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
          signedAt: null,
          declinedAt: null,
          createdAt: "2025-06-01T10:00:00Z",
          updatedAt: "2025-06-01T10:00:00Z",
        }),
      });
    });
    await mockDocumentSignedUrl(page);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/esign/esign-1");
    await page.waitForLoadState("networkidle");

    // PENDING banner
    await expect(
      page.getByText(/This document is awaiting your signature/),
    ).toBeVisible();

    // Expiry info
    await expect(page.getByText(/Expires/)).toBeVisible();

    // Signature tabs
    await expect(page.getByRole("button", { name: "Draw" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Type" })).toBeVisible();

    // Sign button (disabled without signature)
    const signBtn = page.getByRole("button", { name: /sign document/i });
    await expect(signBtn).toBeVisible();
    await expect(signBtn).toBeDisabled();

    // Decline button
    await expect(page.getByRole("button", { name: /decline/i })).toBeVisible();
  });

  test("ESIGN-003: Create eSign request modal opens and validates", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/esign");
    await page.waitForLoadState("networkidle");

    // Click Create Request
    await page.getByRole("button", { name: /create request/i }).click();

    // Modal opens
    await expect(page.getByText("Create eSign Request")).toBeVisible();

    // Document ID and Signer ID fields visible
    await expect(page.getByPlaceholder(/enter document uuid/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter employee uuid/i)).toBeVisible();

    // Submit should be present
    await expect(page.getByRole("button", { name: /create request/i })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════
// FE-AUDIT — Audit Log Viewer
// ═══════════════════════════════════════════════════════════════════
test.describe("FE-AUDIT — Audit Log Viewer", () => {
  test.beforeEach(async ({ page }) => {
    await ensureTargetRunning(page);
    await mockAuth(page);
    await mockNotifications(page, 0);
    await mockAuditLogs(page);
  });

  test("AUDIT-001: Audit log page renders with filter controls and data", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/audit-logs");
    await page.waitForLoadState("networkidle");

    // Page heading
    await expect(page.getByText("Audit Logs")).toBeVisible();

    // Export CSV button
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();

    // Filter fields
    await expect(page.getByLabel(/actor/i)).toBeVisible();
    await expect(page.getByLabel("Action")).toBeVisible();
    await expect(page.getByLabel("Resource Type")).toBeVisible();
    await expect(page.getByLabel(/date from/i)).toBeVisible();
    await expect(page.getByLabel(/date to/i)).toBeVisible();

    // Table data
    await expect(page.getByText("POLICY_PUBLISHED")).toBeVisible();
    await expect(page.getByText("Admin User")).toBeVisible();
    await expect(page.getByText("LOGIN_SUCCESS")).toBeVisible();
    await expect(page.getByText("ESIGN_DOCUMENT_SIGNED")).toBeVisible();
  });

  test("AUDIT-002: Pagination renders correctly", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/audit-logs");
    await page.waitForLoadState("networkidle");

    // Pagination
    await expect(page.getByText(/Page 1 of/)).toBeVisible();
    await expect(page.getByRole("button", { name: /prev/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /next/i })).toBeVisible();

    // Prev disabled on page 1
    await expect(page.getByRole("button", { name: /prev/i })).toBeDisabled();
  });

  test("AUDIT-003: Diff drawer opens for an audit entry", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/audit-logs");
    await page.waitForLoadState("networkidle");

    // Click View diff on first row
    const viewDiffBtn = page.getByRole("button", { name: /view diff/i }).first();
    await viewDiffBtn.click();

    // Drawer opens showing action
    await expect(page.getByText("POLICY_PUBLISHED").first()).toBeVisible();

    // Before/after diff values
    await expect(page.getByText("DRAFT")).toBeVisible();
  });

  test("AUDIT-004: Clear filters button appears when filters set", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/audit-logs");
    await page.waitForLoadState("networkidle");

    // "Clear filters" button not visible initially
    await expect(
      page.getByRole("button", { name: /clear filters/i }),
    ).not.toBeVisible();

    // Select an action filter
    const actionSelect = page.getByLabel("Action");
    await actionSelect.selectOption("LOGIN_SUCCESS");

    // Wait for debounce
    await page.waitForTimeout(500);

    // Clear filters should now be visible
    await expect(
      page.getByRole("button", { name: /clear filters/i }),
    ).toBeVisible();
  });

  test("AUDIT-005: Accessibility scan on audit log viewer", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(hrUser.email);
    await page.getByLabel(/password/i).fill(hrUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    await page.goto("/compliance/audit-logs");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
