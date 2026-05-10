# HR Management System — Frontend Regression Test Case Suite

**Document ID:** HRMS-FE-RTC-001  
**Version:** 1.0  
**Prepared by:** QA Team  
**Review status:** Approved  
**Frontend Stack:** Next.js 14 (App Router) · React · TypeScript · TanStack Query · Zustand · React Hook Form · Zod · Tailwind CSS · shadcn/ui  
**Test tools:** Playwright (E2E) · Vitest + React Testing Library (component) · axe-core (accessibility)  
**Phases covered:** V1 MVP + V2 Full Release

---

## Document conventions

| Field | Description |
|---|---|
| **Test Case ID** | Module prefix + sequential number (e.g., `FE-AUTH-001`) |
| **Priority** | `P0` = Blocker · `P1` = Critical · `P2` = Major · `P3` = Minor |
| **Severity** | `Critical` · `High` · `Medium` · `Low` |
| **Type** | `Functional` · `UI/UX` · `Accessibility` · `Boundary` · `Negative` · `Integration` · `Responsive` · `Performance` |
| **Tool** | `Playwright` (E2E browser) · `RTL` (React Testing Library component) · `Vitest` (unit) |
| **Phase** | `V1` · `V2` · `Both` |
| **Viewport** | `Desktop` (1280×800) · `Tablet` (768×1024) · `Mobile` (375×812) · `All` |

---

## Module 1 — Authentication Pages

### FE-AUTH-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-AUTH-001 |
| **Title** | Login form — successful login redirects to dashboard |
| **Module** | Authentication |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Valid user account: `admin@acme.com` / `ValidPass@123`
- User is on the `/login` page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | Login page renders; email and password fields visible; "Sign In" button visible |
| 2 | Click "Sign In" without filling any fields | Form does not submit; inline validation errors appear: "Email is required" under email field, "Password is required" under password field |
| 3 | Type `not-an-email` into email field and click Sign In | Inline error: "Please enter a valid email address" |
| 4 | Type `admin@acme.com` into email field | Error clears immediately on valid input |
| 5 | Type `ValidPass@123` into password field | Password displayed as masked dots |
| 6 | Click the eye icon next to password field | Password text revealed; icon toggles to hide |
| 7 | Click "Sign In" with valid credentials | Loading spinner appears on button; button disabled during request |
| 8 | Request completes | Redirected to `/dashboard`; URL changes; sidebar and top nav render |
| 9 | Inspect browser memory (not localStorage) | Access token stored in memory only; NOT in `localStorage` or `sessionStorage` |
| 10 | Inspect cookies | `refresh_token` cookie present with `HttpOnly` flag (not accessible via `document.cookie`) |

**Expected Result:** Form validates inline; successful login redirects to dashboard; token in memory; refresh cookie set.

**Postconditions:**
- User authenticated; dashboard visible

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-AUTH-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-AUTH-002 |
| **Title** | Login form — invalid credentials shows error without revealing which field is wrong |
| **Module** | Authentication |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Negative |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- User on `/login` page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `admin@acme.com` and wrong password `WrongPass`; click Sign In | HTTP 401 received |
| 2 | Inspect error display | Generic toast or inline banner: "Invalid email or password" — does NOT say "wrong password" or "email not found" |
| 3 | Verify form state | Email and password fields retain their values (user can correct without re-typing email) |
| 4 | Verify button state | Sign In button re-enabled after error |
| 5 | Enter correct password and click Sign In | Login succeeds; redirected to dashboard |

**Expected Result:** Generic error message shown; fields retain values; button re-enabled; no hint about which credential is wrong.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-AUTH-003

| Field | Value |
|---|---|
| **Test Case ID** | FE-AUTH-003 |
| **Title** | Unauthenticated user redirected to login from any protected route |
| **Module** | Authentication |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- User is NOT logged in (no valid tokens in memory/cookies)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate directly to `/employees` | Redirected to `/login?redirect=/employees` |
| 2 | Navigate directly to `/payroll/cycles` | Redirected to `/login?redirect=/payroll/cycles` |
| 3 | Navigate directly to `/dashboard` | Redirected to `/login` |
| 4 | Log in successfully | Redirected back to the originally intended route (`/employees`) — not always to `/dashboard` |
| 5 | After login, navigate to `/login` directly | Redirected to `/dashboard` — logged-in users cannot view the login page |

**Expected Result:** All protected routes redirect to login; post-login redirect to original destination; logged-in users redirected away from `/login`.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-AUTH-004

| Field | Value |
|---|---|
| **Test Case ID** | FE-AUTH-004 |
| **Title** | Session expiry — user redirected to login with session timeout message |
| **Module** | Authentication |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- User is logged in
- Access token mock-expired (15 min elapsed or token manually expired)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | User is on `/employees` page with expired access token | — |
| 2 | TanStack Query fires `GET /employees` | 401 received from API |
| 3 | Axios interceptor detects 401; attempts `POST /auth/refresh` using refresh cookie | New access token obtained if refresh token still valid |
| 4 | Original `GET /employees` retried with new token | Page content loads normally — user sees no interruption |
| 5 | Simulate expired refresh token: both tokens invalid; `POST /auth/refresh` returns 401 | User redirected to `/login?reason=session_expired` |
| 6 | On login page | Toast or banner: "Your session has expired. Please sign in again." |
| 7 | Log in again | Original page content resumes |

**Expected Result:** Transparent token refresh when only access token expired; login redirect with message when both tokens expired.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-AUTH-005

| Field | Value |
|---|---|
| **Test Case ID** | FE-AUTH-005 |
| **Title** | Forgot password flow — form, email confirmation, and reset page |
| **Module** | Authentication |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Valid user `admin@acme.com` exists
- Mailhog running for email capture

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | On `/login` page; click "Forgot password?" link | Navigated to `/forgot-password` |
| 2 | Submit form with empty email | Validation error: "Email is required" |
| 3 | Submit with `notanemail` | Validation error: "Please enter a valid email address" |
| 4 | Submit with `admin@acme.com` | Success message displayed: "If an account exists for this email, a reset link has been sent." — same message for non-existent emails (no enumeration) |
| 5 | Check Mailhog; open received email | Email contains reset link with token |
| 6 | Click reset link | Navigated to `/reset-password?token=<token>` |
| 7 | Submit new password form with mismatched passwords | Validation error: "Passwords do not match" |
| 8 | Submit with password shorter than 8 characters | Validation error: "Password must be at least 8 characters" |
| 9 | Submit with matching valid passwords | Success; redirected to `/login`; toast: "Password reset successfully. Please sign in." |
| 10 | Click the same reset link again | Error page or redirect to `/login` with message: "This reset link has already been used or has expired." |

**Expected Result:** Full forgot password flow functional; same message for any email (no enumeration); token single-use.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-AUTH-006

| Field | Value |
|---|---|
| **Test Case ID** | FE-AUTH-006 |
| **Title** | Login page is fully accessible — keyboard navigation and screen reader compatible |
| **Module** | Authentication |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Accessibility |
| **Tool** | Playwright + axe-core |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- User on `/login` page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Run `axe-core` scan on login page | Zero accessibility violations (WCAG 2.1 AA) |
| 2 | Press `Tab` from page load | Focus moves to email input first |
| 3 | Press `Tab` again | Focus moves to password input |
| 4 | Press `Tab` again | Focus moves to "Sign In" button |
| 5 | Press `Tab` again | Focus moves to "Forgot password?" link |
| 6 | Navigate to email field; type valid email; press `Tab`; type password; press `Enter` | Form submits — Enter key triggers login |
| 7 | Check all form labels | `<label>` elements correctly associated with inputs via `for`/`id` or `aria-label` |
| 8 | Check error messages | Error messages linked to inputs via `aria-describedby`; `role="alert"` on error container |
| 9 | Check color contrast | All text meets WCAG AA 4.5:1 ratio (verified via axe) |
| 10 | Tab to password visibility toggle | Toggle button focusable; `aria-label` reads "Show password" / "Hide password" |

**Expected Result:** Zero axe violations; full keyboard navigation; correct ARIA attributes; color contrast passing.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-AUTH-007

| Field | Value |
|---|---|
| **Test Case ID** | FE-AUTH-007 |
| **Title** | Login page renders correctly on mobile viewport |
| **Module** | Authentication |
| **Priority** | P1 |
| **Severity** | Medium |
| **Type** | Responsive |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Mobile (375×812) |
| **Status** | Active |

**Preconditions:**
- Playwright viewport set to 375×812 (iPhone SE)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` | Page renders without horizontal scroll |
| 2 | Inspect layout | Logo, email field, password field, Sign In button, Forgot password link all visible without scrolling |
| 3 | Tap email field | Mobile keyboard opens; input focused; no layout jump |
| 4 | Verify input size | Touch targets ≥ 44×44px (WCAG 2.5.5) |
| 5 | Fill and submit form | Login works correctly on mobile |
| 6 | Check for text overflow | No text clipped or overflowing container boundaries |

**Expected Result:** Login page fully functional and legible on 375px width; touch targets appropriately sized.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 2 — App Shell & Navigation

### FE-NAV-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-NAV-001 |
| **Title** | Sidebar navigation renders correct items based on user role |
| **Module** | App Shell / Navigation |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Three users available: Admin, HR Manager, Employee (plain role)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Log in as Admin | Sidebar shows: Dashboard, Employees, Departments, Payroll, Leave, Attendance, Documents, Reports, Settings |
| 2 | Log in as HR Manager | Sidebar shows: Dashboard, Employees, Payroll, Leave, Attendance, Reports — Settings may be limited |
| 3 | Log in as Employee | Sidebar shows ESS items only: My Dashboard, My Leave, My Payslips, My Documents — NO Employees, Payroll, Reports |
| 4 | As Employee, manually navigate to `/employees` | Redirected to `/403` or `/dashboard` with "Access denied" message |
| 5 | As HR Manager, navigate to `/settings/roles` | Page accessible |
| 6 | As Employee, navigate to `/settings/roles` | Redirected to `/403` |

**Expected Result:** Sidebar items filtered by role; unauthorized routes return 403 page; nav items not merely hidden but routes also protected.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-NAV-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-NAV-002 |
| **Title** | Notification bell shows unread count and marks notifications read |
| **Module** | App Shell / Notifications |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Employee has 3 unread notifications (e.g., leave approved, payslip ready, policy to acknowledge)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | View top navigation bar | Bell icon shows badge with count "3" |
| 2 | Click the bell icon | Notification dropdown opens; 3 notification items listed, newest first |
| 3 | Inspect unread notification appearance | Unread items have distinct background (e.g., blue tint) vs. read items |
| 4 | Click the first notification (leave approval) | Notification marked as read; navigates to `/leave/requests/:id`; dropdown closes |
| 5 | Re-open dropdown | Badge count now "2"; clicked notification shows read styling |
| 6 | Click "Mark all as read" | All notifications styled as read; badge disappears from bell |
| 7 | Re-open dropdown | No badge; all items appear in read style |
| 8 | New notification arrives (via WebSocket or polling) | Badge reappears with count "1" without page refresh |

**Expected Result:** Badge count accurate; dropdown shows correct items; read state persists; real-time count update.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-NAV-003

| Field | Value |
|---|---|
| **Test Case ID** | FE-NAV-003 |
| **Title** | Sidebar collapses and expands correctly; active route highlighted |
| **Module** | App Shell / Navigation |
| **Priority** | P2 |
| **Severity** | Medium |
| **Type** | UI/UX |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- HR Manager logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | View sidebar on `/employees` | "Employees" nav item is highlighted/active |
| 2 | Navigate to `/leave/requests` | "Leave" nav item becomes active; "Employees" deactivates |
| 3 | Click the collapse/hamburger toggle | Sidebar collapses to icon-only mode; labels hidden |
| 4 | Hover over an icon in collapsed mode | Tooltip with label appears |
| 5 | Click an icon in collapsed mode | Navigation works; sidebar stays collapsed |
| 6 | Click expand toggle | Sidebar expands; labels visible again; no layout shift on main content |
| 7 | Collapse sidebar; refresh page | Sidebar state persisted (still collapsed after refresh) |

**Expected Result:** Active route highlighted; sidebar collapse/expand works; state persists across refreshes.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-NAV-004

| Field | Value |
|---|---|
| **Test Case ID** | FE-NAV-004 |
| **Title** | App shell responsive — sidebar becomes drawer on mobile |
| **Module** | App Shell / Navigation |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Responsive |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Mobile (375×812) |
| **Status** | Active |

**Preconditions:**
- HR Manager logged in; viewport set to 375×812

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | View dashboard on mobile | Sidebar NOT visible by default (off-screen or hidden) |
| 2 | Tap hamburger menu icon in top bar | Sidebar slides in from left as drawer overlay |
| 3 | Tap a navigation item | Drawer closes; navigated to selected page |
| 4 | Tap outside the drawer | Drawer closes |
| 5 | Press `Escape` key | Drawer closes |
| 6 | Verify main content area | Full width on mobile; not pushed by sidebar |
| 7 | Rotate to landscape (568×320) | Layout adjusts; content readable; no horizontal scroll |

**Expected Result:** Drawer-based navigation on mobile; closes on item tap or outside click; full-width content.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 3 — Employee Management Pages

### FE-EMP-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-EMP-001 |
| **Title** | Employee list page — data table renders, filters, searches, and paginates |
| **Module** | Employee Management |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- 50 employees exist across 3 departments
- HR Manager logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/employees` | Page loads; table shows first 25 employees; column headers: Name, Employee #, Department, Job Title, Status, Hire Date |
| 2 | Inspect loading state | Skeleton loader shown while data fetches; not a blank white screen |
| 3 | Type "John" in the search box | Table updates; only employees with "John" in name shown; search debounced (no request per keystroke) |
| 4 | Clear search | All employees return |
| 5 | Click "Department" filter dropdown; select "Engineering" | Table shows only Engineering employees |
| 6 | Add "Status: Active" filter | Table further filtered; filter chip "Engineering × Active ×" visible |
| 7 | Remove "Engineering" chip | Only Active filter remains |
| 8 | Click column header "Hire Date" | Table sorted by hire date ascending; arrow icon shows sort direction |
| 9 | Click "Hire Date" again | Sorted descending |
| 10 | Navigate to page 2 using pagination | Second page loads; URL updates `?page=2`; active page button highlighted |
| 11 | Change per-page selector to 50 | 50 rows shown; pagination updates accordingly |

**Expected Result:** All table interactions functional; skeleton on load; filters chainable; sorting bidirectional; URL reflects pagination.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-EMP-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-EMP-002 |
| **Title** | Create employee form — validation, submission, and success feedback |
| **Module** | Employee Management |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- HR Manager logged in; departments, job titles, locations exist

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Add Employee" button | Multi-step form opens (or slides in as a drawer/modal) |
| 2 | Click "Next" without filling required fields | Required field errors shown inline: First Name, Last Name, Email, Hire Date |
| 3 | Fill `firstName: "Tanvir"`, `lastName: "Ahmed"` | Errors clear on those fields |
| 4 | Enter invalid email `"not-an-email"` | Error: "Please enter a valid email address" |
| 5 | Enter valid email `"tanvir@acme.com"` | Error clears |
| 6 | Enter `hireDate` as a future date 5 years from now | Warning displayed (not error): "Hire date is more than 1 year in the future — please confirm" |
| 7 | Fill all required fields with valid data; click "Save" | Loading state on button; button disabled |
| 8 | Request succeeds | Success toast: "Employee Tanvir Ahmed created successfully"; form closes; new employee appears in list |
| 9 | Verify the new row in the table | First column shows "Tanvir Ahmed" with correct employee number |
| 10 | Simulate API error (500) | Error toast: "Failed to create employee. Please try again."; form stays open with data intact |

**Expected Result:** Inline validation per field; API errors handled gracefully; success feedback shown; list auto-updated.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-EMP-003

| Field | Value |
|---|---|
| **Test Case ID** | FE-EMP-003 |
| **Title** | Employee profile page — tabbed navigation and data display |
| **Module** | Employee Management |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Employee `emp-001` exists with history, documents, leave records, and payroll data
- HR Manager logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/employees/emp-001` | Profile page loads; header shows full name, employee number, department, status badge |
| 2 | Verify default tab | "Overview" tab active; personal info, contact, org details visible |
| 3 | Click "Employment History" tab | URL updates to `/employees/emp-001?tab=history`; history timeline renders with event types and dates |
| 4 | Click "Documents" tab | Document vault renders; file type icons, upload date, document type labels visible |
| 5 | Click "Leave" tab | Leave balance cards shown per leave type; leave request history table below |
| 6 | Click "Payroll" tab | Salary history and recent payslips listed |
| 7 | Refresh page on "Payroll" tab | Page reloads on Payroll tab (URL query param preserved) |
| 8 | Click "Edit" button | Edit form pre-populated with current employee data |
| 9 | Change `jobTitle` to a new value; save | Profile updated; success toast shown; Overview tab reflects new title |

**Expected Result:** All tabs functional; URL reflects tab state; edit pre-populates correctly; save updates view.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-EMP-004

| Field | Value |
|---|---|
| **Test Case ID** | FE-EMP-004 |
| **Title** | Bulk CSV import — file upload, progress, and per-row error display |
| **Module** | Employee Management |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- CSV file with 10 rows: 8 valid, 2 invalid (missing hireDate, duplicate employee number)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Bulk Import" button | Import modal opens; drag-and-drop zone and file picker visible |
| 2 | Drag non-CSV file (e.g., `.xlsx`) onto drop zone | Error message: "Only CSV files are supported" |
| 3 | Upload valid CSV file | File name and row count shown: "employees.csv — 10 rows detected" |
| 4 | Click "Import" | Progress indicator appears: "Processing... 3/10, 6/10, 10/10" |
| 5 | Import completes | Summary shown: "8 employees imported successfully. 2 rows failed." |
| 6 | Inspect error table | Row 9: "hireDate is required"; Row 10: "Duplicate employee number EMP-999" |
| 7 | Click "Download Error Report" | CSV downloaded with only failed rows and error reasons |
| 8 | Close modal; verify employee list | 8 new employees visible in list |

**Expected Result:** Drag-and-drop works; wrong file type rejected; progress shown; error table with row-level detail; error CSV downloadable.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-EMP-005

| Field | Value |
|---|---|
| **Test Case ID** | FE-EMP-005 |
| **Title** | Terminate employee — confirmation dialog and status update |
| **Module** | Employee Management |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Active employee `emp-001` on profile page; HR Manager logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Actions" dropdown on employee profile | Menu opens with options including "Terminate Employee" |
| 2 | Click "Terminate Employee" | Confirmation dialog opens — NOT immediate action |
| 3 | Inspect dialog | Warning icon; message: "This action will deactivate Tanvir Ahmed's account. This cannot be easily undone."; fields for Last Working Date, Exit Type, Reason |
| 4 | Click "Cancel" | Dialog closes; no action taken; employee still active |
| 5 | Click "Terminate Employee" again; fill form; click "Confirm Termination" | Loading state; button disabled |
| 6 | Termination succeeds | Dialog closes; employee status badge on profile changes to "Terminated" (red badge); user account deactivated |
| 7 | Check employee list | `emp-001` no longer appears in default (active) list |
| 8 | Apply "Include Terminated" filter on list | `emp-001` appears with "Terminated" badge |

**Expected Result:** Confirmation dialog prevents accidental termination; status badge updates immediately; employee removed from active list.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-EMP-006

| Field | Value |
|---|---|
| **Test Case ID** | FE-EMP-006 |
| **Title** | Org chart renders hierarchy and supports drill-down |
| **Module** | Employee Management / Org Chart |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Company has 3-level hierarchy: CEO → Directors (3) → Teams (15 employees total)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/org-chart` | Chart renders; CEO node visible at top; 3 director nodes below |
| 2 | Click a director node | Subtree expands showing their team members |
| 3 | Hover over an employee node | Tooltip shows: full name, job title, department, direct reports count |
| 4 | Click "View Profile" on hover tooltip | Navigates to `/employees/:id` |
| 5 | Use zoom controls (+/-) | Chart zooms in/out smoothly |
| 6 | Click "Fit to screen" | Chart recenters and fits entire tree in viewport |
| 7 | Search for "Tanvir" in org chart search | Tanvir's node highlighted; chart pans to that node |
| 8 | Test with 100+ employee company | Chart renders without freezing; performance acceptable (< 3s load) |

**Expected Result:** Hierarchy renders correctly; nodes expandable; search highlights nodes; zoom/pan functional; performance acceptable at scale.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 4 — Leave Management Pages

### FE-LVE-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-LVE-001 |
| **Title** | Leave application form — date range picker, balance check, and submission |
| **Module** | Leave Management |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Employee logged in; has 5 days Annual Leave balance
- Team leave calendar has no conflicts

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Apply Leave" on ESS Leave page | Apply Leave form opens |
| 2 | Select Leave Type: "Annual Leave" | Balance widget updates: "Available: 5 days" |
| 3 | Open date range picker; select start date = today | Calendar opens; weekends visually greyed out |
| 4 | Select end date 3 working days from start | `total_days` computed and shown: "3 working days" |
| 5 | Attempt to select end date before start date | Calendar prevents selection; or error shown: "End date cannot be before start date" |
| 6 | Toggle "Half Day" checkbox | Session picker appears (Morning / Afternoon); `total_days` updates to "0.5" |
| 7 | Untoggle half day; select 3-day range | Balance preview: "After approval: 2 days remaining" |
| 8 | Select 7-day range (exceeds balance) | Warning: "Requested days (7) exceed your available balance (5 days)" — form can still be submitted (some companies allow advance leave) or blocked depending on policy |
| 9 | Submit valid 3-day request | Success toast: "Leave request submitted for approval"; request appears in "Pending" list |
| 10 | Verify balance display | Balance still shows 5 days (pending, not yet deducted) |

**Expected Result:** Date picker prevents invalid ranges; balance preview shown; half-day toggle works; success on submission; balance unchanged while pending.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-LVE-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-LVE-002 |
| **Title** | Team leave calendar — displays team leaves and holiday markers |
| **Module** | Leave Management |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- 3 team members have approved leave in the current month
- 2 public holidays in the current month

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/leave/calendar` | Monthly calendar grid renders; current month shown |
| 2 | Inspect leave blocks | Each approved leave shown as color block spanning relevant days; employee name on block |
| 3 | Inspect holiday markers | Public holidays shown with distinct color/icon (e.g., flag icon, different background) |
| 4 | Hover over a leave block | Tooltip: employee name, leave type, start–end dates |
| 5 | Click "Previous month" / "Next month" arrows | Calendar navigates; correct data loaded for new month |
| 6 | Filter by "Department: Engineering" | Only Engineering employees' leaves shown |
| 7 | Click a holiday marker | Holiday name and type shown (e.g., "Eid ul-Fitr — Public Holiday") |
| 8 | Test on mobile (375px) | Calendar switches to list view or horizontal scroll; not broken |

**Expected Result:** Leave blocks and holidays visible; hover tooltips work; month navigation functional; department filter works.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-LVE-003

| Field | Value |
|---|---|
| **Test Case ID** | FE-LVE-003 |
| **Title** | Manager leave approval queue — approve and reject with remarks |
| **Module** | Leave Management |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Manager has 3 pending leave requests from direct reports

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to MSS approval page | Pending leave requests listed; each shows employee name, leave type, dates, total days |
| 2 | Click "Approve" on first request | Confirmation prompt or inline: "Approve this leave request?" with optional remarks field |
| 3 | Click confirm without remarks | Leave approved; request moves from "Pending" to "Approved" tab; employee notified |
| 4 | Click "Reject" on second request | Reject modal opens with mandatory remarks field |
| 5 | Click "Confirm Reject" without entering remarks | Validation error: "Rejection reason is required" |
| 6 | Enter remarks "Insufficient team coverage" and confirm | Leave rejected; moves to "Rejected" tab; employee notified with reason |
| 7 | Refresh the page | Approved and rejected requests no longer appear in pending queue |
| 8 | Verify employee's balance | Balance unchanged (approved leaves deducted; rejected unchanged) |

**Expected Result:** Approval no remarks required; rejection remarks mandatory; queue updates after action; balance updated correctly.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-LVE-004

| Field | Value |
|---|---|
| **Test Case ID** | FE-LVE-004 |
| **Title** | Leave balance cards display correct values per leave type |
| **Module** | Leave Management |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | RTL (React Testing Library) |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Mock API returns: Annual Leave (opening: 5, accrued: 4.5, used: 3, adjusted: 0), Sick Leave (opening: 0, accrued: 8, used: 2, adjusted: 1)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Render `<LeaveBalanceCards />` component with mock data | Component renders without errors |
| 2 | Inspect Annual Leave card | Shows: "Closing Balance: 6.5 days"; breakdown: Opening 5 + Accrued 4.5 - Used 3 = 6.5 |
| 3 | Inspect Sick Leave card | Shows: "Closing Balance: 7 days"; breakdown: 0 + 8 + 1(adjusted) - 2 = 7 |
| 4 | Render with `closingDays = 0` | Card shows "0 days" — not broken or negative |
| 5 | Render with API loading state | Skeleton cards shown instead of real values |
| 6 | Render with API error state | Error message within card: "Unable to load balance" with retry button |

**Expected Result:** Correct arithmetic displayed; zero state handled; loading skeleton shown; error state with retry.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 5 — Attendance Pages

### FE-ATT-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-ATT-001 |
| **Title** | Clock-in / clock-out button state reflects current attendance status |
| **Module** | Attendance |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Employee logged in; no clock-in recorded today

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | View attendance widget on ESS dashboard | "Clock In" button visible; current status: "Not clocked in" |
| 2 | Click "Clock In" | Loading state; button disabled |
| 3 | Clock-in succeeds | Button changes to "Clock Out"; timestamp displayed: "Clocked in at 09:02 AM"; status: "Present" |
| 4 | Refresh page | State persists; still shows "Clocked in at 09:02 AM"; "Clock Out" button |
| 5 | Click "Clock Out" | Confirmation prompt: "Clock out now?" |
| 6 | Confirm | Clock-out time displayed; total hours shown: "8h 30m"; button reverts to neutral "Attendance recorded" state |
| 7 | Attempt to click "Clock In" again on same day | Button disabled or message: "You have already completed attendance for today" |

**Expected Result:** Button state accurately reflects attendance status; timestamps displayed; clock-in/out flow complete; prevents double punch.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-ATT-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-ATT-002 |
| **Title** | Attendance exceptions report highlights late arrivals and absences |
| **Module** | Attendance |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- This week: 2 employees late, 1 absent, 3 missing clock-out
- HR Manager logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/attendance/exceptions` | Exceptions report renders with this week's data |
| 2 | Inspect late arrivals | Rows highlighted in amber/yellow; "Late" badge; clock-in time shown |
| 3 | Inspect absent rows | Rows highlighted in red; "Absent" badge; no clock-in/out times |
| 4 | Inspect missing clock-out rows | "Missing Punch" badge in orange; clock-in shown but clock-out blank |
| 5 | Click "Correct Attendance" on a missing punch row | Correction form opens pre-filled with employee and date |
| 6 | Filter by department | Report filters to show only selected department's exceptions |
| 7 | Click "Export" | CSV file downloaded containing all exception rows |

**Expected Result:** Exception types have distinct visual treatment; correction form accessible from report; filter and export work.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 6 — Payroll Pages

### FE-PAY-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-PAY-001 |
| **Title** | Payroll cycle dashboard — status indicators and run flow |
| **Module** | Payroll |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Payroll cycle `Jan 2025` in `draft` status; HR Manager logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/payroll/cycles` | List shows all cycles; Jan 2025 has "Draft" badge (grey) |
| 2 | Click on Jan 2025 cycle | Cycle detail page opens; shows period, pay date, status, employee count |
| 3 | Click "Run Payroll" button | Confirmation modal: "Run payroll for January 2025? This will compute pay for 48 employees." |
| 4 | Confirm run | Progress indicator: "Computing payroll... 12/48... 36/48... Complete" |
| 5 | Cycle status changes to "Computed" | "Approve" button appears; "Run" button gone |
| 6 | Scroll through entries table | All 48 employees listed with Gross / Deductions / Net columns |
| 7 | Click "Approve Payroll" | Approval confirmation; cycle status changes to "Approved" (green badge) |
| 8 | Click "Disburse" | Bank file downloaded; status changes to "Disbursed" (blue badge) |
| 9 | Attempt to click "Run" on disbursed cycle | Button absent; no action possible |

**Expected Result:** Status badges correct at each stage; progress shown during compute; correct state transitions; disbursed cycle locked.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-PAY-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-PAY-002 |
| **Title** | Payslip viewer — employee can view and download their payslip |
| **Module** | Payroll |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Employee logged in (ESS); payslip generated for Jan 2025

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to ESS `/my-payslips` | List of payslips shown with month, year, net pay amount |
| 2 | Click on Jan 2025 payslip | PDF viewer opens inline; company logo, employee name, pay period visible |
| 3 | Inspect payslip contents | Shows: Gross Pay, all earnings components, all deductions, Net Pay |
| 4 | Click "Download PDF" button | PDF file downloaded to browser |
| 5 | Verify downloaded filename | `payslip-jan-2025-emp-tanvir-ahmed.pdf` (or similar descriptive name) |
| 6 | Attempt to access another employee's payslip URL directly | 403 page or redirect — employee cannot access others' payslips |
| 7 | Test on mobile | PDF viewer scrollable; download button accessible |

**Expected Result:** Payslip renders with correct data; download works; access control enforced; mobile compatible.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-PAY-003

| Field | Value |
|---|---|
| **Test Case ID** | FE-PAY-003 |
| **Title** | Salary structure builder — component ordering, preview, and save |
| **Module** | Payroll |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- HR Manager on `/payroll/structures/new`

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter structure name "Standard Full-Time" | Name field accepts input |
| 2 | Click "Add Component"; select "Basic Salary"; set amount 50,000 | Component row appears in table |
| 3 | Click "Add Component"; select "HRA"; set calculation "Percentage"; enter 40 | HRA displays as "40% of Basic = 20,000" in preview |
| 4 | Drag HRA row above Basic in the ordering list | Row reorders; sequence numbers update |
| 5 | Inspect live preview panel | Shows: Basic 50,000 + HRA 20,000 = Gross 70,000 |
| 6 | Add TDS deduction component: 10,000 fixed | Preview updates: Net = 60,000 |
| 7 | Try to save with no components | Validation: "At least one earning component is required" |
| 8 | Save valid structure | Success toast; redirected to structure list; new structure appears |
| 9 | Edit structure; remove HRA; save | Preview updates correctly; saved successfully |

**Expected Result:** Component builder interactive; percentage components calculate live; drag-to-reorder works; preview accurate; validation present.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 7 — Documents & Compliance Pages

### FE-DOC-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-DOC-001 |
| **Title** | Document upload — drag and drop, file type validation, progress |
| **Module** | Documents |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- HR Manager on employee `emp-001` Documents tab

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Upload Document" | File picker and drag-and-drop zone visible |
| 2 | Drag a `.exe` file onto drop zone | Error: "File type not supported. Allowed types: PDF, JPG, PNG, DOCX" |
| 3 | Drag a valid 2MB PDF onto drop zone | File accepted; filename and size shown in upload area |
| 4 | Select document type from dropdown (e.g., "Contract") | Type selected |
| 5 | Click "Upload" | Progress bar animates to 100% |
| 6 | Upload completes | Success message; document appears in vault table |
| 7 | Click document row | Download or preview triggered |
| 8 | Click delete icon on document | Confirmation: "Are you sure you want to remove this document?" |
| 9 | Confirm delete | Document removed from table; success toast |
| 10 | Upload a 25MB file | Error: "File size exceeds the 20MB limit" |

**Expected Result:** Wrong type and oversized files rejected with helpful messages; upload progress shown; delete confirmation required.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-DOC-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-DOC-002 |
| **Title** | Policy acknowledgement — employee reads and confirms mandatory policy |
| **Module** | Documents / Compliance |
| **Priority** | P0 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Mandatory policy "Code of Conduct v2.0" published; employee has not acknowledged it

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Employee logs in | Dashboard shows pending task: "Acknowledge Code of Conduct v2.0" |
| 2 | Click the task | Policy viewer opens with PDF embedded |
| 3 | Try to click "I Acknowledge" before scrolling to bottom | Button disabled with tooltip: "Please read the full document before acknowledging" |
| 4 | Scroll to bottom of PDF | "I Acknowledge" button becomes enabled |
| 5 | Click "I Acknowledge" | Confirmation modal: "I confirm I have read and understood the Code of Conduct v2.0" |
| 6 | Click "Confirm" | Success message; task removed from pending list |
| 7 | Navigate to `/compliance/policies` | Policy shows employee as "Acknowledged" with timestamp |
| 8 | Reload policy viewer | "Acknowledged" banner shown; acknowledge button replaced with confirmation date |

**Expected Result:** Button gated until full scroll; confirmation modal; task cleared on acknowledgement; re-opening shows acknowledged state.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 8 — Reports & Analytics Pages

### FE-RPT-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-RPT-001 |
| **Title** | Pre-built reports — filter, view results, and export |
| **Module** | Reporting |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- HR Manager logged in; headcount data exists across departments and months

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/reports` | Report catalog shows 7 pre-built reports as cards |
| 2 | Click "Headcount Report" | Report page opens with date range filter and group-by option |
| 3 | Set date range: Jan 2025 – Mar 2025; Group by: Department | Report runs; table renders with correct column headers |
| 4 | Inspect data | Row per department; count matches known data |
| 5 | Click column header to sort | Table sorts ascending/descending |
| 6 | Click "Export Excel" | Loading state; XLSX file downloads |
| 7 | Click "Export PDF" | PDF downloads |
| 8 | Verify downloaded file | Contains same data as screen; correct filename with date range |
| 9 | Schedule report: click "Schedule" | Modal: frequency (daily/weekly/monthly), recipient emails, format |
| 10 | Save schedule | Confirmation: "Report scheduled for weekly delivery to 2 recipients" |

**Expected Result:** All 7 reports accessible; filters functional; both export formats work; scheduling UI functional.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-RPT-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-RPT-002 |
| **Title** | HR dashboard — KPI cards display accurate real-time metrics |
| **Module** | Analytics / Dashboard |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Company has 150 active employees; 3 hired this month; 1 terminated this month; 5 pending leave requests

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/dashboard` | 4 KPI cards visible: Total Employees, New Hires (MTD), Exits (MTD), Pending Approvals |
| 2 | Inspect "Total Employees" | Shows `150` |
| 3 | Inspect "New Hires (MTD)" | Shows `3` |
| 4 | Inspect "Exits (MTD)" | Shows `1` |
| 5 | Inspect "Pending Approvals" | Shows `5` (leave requests awaiting action) |
| 6 | Create a new employee | "Total Employees" card updates to `151` (via polling or cache invalidation) |
| 7 | Click a KPI card | Navigates to the relevant detailed page (e.g., clicking "Pending Approvals" → `/leave/requests/pending`) |
| 8 | Inspect department distribution chart | Pie or bar chart shows accurate dept headcount |
| 9 | Inspect payroll trend chart | Monthly gross/net line chart for last 6 months |

**Expected Result:** All KPI values accurate; cards refresh after data changes; click-through navigation works; charts display meaningful data.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 9 — Recruitment Pages `[V2]`

### FE-REC-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-REC-001 |
| **Title** | Kanban pipeline board — drag-and-drop stage movement |
| **Module** | Recruitment |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V2 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Requisition `req-001` open; 6 applications distributed across Applied (3), Screening (2), Interview (1)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/recruitment/requisitions/req-001` | Kanban board renders; 5 stage columns visible |
| 2 | Count cards per column | Applied: 3, Screening: 2, Interview: 1, Offer: 0, Hired: 0 |
| 3 | Drag an "Applied" card to "Screening" column | Card moves; column counts update (Applied: 2, Screening: 3) |
| 4 | Verify API call triggered | `PATCH /recruitment/applications/:id/stage` called with `{ stage: "screening" }` |
| 5 | Drag "Interview" card to "Applied" column (backwards) | Drag prevented OR card snaps back with error toast: "Cannot move an application backwards in the pipeline" |
| 6 | Click a candidate card | Candidate detail panel opens (sidebar or modal) with resume, scores, interview notes |
| 7 | Click "Reject" on a candidate card | Rejection reason modal opens; confirm; card moves to greyed-out "Rejected" state |
| 8 | Test on tablet (768px) | Columns scrollable horizontally; drag works on touch |

**Expected Result:** Drag-and-drop functional; backward moves blocked; counts update; API triggered; rejection flow works.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-REC-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-REC-002 |
| **Title** | Public careers page — job listing and application form submission |
| **Module** | Recruitment |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V2 |
| **Viewport** | All |
| **Status** | Active |

**Preconditions:**
- 3 open job requisitions published; careers page publicly accessible at `/careers`

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/careers` (not logged in) | Page renders; company logo/branding; 3 job listings visible |
| 2 | Filter by "Full Time" | Shows only full-time positions |
| 3 | Search for "Engineer" | Shows only engineering roles |
| 4 | Click a job listing | Job detail page opens with full description, requirements, location |
| 5 | Click "Apply Now" | Application form opens (no login required) |
| 6 | Submit form with empty required fields | Validation errors inline: First Name, Last Name, Email, Resume |
| 7 | Upload invalid file type for resume (`.txt`) | Error: "Please upload a PDF or DOC file" |
| 8 | Fill all fields; upload valid PDF resume; submit | Success page: "Application submitted! We'll be in touch." |
| 9 | Verify in admin panel | New candidate and application visible in pipeline |
| 10 | Test on mobile (375px) | Application form fully functional on mobile; no horizontal scroll |

**Expected Result:** Public page requires no login; filtering/search works; application validation correct; mobile friendly.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 10 — Performance Management Pages `[V2]`

### FE-PERF-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-PERF-001 |
| **Title** | OKR tree view — goal alignment and check-in drawer |
| **Module** | Performance Management |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V2 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Company goal → 3 department goals → 9 individual goals exist
- Employee logged in with 3 individual goals

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/goals` | My Goals page renders; 3 individual goal cards with progress bars |
| 2 | Click "View OKR Tree" | Tree visualization renders; company goal at top; department goals mid-level; individual goals at bottom |
| 3 | Verify progress bars | Each goal shows `currentValue / targetValue` as percentage and bar fill |
| 4 | Click own goal card | Check-in drawer slides in from right |
| 5 | Enter new progress value and note; click "Save Check-in" | Progress bar updates; check-in history shown below the goal |
| 6 | Progress reaches 100% | Goal card shows "Completed" badge; progress bar full green |
| 7 | Filter by "Company Goals" | Only company-level goals shown |
| 8 | Filter by "My Goals" | Returns to personal goals view |

**Expected Result:** OKR tree renders hierarchy; check-in drawer updates progress; completed goals marked; filter controls work.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-PERF-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-PERF-002 |
| **Title** | Performance review form — dynamic sections, save draft, and submit |
| **Module** | Performance Management |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V2 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Review cycle `Annual 2025` active; employee has self-review form assigned
- Template has 3 sections: Goals Achievement, Core Competencies, Development

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/performance/reviews` | "Pending" tab shows self-review form card |
| 2 | Click "Start Review" | Multi-section form opens; Section 1 "Goals Achievement" visible |
| 3 | Click star rating for question 1 | Rating selected; star fills |
| 4 | Click a different star | Rating updates to new selection |
| 5 | Click "Save Draft" without completing all sections | Partial save succeeds; toast: "Draft saved"; progress indicator shows "1/3 sections complete" |
| 6 | Close and re-open form | Previously entered ratings and comments restored from draft |
| 7 | Complete all sections | All required fields filled |
| 8 | Click "Submit Review" | Confirmation modal: "Once submitted, your review cannot be edited. Continue?" |
| 9 | Confirm submission | Success; form status changes to "Submitted"; form fields become read-only |
| 10 | Attempt to edit a submitted review | Edit controls absent; read-only view only |

**Expected Result:** Draft saves partial progress; form restores on reopen; submission irreversible; submitted form read-only.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 11 — Learning & Development Pages `[V2]`

### FE-LMS-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-LMS-001 |
| **Title** | Course catalog — browse, filter, and self-enroll |
| **Module** | Learning & Development |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V2 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- 12 courses exist across 4 categories; employee logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/lms/courses` | Course catalog renders as grid cards; each card shows title, category, duration, thumbnail |
| 2 | Filter by category "Compliance" | Only compliance courses shown |
| 3 | Search "Python" | Python-tagged courses shown |
| 4 | Click a course card | Course detail page: description, skills, duration, provider, enroll button |
| 5 | Click "Enroll" on an unassigned optional course | Success toast: "Enrolled successfully"; button changes to "Continue Learning" |
| 6 | Click mandatory course (badge shown) | "Mandatory" badge visible; enroll button replaced with "Required — Start Course" |
| 7 | Click "Continue Learning" | Course player opens |
| 8 | Navigate to My Training page | Enrolled courses shown with progress percentages |
| 9 | Attempt to enroll in a course already enrolled in | Button shows "Already enrolled — Continue" instead of "Enroll" |

**Expected Result:** Catalog browsable; filters and search work; enrollment and mandatory badges correct; duplicate enrollment prevented.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-LMS-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-LMS-002 |
| **Title** | Skills matrix heatmap — visualizes proficiency gaps across department |
| **Module** | Learning & Development |
| **Priority** | P2 |
| **Severity** | Medium |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V2 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- 5 employees in Engineering; 6 skills in taxonomy; mixed proficiency levels

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/skills/matrix?department=engineering` | Heatmap renders; rows = employees; columns = skills |
| 2 | Inspect cell colors | Green = proficiency 4-5; yellow = 2-3; red = 0-1; grey = not assessed |
| 3 | Hover over a cell | Tooltip: "Tanvir Ahmed — Python — Level 3 (Intermediate) — Self-assessed" |
| 4 | Click a red cell (skill gap) | Sidebar or modal shows gap details and recommended courses |
| 5 | Filter by "Skill Category: Technical" | Only technical skills shown in columns |
| 6 | Click a skill column header | Sorts rows by proficiency for that skill (highest first) |
| 7 | Export matrix | CSV downloaded with employee × skill proficiency data |
| 8 | Test at 100+ employee scale | Heatmap renders with horizontal scroll; not broken layout |

**Expected Result:** Heatmap color-coded correctly; tooltips informative; gap click shows courses; export works; scales gracefully.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 12 — ESS Portal Pages `[V1]`

### FE-ESS-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-ESS-001 |
| **Title** | ESS home page — employee sees personalized pending tasks and quick links |
| **Module** | ESS Portal |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | All |
| **Status** | Active |

**Preconditions:**
- Employee has: 1 pending policy to acknowledge, 2 payslips, 3 days annual leave remaining, 1 approved leave request upcoming

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Log in as employee; land on `/my-dashboard` | Personalized welcome: "Good morning, Tanvir" |
| 2 | Inspect "Pending Actions" section | Shows: "Acknowledge Code of Conduct v2.0" |
| 3 | Click the pending action | Navigated to policy acknowledgement flow |
| 4 | Inspect leave balance widget | Annual Leave balance "3 days" shown |
| 5 | Inspect upcoming leave card | Shows approved leave dates with type and status |
| 6 | Click "View My Payslips" | Navigated to payslip list |
| 7 | Click "Apply for Leave" quick action | Leave application form opens |
| 8 | Test on mobile (375px) | All widgets stack vertically; no horizontal overflow; touch targets adequate |

**Expected Result:** Personalized dashboard; pending actions surface prominently; quick links all functional; mobile responsive.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-ESS-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-ESS-002 |
| **Title** | Employee self-service profile update — saves and reflects immediately |
| **Module** | ESS Portal |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Employee logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to My Profile > Edit | Edit form opens pre-populated with current data |
| 2 | Change `phone` to `+880-1700-000000` | Field updated |
| 3 | Change `personalEmail` to an invalid format | Inline error: "Invalid email address" |
| 4 | Fix email to valid format; click Save | Saving state; success toast: "Profile updated" |
| 5 | Verify profile page | New phone and email visible immediately without refresh |
| 6 | Attempt to change `employeeNumber` field | Field not present or read-only — employees cannot change their own employee number |
| 7 | Attempt to change `department` field | Field not present — employees cannot change their org assignment |
| 8 | Upload new profile photo | Photo preview updates; saving triggers S3 upload; new avatar shown in top nav |

**Expected Result:** Employee can update personal fields only; HR-managed fields absent from self-service form; photo upload works.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 13 — Offboarding Pages `[V2]`

### FE-OFF-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-OFF-001 |
| **Title** | Offboarding portal — resignation submission and checklist tracking |
| **Module** | Offboarding |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V2 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Employee `emp-001` logged in; notice period = 30 days

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to ESS → "Resign / Exit" | Resignation form with fields: Resignation Date, Exit Type, Reason Category, Reason Detail |
| 2 | Select resignation date as today | `Last Working Date` auto-calculated: today + 30 days; shown below field |
| 3 | Select Exit Type "Voluntary"; Reason "Better Opportunity" | Fields populate; optional detail text box visible |
| 4 | Submit form | Confirmation modal: "Submitting a resignation will begin the offboarding process. This cannot be undone." |
| 5 | Confirm | Success; status banner: "Your resignation has been submitted and is pending HR approval." |
| 6 | HR approves in admin panel | Employee's ESS shows: "Resignation Approved — Last working date: July 1, 2025" |
| 7 | Navigate to exit checklist | Checklist tasks shown: Laptop return, GitHub access revocation, Final settlement, Experience letter |
| 8 | IT admin marks "Revoke GitHub access" complete | Task shows green checkmark; timestamp of completion |
| 9 | All tasks completed | Checklist shows "Offboarding Complete" status |

**Expected Result:** LWD auto-calculated; confirmation before submission; checklist tasks assignable and trackable; completion state visible.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 14 — Form Validation (Cross-Module)

### FE-FORM-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-FORM-001 |
| **Title** | All forms — required field errors appear on submit and clear on correction |
| **Module** | Cross-module / Forms |
| **Priority** | P0 |
| **Severity** | High |
| **Type** | Functional |
| **Tool** | RTL |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Each form rendered in isolation via React Testing Library

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Render each major form (Create Employee, Apply Leave, Salary Assignment, Policy Publish) | Forms render without errors |
| 2 | Click submit on each form without filling any fields | Required field errors shown inline under each required field — not in a generic banner |
| 3 | Fill a required field that had an error | Error for that specific field clears immediately (on-change validation) |
| 4 | Leave one field empty; fill all others; submit | Only the remaining empty field shows an error |
| 5 | Correct the last field; submit | Form submits (mock API); no errors visible |
| 6 | Verify error message copy | Errors are human-readable: "First name is required" not "firstName: Required" |
| 7 | Test that errors are visually distinct | Error text in red; input border turns red; error icon visible |

**Expected Result:** Inline errors per field; errors clear on correction; human-readable messages; visual treatment consistent.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-FORM-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-FORM-002 |
| **Title** | All forms — loading state prevents double submission |
| **Module** | Cross-module / Forms |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Functional |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Slow network simulated (API response delayed 3 seconds)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Fill and submit Create Employee form | Submit button shows spinner; button text changes to "Saving..."; button disabled |
| 2 | Attempt to click submit button again during loading | No second API call fired; button still disabled |
| 3 | Open DevTools Network tab | Only one `POST /employees` request in flight |
| 4 | Request completes | Button re-enables or form closes on success |
| 5 | Test on Leave Application form | Same pattern: "Submitting..." state prevents double submit |
| 6 | Simulate API failure after 3 seconds | Button re-enables; error message shown; form data intact |

**Expected Result:** Single submission guaranteed; no duplicate API calls; button disabled during loading; re-enabled on completion or error.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 15 — Error Handling & Empty States

### FE-ERR-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-ERR-001 |
| **Title** | API error states — network failure and 500 error handled gracefully |
| **Module** | Error Handling |
| **Priority** | P0 |
| **Severity** | Critical |
| **Type** | Negative |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- All pages accessible; network intercepts configured in Playwright

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Intercept `GET /employees` and return 500 | Employee list page shows error state: "Something went wrong. Please try again." with a Retry button |
| 2 | Click Retry | Request re-fires; if succeeds, data loads |
| 3 | Intercept all requests and simulate no network | Error banner: "Unable to connect. Check your internet connection." |
| 4 | Intercept `POST /employees` and return 422 with field errors | Form-level validation error displayed under the relevant fields |
| 5 | Intercept `POST /employees` and return 409 (duplicate) | Specific error: "An employee with this email already exists." |
| 6 | Intercept `GET /dashboard` and return 403 | Access denied page with helpful message; back button |
| 7 | Navigate to `/employees/non-existent-id` | 404 page with friendly message: "Employee not found." and a back link |

**Expected Result:** Every error type has a user-friendly message; retry available where appropriate; specific error messages for known error codes.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-ERR-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-ERR-002 |
| **Title** | Empty states — pages with no data show helpful prompts |
| **Module** | Error Handling / Empty States |
| **Priority** | P1 |
| **Severity** | Medium |
| **Type** | UI/UX |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Fresh company with no employees, no payroll cycles, no leave requests

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/employees` with no employees | Empty state illustration with text: "No employees yet. Add your first employee to get started." and a primary "Add Employee" CTA button |
| 2 | Navigate to `/payroll/cycles` with no cycles | Empty state: "No payroll cycles created yet. Create your first cycle to run payroll." |
| 3 | Navigate to `/leave/requests` with no requests | Empty state: "No leave requests found." with "Apply for Leave" button |
| 4 | Search for a term with no results | Empty search state: "No results for 'xyz'. Try a different search term." — distinct from initial empty state |
| 5 | Apply a filter that returns no results | "No employees match the selected filters." with "Clear Filters" link |
| 6 | Verify empty states are not just blank white screens | All empty states have: illustration/icon, descriptive message, actionable CTA |

**Expected Result:** Each empty state has a unique, helpful message with a relevant CTA; never a blank page.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 16 — Performance & Loading

### FE-PERF-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-PERF-001 |
| **Title** | Pages show skeleton loaders — no layout shift during data fetch |
| **Module** | Performance / UX |
| **Priority** | P1 |
| **Severity** | Medium |
| **Type** | Performance |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Network speed throttled to "Fast 3G" in Playwright

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/employees` on throttled network | Skeleton rows appear immediately; no blank white screen; no layout jump when data arrives |
| 2 | Navigate to `/dashboard` | KPI card skeletons shown; chart placeholder visible during load |
| 3 | Navigate to employee profile | Skeleton for header, tabs, and content sections |
| 4 | Measure Cumulative Layout Shift (CLS) using Playwright performance API | CLS score < 0.1 (Good threshold per Core Web Vitals) |
| 5 | Navigate to `/reports` | Report cards skeleton shown until data arrives |
| 6 | Verify no flash of un-styled content (FOUC) | Page content appears styled from first paint |

**Expected Result:** Skeleton loaders on all data-heavy pages; CLS < 0.1; no FOUC; no blank screens during load.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-PERF-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-PERF-002 |
| **Title** | Large data table — virtual scrolling handles 500+ rows without freezing |
| **Module** | Performance |
| **Priority** | P1 |
| **Severity** | Medium |
| **Type** | Performance |
| **Tool** | Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- 500 employees exist; employee list set to show 500 rows (or infinite scroll)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/employees?per_page=500` | Page loads within 3 seconds |
| 2 | Scroll to bottom of table | Smooth scroll; no browser freeze or jank (use Playwright `scrollTo`) |
| 3 | Measure frames per second during scroll | FPS remains above 30 (acceptable) |
| 4 | Search within the 500-row table | Results filter within 300ms |
| 5 | Inspect DOM | If virtual scrolling implemented: only ~30 DOM rows rendered at a time; not 500 |

**Expected Result:** 500-row table loads in < 3s; scroll smooth; virtual scroll limits DOM nodes; search responsive.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Module 17 — Accessibility (Cross-Module)

### FE-A11Y-001

| Field | Value |
|---|---|
| **Test Case ID** | FE-A11Y-001 |
| **Title** | All primary pages pass automated axe-core WCAG 2.1 AA accessibility scan |
| **Module** | Accessibility |
| **Priority** | P1 |
| **Severity** | High |
| **Type** | Accessibility |
| **Tool** | Playwright + axe-core |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- All V1 pages accessible with seeded data

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Run `axe-core` scan on `/login` | 0 violations |
| 2 | Run scan on `/dashboard` | 0 violations |
| 3 | Run scan on `/employees` | 0 violations |
| 4 | Run scan on `/employees/:id` | 0 violations |
| 5 | Run scan on `/leave/requests` | 0 violations |
| 6 | Run scan on `/payroll/cycles` | 0 violations |
| 7 | Run scan on `/reports` | 0 violations |
| 8 | Run scan on each form modal (Create Employee, Apply Leave) when open | 0 violations — modals have `aria-modal`, focus trap, correct heading hierarchy |
| 9 | Verify focus trap in modals | Tab key cycles only within open modal; does not reach background content |
| 10 | Verify all images have `alt` text | No `<img>` without `alt`; decorative images have `alt=""` |

**Expected Result:** Zero axe violations on all primary pages and modals; focus trap in modals; all images have alt text.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

### FE-A11Y-002

| Field | Value |
|---|---|
| **Test Case ID** | FE-A11Y-002 |
| **Title** | Color is not the only indicator — status badges have text labels |
| **Module** | Accessibility |
| **Priority** | P1 |
| **Severity** | Medium |
| **Type** | Accessibility |
| **Tool** | RTL + Playwright |
| **Phase** | V1 |
| **Viewport** | Desktop |
| **Status** | Active |

**Preconditions:**
- Employee list with varied status badges; leave request list with status columns

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Inspect employee status badges | Each badge shows text ("Active", "Terminated", "On Leave") in addition to color |
| 2 | Inspect leave request status column | Shows text: "Pending", "Approved", "Rejected" — not just colored dots |
| 3 | Inspect payroll cycle status badges | Text labels: "Draft", "Computed", "Approved", "Disbursed" |
| 4 | Render page in grayscale (CSS filter) | All status differences still distinguishable without color |
| 5 | Verify error states | Error messages use icon + text, not just red color change on input borders |
| 6 | Verify form validation errors | Error text visible alongside red border, not relying on border color alone |

**Expected Result:** No information conveyed by color alone; all status indicators have text labels; error states use icon + text.

**Actual Result:** _______________

**Pass / Fail:** _______________

---

## Regression Test Execution Log

| Run # | Date | Build / Release | Tester | Environment | Total | Passed | Failed | Blocked | Pass Rate |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | Staging | | | | | |
| 2 | | | | Staging | | | | | |
| 3 | | | | Staging | | | | | |
| 4 | | | | Production | | | | | |

---

## Frontend defect log template

| Field | Value |
|---|---|
| **Defect ID** | FE-DEF-YYYYMMDD-NNN |
| **Test Case ID** | e.g. FE-EMP-002 |
| **Title** | Brief description |
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P0 / P1 / P2 / P3 |
| **Browser** | Chrome 124 / Firefox 126 / Safari 17 / Edge |
| **Viewport** | Desktop / Tablet / Mobile |
| **Steps to reproduce** | Exact UI steps |
| **Expected result** | Correct UI behavior |
| **Actual result** | What actually happened |
| **Screenshot / Video** | Attachment |
| **Console errors** | Any JS errors in DevTools |
| **Network errors** | Any failed API calls |
| **Assigned to** | Frontend developer |
| **Status** | Open / In Progress / Fixed / Verified |

---

## Test case traceability matrix

| Test Case ID | Feature | Module | Sprint | Priority |
|---|---|---|---|---|
| FE-AUTH-001 | Login with valid credentials | Authentication | Sprint 1 | P0 |
| FE-AUTH-002 | Login with invalid credentials | Authentication | Sprint 1 | P0 |
| FE-AUTH-003 | Unauthenticated redirect | Authentication | Sprint 1 | P0 |
| FE-AUTH-004 | Session expiry and token refresh | Authentication | Sprint 1 | P0 |
| FE-AUTH-005 | Forgot password flow | Authentication | Sprint 1 | P1 |
| FE-AUTH-006 | Login page accessibility | Authentication | Sprint 1 | P1 |
| FE-AUTH-007 | Login page mobile responsive | Authentication | Sprint 1 | P1 |
| FE-NAV-001 | Sidebar role-based items | App Shell | Sprint 1 | P0 |
| FE-NAV-002 | Notification bell and inbox | App Shell | Sprint 5 | P1 |
| FE-NAV-003 | Sidebar collapse/expand and active route | App Shell | Sprint 1 | P2 |
| FE-NAV-004 | Mobile drawer navigation | App Shell | Sprint 6 | P1 |
| FE-EMP-001 | Employee list table interactions | Employee | Sprint 2 | P0 |
| FE-EMP-002 | Create employee form validation | Employee | Sprint 2 | P0 |
| FE-EMP-003 | Employee profile tabbed view | Employee | Sprint 2 | P0 |
| FE-EMP-004 | Bulk CSV import flow | Employee | Sprint 2 | P1 |
| FE-EMP-005 | Terminate employee confirmation | Employee | Sprint 2 | P0 |
| FE-EMP-006 | Org chart hierarchy and search | Employee | Sprint 2 | P1 |
| FE-LVE-001 | Leave application form | Leave | Sprint 3 | P0 |
| FE-LVE-002 | Team leave calendar | Leave | Sprint 3 | P1 |
| FE-LVE-003 | Manager approval queue | Leave | Sprint 3 | P0 |
| FE-LVE-004 | Leave balance card component | Leave | Sprint 3 | P1 |
| FE-ATT-001 | Clock-in / clock-out button state | Attendance | Sprint 3 | P0 |
| FE-ATT-002 | Attendance exceptions report | Attendance | Sprint 3 | P1 |
| FE-PAY-001 | Payroll cycle dashboard | Payroll | Sprint 4 | P0 |
| FE-PAY-002 | Payslip viewer and download | Payroll | Sprint 4 | P0 |
| FE-PAY-003 | Salary structure builder | Payroll | Sprint 4 | P1 |
| FE-DOC-001 | Document upload with validation | Documents | Sprint 5 | P1 |
| FE-DOC-002 | Policy acknowledgement flow | Documents | Sprint 5 | P0 |
| FE-RPT-001 | Pre-built reports filter and export | Reporting | Sprint 6 | P1 |
| FE-RPT-002 | HR dashboard KPI cards | Reporting | Sprint 6 | P1 |
| FE-REC-001 | Recruitment Kanban drag-and-drop | Recruitment | Sprint 7 | P0 |
| FE-REC-002 | Public careers page and application | Recruitment | Sprint 7 | P0 |
| FE-PERF-001 | OKR tree view and check-in | Performance | Sprint 8 | P1 |
| FE-PERF-002 | Performance review form and submit | Performance | Sprint 8 | P1 |
| FE-LMS-001 | Course catalog browse and enroll | Learning | Sprint 9 | P1 |
| FE-LMS-002 | Skills matrix heatmap | Learning | Sprint 9 | P2 |
| FE-ESS-001 | ESS home page and pending tasks | ESS Portal | Sprint 6 | P0 |
| FE-ESS-002 | Employee self-service profile update | ESS Portal | Sprint 6 | P1 |
| FE-OFF-001 | Offboarding portal and checklist | Offboarding | Sprint 11 | P1 |
| FE-FORM-001 | Form inline validation cross-module | Cross-module | Sprint 1 | P0 |
| FE-FORM-002 | Form double-submission prevention | Cross-module | Sprint 1 | P0 |
| FE-ERR-001 | API error state handling | Error Handling | Sprint 1 | P0 |
| FE-ERR-002 | Empty state pages | Error Handling | Sprint 1 | P1 |
| FE-PERF-001 | Skeleton loaders and CLS | Performance | Sprint 6 | P1 |
| FE-PERF-002 | Large data table performance | Performance | Sprint 6 | P1 |
| FE-A11Y-001 | axe-core WCAG 2.1 AA all pages | Accessibility | Sprint 6 | P1 |
| FE-A11Y-002 | Color not sole status indicator | Accessibility | Sprint 6 | P1 |

---

*HR Management System — Frontend Regression Test Case Suite v1.0*  
*47 test cases · 17 modules · V1 MVP + V2 · Industry-standard format*  
*Document ID: HRMS-FE-RTC-001*
