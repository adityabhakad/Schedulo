# Schedulo Sample & Seed Data Documentation

This document describes the pre-populated seed data created by running the automated seeder script (`npm run seed`).

---

## 🔒 Security Note
All passwords documented below refer to local demo testing accounts. No production database passwords, JWT secret keys, or cloud Atlas connection credentials are contained in this document.

---

## ⚡ Seed Command Execution

To populate your MongoDB Atlas database with initial demo accounts, services, staff, and appointments, run:

```bash
npm run seed
```

Output:
```text
Connecting to MongoDB Atlas...
MongoDB Connected!
Clearing existing database collections...
Seeding Users... Created 10 users.
Seeding Services... Created 5 services.
Seeding Staff... Created 3 staff members.
Generating realistic Appointments dataset... Created 24 appointments successfully!
```

---

## 👤 1. Demo User Accounts

| Role | Name | Email Address | Demo Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Admin Master | `admin@schedulo.com` | `password123` | Master system oversight, staff/service management, analytics |
| **Staff** | Dr. Evelyn Vance | `staff.vance@schedulo.com` | `password123` | Medical specialist appointment management & approval |
| **Staff** | Marcus Holloway | `staff.marcus@schedulo.com` | `password123` | Tech consulting specialist appointment management |
| **Staff** | Sophia Chen | `staff.sophia@schedulo.com` | `password123` | Wellness specialist appointment management |
| **User** | Alice Johnson | `user.alice@schedulo.com` | `password123` | Standard client account for appointment booking |
| **User** | Bob Smith | `user.bob@schedulo.com` | `password123` | Standard client account |
| **User** | Catherine Miller | `user.catherine@schedulo.com` | `password123` | Standard client account |
| **User** | David Taylor | `user.david@schedulo.com` | `password123` | Standard client account |
| **User** | Emma Watson | `user.emma@schedulo.com` | `password123` | Standard client account |
| **User** | Frank Ocean | `user.frank@schedulo.com` | `password123` | Standard client account |

---

## 💼 2. Catalog Services Data

| Service Name | Category | Duration | Price (USD) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **General Health Consultation** | Medical | 30 Mins | $120 | Comprehensive annual physical assessment & screening |
| **Specialist Dental Cleaning & Scaling** | Dental | 45 Mins | $180 | Deep dental plaque removal & fluoride treatment |
| **Executive Tech Strategy Advisory** | Consulting | 60 Mins | $350 | Enterprise architecture assessment & AI roadmap |
| **Therapeutic Deep Tissue Massage** | Wellness | 60 Mins | $150 | Targeted muscle tension relief & recovery therapy |
| **Financial Advisory & Wealth Planning** | Finance | 45 Mins | $250 | Portfolio diversification & retirement planning |

---

## 👨‍⚕️ 3. Staff Specialists Data

| Specialist Name | Department | Specialization | Shift Hours | Working Days |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Evelyn Vance** | Healthcare & Medicine | Internal Medicine & Cardiology | 09:00 - 17:00 | Mon, Tue, Wed, Thu, Fri |
| **Marcus Holloway** | Technology Consulting | Cloud Infrastructure & Enterprise AI | 09:00 - 17:00 | Mon, Tue, Wed, Thu, Fri |
| **Sophia Chen** | Wellness & Rehabilitation | Physiotherapy & Sports Wellness | 10:00 - 18:00 | Mon, Tue, Wed, Thu, Fri, Sat |

---

## 📅 4. Sample Appointment Dataset

The seeder generates 24 realistic appointment records distributed across all 6 status states:
- **`PENDING`**: Appointment requests submitted by clients awaiting staff review.
- **`CONFIRMED`**: Appointments approved by staff members.
- **`REJECTED`**: Requests declined with staff rejection rationale.
- **`RESCHEDULED`**: Appointments adjusted to new date/time windows.
- **`COMPLETED`**: Visits completed successfully (factored into gross revenue analytics).
- **`CANCELLED`**: Appointments cancelled by clients.
