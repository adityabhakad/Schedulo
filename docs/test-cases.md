# Schedulo Verification & Test Case Documentation

This document contains empirical test cases verified against the **Schedulo** codebase and running Node.js REST backend connected to **MongoDB Atlas**.

---

## 🔑 1. Authentication & Authorization Test Cases

| Test ID | Test Case | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | User Registration (`POST /api/auth/register`) | Creates new user document in MongoDB Atlas with Bcrypt hashed password and returns JWT token | User created with ID and valid JWT token | **PASS** |
| **AUTH-02** | Duplicate User Registration | Rejects request with HTTP 400 Bad Request and error message *"User already exists with this email address"* | HTTP 400 returned with exact message | **PASS** |
| **AUTH-03** | Valid User Login (`POST /api/auth/login`) | Verifies password hash and returns JWT Bearer token | HTTP 200 returned with valid JWT token | **PASS** |
| **AUTH-04** | Invalid Password Login | Rejects login with HTTP 401 Unauthorized | HTTP 401 returned: *"Invalid email or password"* | **PASS** |
| **AUTH-05** | Protected Route Without JWT Header | Access to `/api/appointments` rejected with HTTP 401 Unauthorized | HTTP 401 returned: *"Not authorized, no token provided"* | **PASS** |
| **AUTH-06** | Role Authorization Check (`authorize('admin')`) | Non-admin user attempting to access `/api/dashboard/appointments-summary` rejected with HTTP 403 Forbidden | HTTP 403 returned: *"User role 'user' is not authorized to access this route"* | **PASS** |

---

## 📅 2. Appointment Booking & Validation Test Cases

| Test ID | Test Case | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **APP-01** | Valid Appointment Booking (`POST /api/appointments`) | Creates new appointment document in MongoDB Atlas with calculated `endTime` and status `PENDING` | Created appointment document in MongoDB Atlas | **PASS** |
| **APP-02** | Past Date Appointment Booking | Rejects booking for past date with HTTP 400 status *"Appointment date cannot be in the past"* | HTTP 400 returned with exact message | **PASS** |
| **APP-03** | Overlapping Double Booking Prevention | Rejects booking request that overlaps with existing staff appointment interval with HTTP 400 | HTTP 400 returned: *"Staff member already has an appointment booked between..."* | **PASS** |
| **APP-04** | Non-Working Day Booking | Rejects booking request if staff member does not work on requested weekday | HTTP 400 returned: *"Staff member does not work on..."* | **PASS** |
| **APP-05** | Out of Working Hours Booking | Rejects booking request outside staff working shift window (09:00 - 17:00) | HTTP 400 returned: *"Appointment start time must be within working hours"* | **PASS** |
| **APP-06** | Non-Existent Staff ID | Rejects request with HTTP 404 Not Found *"Staff member not found"* | HTTP 404 returned | **PASS** |
| **APP-07** | Non-Existent Service ID | Rejects request with HTTP 404 Not Found *"Service not found"* | HTTP 404 returned | **PASS** |
| **APP-08** | Appointment Status Approval (`CONFIRMED`) | Staff approves request; status updates to `CONFIRMED` in MongoDB Atlas | Status updated to `CONFIRMED` in MongoDB Atlas | **PASS** |
| **APP-09** | Appointment Status Rejection (`REJECTED`) | Staff rejects request with reason; status updates to `REJECTED` | Status updated with `rejectionReason` stored | **PASS** |
| **APP-10** | Appointment Rescheduling (`RESCHEDULED`) | Staff reschedules request to new date/time; status updates to `RESCHEDULED` | Status updated with new date & time | **PASS** |
| **APP-11** | Appointment Completion (`COMPLETED`) | Staff marks visit completed; status updates to `COMPLETED` | Status updated to `COMPLETED` | **PASS** |
| **APP-12** | Client Cancellation (`CANCELLED`) | Client cancels pending/confirmed booking; status updates to `CANCELLED` | Status updated to `CANCELLED` in MongoDB | **PASS** |
| **APP-13** | Invalid Status Transition | Attempting to update a `COMPLETED` appointment rejected with HTTP 400 | HTTP 400 returned: *"Cannot change status of a completed appointment"* | **PASS** |

---

## 📊 3. Executive Dashboard & Analytics Test Cases

| Test ID | Test Case | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DASH-01** | User Dashboard Stats API (`GET /api/dashboard/stats`) | Returns total appointments, pending, confirmed, completed, and next appointment spotlight | HTTP 200 returned with correct MongoDB aggregations | **PASS** |
| **DASH-02** | Admin Monthly Summary Aggregation | `$group` pipeline aggregates monthly revenue and status counts | HTTP 200 returned with monthly aggregation array | **PASS** |
| **DASH-03** | Staff Workload Aggregation | `$lookup` and `$group` pipeline calculates appointment distribution per staff member | HTTP 200 returned with staff breakdown | **PASS** |
| **DASH-04** | Service Performance Aggregation | Aggregates booking volume and gross revenue per service category | HTTP 200 returned with category breakdown | **PASS** |

---

## 💻 4. Frontend UI & Form Validation Test Cases

| Test ID | Test Case | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Quick Demo Access One-Click Login | Pre-fills credentials and runs standard login flow to issue JWT | Token received; user logged in seamlessly | **PASS** |
| **UI-02** | Selected Card Visual Feedback | Selected service/staff card displays glowing ring border & checkmark badge | `ring-2 ring-brand-500` & checkmark badge rendered | **PASS** |
| **UI-03** | User Dashboard In-Place Filtering | Clicking Pending/Confirmed/Completed stat cards filters appointments table in-place | Table updates immediately to show matching status | **PASS** |
| **UI-04** | Responsive Layout Verification | Layout adapts seamlessly from desktop grid to mobile stacked navigation | Clean responsive rendering verified | **PASS** |
| **UI-05** | Form Submission Loading Spinner | Disables button and displays animated loader state during API requests | Button disabled; spinner active during async calls | **PASS** |
| **UI-06** | Toast Error Notifications | Displays red error toast banner on API rejection | Toast banner displayed with exact error text | **PASS** |
