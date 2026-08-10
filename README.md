# Schedulo – Smart Appointment Management Platform

Schedulo is a full-stack enterprise appointment management platform built on the **MERN stack** (MongoDB, Express.js, React, Node.js). It replaces manual scheduling workflows with an intelligent, role-based platform featuring multi-step appointment booking, backend overlap validation, staff working-hours enforcement, and analytics dashboards.

---

## 🌟 Key Features

### 👤 User (Client) Capabilities
- **Multi-Step Booking Wizard**: 5-step appointment booking workflow (Select Service → Select Staff Specialist → Select Date → Choose Open Time Slot → Notes → Review & Confirm).
- **Conflict Prevention**: Backend validation ensures appointments never conflict with staff schedules or user calendars.
- **My Appointments Portal**: Filter, view details, track status transitions, and cancel eligible pending/confirmed bookings.
- **Profile Customization**: Update contact details and avatar media.

### 💼 Staff Specialist Capabilities
- **Staff Portal Dashboard**: Overview of today's schedule agenda and workload KPIs.
- **Appointment Action Queue**: Review incoming pending requests with 1-click **Approve**, **Reject** (with reason prompt), or **Reschedule** (with date/time pickers).
- **Completion Tracking**: Mark confirmed visits as **COMPLETED**.
- **Daily Agenda View**: Visual calendar agenda breakdown.

### 🛡️ Admin Executive Capabilities
- **Executive Analytics Dashboard**: Top-level platform KPIs (Users, Staff, Services, Appointments, Revenue).
- **Interactive Visualizations**:
  - **Pie Chart**: Appointment Status Distribution (`CONFIRMED`, `PENDING`, `COMPLETED`, `CANCELLED`, `REJECTED`, `RESCHEDULED`).
  - **Area Chart**: Monthly Appointment Volume Trends.
  - **Bar Chart**: Staff Workload & Demand Distribution.
  - **Service Performance Table**: Revenue generation and total bookings ranking per service.
- **Full CRUD Management**: Manage Users, Staff Specialists (working hours, working days, active state), Services Catalog, and Master Appointments Table with status override controls.

---

## 🏗️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6
- **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM)
- **Security & Auth**: JWT (JSON Web Tokens), bcryptjs password hashing, Helmet security headers, CORS, rate limiting
- **Database**: MongoDB with automatic in-memory fallback (`mongodb-memory-server`) for zero-setup execution out of the box.

---

## 🔑 Demo Credentials

All accounts use password: **`password123`**

| Role | Email | Description |
| :--- | :--- | :--- |
| **Admin** | `admin@schedulo.com` | Master system control panel & analytics |
| **Staff 1** | `staff.vance@schedulo.com` | Dr. Evelyn Vance (Internal Medicine & Cardiology) |
| **Staff 2** | `staff.marcus@schedulo.com` | Marcus Holloway (Cloud Infrastructure & Enterprise AI) |
| **Staff 3** | `staff.sophia@schedulo.com` | Sophia Chen (Physiotherapy & Sports Wellness) |
| **User 1** | `user.alice@schedulo.com` | Alice Johnson (Client User) |
| **User 2** | `user.bob@schedulo.com` | Bob Smith (Client User) |

*(Quick 1-Click Demo Buttons are also available on the Sign In page for seamless demonstration).*

---

## 🎬 Step-by-Step Live Demo Flow

To demonstrate the full end-to-end platform capabilities during an interview:

1. **Admin Walkthrough**:
   - Sign in as **Admin** (`admin@schedulo.com`).
   - View top KPIs, status pie chart, monthly trends, and staff workload distribution.
   - Navigate to **Manage Services** to inspect or create services.
2. **Client Booking Flow**:
   - Sign in as **User** (`user.alice@schedulo.com`).
   - Click **Book Appointment** and complete the 5-step booking wizard.
   - Select service, staff specialist, date, open slot, and submit reason.
   - See appointment status created as `PENDING`.
3. **Staff Review & Approval Flow**:
   - Sign in as **Staff** (`staff.vance@schedulo.com`).
   - Inspect **Pending Action Requests**. Click **Approve** (Status updates to `CONFIRMED`).
   - Mark as **Completed** once visit concludes (Status updates to `COMPLETED`).
4. **Client Verification**:
   - Sign back in as **User** (`user.alice@schedulo.com`) and verify status in **My Appointments**.

---

## 🧠 Technical Interview Guide & Architecture FAQ

### 1. Why MERN Stack?
- **Single-Language Ecosystem**: JavaScript/ES Modules across both client and server reduces context switching and enables shared utility code (e.g. time formatting, status constants).
- **JSON Native Data Flow**: MongoDB documents map 1:1 to Express JSON responses and React component state without ORM translation overhead.
- **Event-Driven Non-Blocking I/O**: Node.js handles concurrent I/O requests efficiently.

### 2. How Are Appointment Conflicts Prevented?
- **Interval Overlap Formula**: Two time intervals `[start1, end1]` and `[start2, end2]` overlap if and only if:
  $$\text{Overlap} = (start_1 < end_2) \land (end_1 > start_2)$$
- **Server-Side Enforcement**: Before creating or confirming an appointment, the backend queries active appointments for the staff member on that date (`PENDING`, `CONFIRMED`, `RESCHEDULED`) and evaluates interval overlap in minutes from midnight.

### 3. How Does Authentication & Authorization Work?
- **Password Security**: Passwords are hashed before database save using `bcryptjs` with salt factor 10. `select: false` prevents accidental password leakage in API queries.
- **JWT Tokens**: Signed tokens containing user `id` are returned on authentication.
- **Middleware Chain**: `protect` middleware verifies token in the `Authorization: Bearer <token>` header, attaching `req.user`. `authorize(...roles)` validates role permissions before hitting controller logic.

### 4. How Could the Platform Scale in Production?
- **Database Indexing**: Compound indexes on `{ staff: 1, appointmentDate: 1, status: 1 }` ensure conflict checks perform sub-millisecond index scans.
- **Caching Layer**: Redis can cache calculated open time slots for staff members (`GET /api/staff/:id/slots`) with cache invalidation on new bookings.
- **Stateless Microservices**: Express servers are stateless, allowing horizontal scaling behind an Nginx load balancer.

---

## ⚙️ Local Installation & Run Commands

```bash
# 1. Install all dependencies
npm run setup

# 2. Seed database with realistic demo data
npm run seed

# 3. Start Backend Server (port 5000)
npm run server

# 4. Start React Frontend (port 3000)
npm run client
```
