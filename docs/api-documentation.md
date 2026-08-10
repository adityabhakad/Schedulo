# Schedulo API Documentation

This document describes all implemented **REST API Endpoints** for the **Schedulo Smart Appointment Management Platform**.

All API routes are prefixed with `/api`. Protected routes require a valid **JWT Bearer Token** passed in the HTTP Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔐 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
- **Purpose**: Registers a new user account in MongoDB Atlas.
- **Authentication**: Public
- **Role Requirement**: None
- **Request Body**:
  ```json
  {
    "name": "Alice Johnson",
    "email": "user.alice@schedulo.com",
    "password": "password123",
    "phone": "+1-555-0201"
  }
  ```
- **Successful Response (210 / 201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "66b73a21058b52df9c8f1801",
      "name": "Alice Johnson",
      "email": "user.alice@schedulo.com",
      "role": "user",
      "phone": "+1-555-0201",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "success": false, "message": "User already exists with this email address" }`

---

### `POST /api/auth/login`
- **Purpose**: Verifies client email & bcrypt password hash and issues a signed JWT token.
- **Authentication**: Public
- **Role Requirement**: None
- **Request Body**:
  ```json
  {
    "email": "user.alice@schedulo.com",
    "password": "password123"
  }
  ```
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "66b73a21058b52df9c8f1801",
      "name": "Alice Johnson",
      "email": "user.alice@schedulo.com",
      "role": "user",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{ "success": false, "message": "Invalid email or password" }`

---

### `GET /api/auth/me`
- **Purpose**: Fetches currently authenticated user's profile details.
- **Authentication**: Required (`protect`)
- **Role Requirement**: Any authenticated role (`user`, `staff`, `admin`)
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "66b73a21058b52df9c8f1801",
      "name": "Alice Johnson",
      "email": "user.alice@schedulo.com",
      "role": "user",
      "phone": "+1-555-0201"
    }
  }
  ```

---

## 👥 2. User Management Endpoints (`/api/users`)

### `GET /api/users`
- **Purpose**: Retrieves a list of registered users with optional search filtering.
- **Authentication**: Required (`protect`)
- **Role Requirement**: `admin`
- **Query Parameters**:
  - `search`: Filter by name or email string
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "66b73a21058b52df9c8f1801",
        "name": "Alice Johnson",
        "email": "user.alice@schedulo.com",
        "role": "user",
        "phone": "+1-555-0201",
        "isActive": true
      }
    ]
  }
  ```

---

### `GET /api/users/:id`
- **Purpose**: Retrieves a single user profile by ID.
- **Authentication**: Required (`protect`)
- **Role Requirement**: Authenticated user or Admin

---

### `PUT /api/users/:id`
- **Purpose**: Updates user profile information (name, phone, role, status).
- **Authentication**: Required (`protect`)

---

### `DELETE /api/users/:id`
- **Purpose**: Deactivates/removes a user account.
- **Authentication**: Required (`protect`)
- **Role Requirement**: `admin`

---

## 👨‍⚕️ 3. Staff Endpoints (`/api/staff`)

### `GET /api/staff`
- **Purpose**: Retrieves all active staff specialists with optional department search.
- **Authentication**: Public / Optional
- **Query Parameters**: `department`, `search`, `isActive`
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "_id": "66b73a21058b52df9c8f1810",
        "name": "Dr. Evelyn Vance",
        "email": "staff.vance@schedulo.com",
        "department": "Healthcare & Medicine",
        "specialization": "Internal Medicine & Cardiology",
        "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "workingHours": { "start": "09:00", "end": "17:00" },
        "isActive": true
      }
    ]
  }
  ```

---

### `GET /api/staff/:id/slots`
- **Purpose**: Dynamically computes available 30-60 min time slots for a given staff member, date, and service duration while excluding already booked slots in MongoDB.
- **Authentication**: Public
- **Query Parameters**:
  - `date`: `YYYY-MM-DD` (Required)
  - `serviceId`: Service ObjectId (Required)
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "dayAvailable": true,
    "slots": [
      { "startTime": "09:00", "endTime": "09:30" },
      { "startTime": "09:30", "endTime": "10:00" },
      { "startTime": "10:00", "endTime": "10:30" }
    ]
  }
  ```

---

### `POST /api/staff` | `PUT /api/staff/:id` | `DELETE /api/staff/:id`
- **Purpose**: Administrative CRUD endpoints for staff catalog management.
- **Authentication**: Required (`protect`)
- **Role Requirement**: `admin`

---

## 📋 4. Service Catalog Endpoints (`/api/services`)

### `GET /api/services`
- **Purpose**: Retrieves active services catalog.
- **Query Parameters**: `category`, `search`, `isActive`
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "66b73a21058b52df9c8f1820",
        "name": "General Health Consultation",
        "duration": 30,
        "category": "Medical",
        "price": 120,
        "isActive": true
      }
    ]
  }
  ```

---

### `POST /api/services` | `PUT /api/services/:id` | `DELETE /api/services/:id`
- **Purpose**: Admin service creation, updates, and soft deletion.
- **Authentication**: Required (`protect`)
- **Role Requirement**: `admin`

---

## 📅 5. Appointment Endpoints (`/api/appointments`)

### `GET /api/appointments`
- **Purpose**: Retrieves appointments based on user role (Clients see their own; Staff see assigned; Admins see all).
- **Authentication**: Required (`protect`)
- **Query Parameters**: `status`, `date`, `search`
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "66b73a21058b52df9c8f1830",
        "user": { "_id": "66b73a21058b52df9c8f1801", "name": "Alice Johnson" },
        "staff": { "_id": "66b73a21058b52df9c8f1810", "name": "Dr. Evelyn Vance" },
        "service": { "_id": "66b73a21058b52df9c8f1820", "name": "General Health Consultation" },
        "appointmentDate": "2026-08-11T00:00:00.000Z",
        "startTime": "10:00",
        "endTime": "10:30",
        "status": "PENDING",
        "reason": "Annual physical checkup"
      }
    ]
  }
  ```

---

### `POST /api/appointments`
- **Purpose**: Creates a new appointment booking with backend validation for past dates, working days, working hours, and double-booking overlap.
- **Authentication**: Required (`protect`)
- **Request Body**:
  ```json
  {
    "service": "66b73a21058b52df9c8f1820",
    "staff": "66b73a21058b52df9c8f1810",
    "appointmentDate": "2026-08-11",
    "startTime": "10:00",
    "reason": "Annual checkup",
    "notes": "No allergies"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "success": false, "message": "Staff member Dr. Evelyn Vance already has an appointment booked between 10:00 and 10:30" }`

---

### `PATCH /api/appointments/:id/status`
- **Purpose**: Updates appointment status state (`CONFIRMED`, `REJECTED`, `RESCHEDULED`, `COMPLETED`, `CANCELLED`).
- **Authentication**: Required (`protect`)
- **Request Body**:
  ```json
  {
    "status": "CONFIRMED"
  }
  ```

---

## 📊 6. Analytics & Dashboard Endpoints (`/api/dashboard`)

### `GET /api/dashboard/stats`
- **Purpose**: Retrieves role-customized dashboard KPIs (Total appointments, pending requests, next visit, total revenue).
- **Authentication**: Required (`protect`)

### `GET /api/dashboard/appointments-summary`
- **Purpose**: MongoDB Aggregation pipeline returning monthly appointment status distributions for charts.
- **Authentication**: Required (`protect`)
- **Role Requirement**: `admin`

### `GET /api/dashboard/service-performance`
- **Purpose**: MongoDB Aggregation pipeline computing total bookings and revenue per service category.
- **Authentication**: Required (`protect`)
- **Role Requirement**: `admin`

### `GET /api/dashboard/staff-workload`
- **Purpose**: MongoDB Aggregation pipeline calculating appointment volume per staff member.
- **Authentication**: Required (`protect`)
- **Role Requirement**: `admin`
