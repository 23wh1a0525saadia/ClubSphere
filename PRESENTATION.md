# ClubSphere Presentation + Viva Guide

Use this file while presenting. It is structured so you can explain clearly and answer follow-up questions confidently.

---

## 1. Project Title
**ClubSphere: Campus Club and Event Management System**

### 20-second intro
ClubSphere is a full-stack MERN web application that helps colleges manage clubs, create events, and handle student registrations in one place. It supports role-based access for students and admins/presidents, with secure login, event lifecycle management, and MongoDB-backed data consistency.

---

## 2. Problem Statement
In many colleges, event handling is scattered across WhatsApp groups, posters, spreadsheets, and manual forms.

### Problems
- Students miss event updates.
- Duplicate or incorrect registrations happen.
- Admins cannot track participation in real time.
- Club and event data becomes inconsistent over time.

### Goal
Build one unified system for:
- Club discovery and membership
- Event creation and management
- Student registration and cancellation
- Admin visibility and control

---

## 3. Solution Overview
### What ClubSphere provides
- Authentication with JWT
- Roles: `student`, `admin`, `president`
- Clubs module: create/join/leave/manage
- Events module: create/update/delete/view
- Registrations module with lifecycle handling
- Profile and dashboard pages
- Data integrity repair script

---

## 4. Tech Stack
### Frontend
- React 18
- React Router v6
- Axios
- Custom CSS

### Backend
- Node.js
- Express 5
- Mongoose ODM
- JWT + bcryptjs

### Database
- MongoDB

### Why this stack
- Fast development and clear API separation
- Strong ecosystem and production support
- Mongoose validation + middleware for integrity

---

## 5. Architecture
```text
React UI (frontend)
    |
    | HTTP (Axios)
    v
Express API (backend)
    |
    | Mongoose
    v
MongoDB
```

### API route groups
- `/api/auth`
- `/api/clubs`
- `/api/events`
- `/api/registrations`
- `/api/announcements`
- `/api/stats`

Health check: `/api/health`

---

## 6. Core User Flows
### Student flow
1. Register/Login
2. Browse clubs and events
3. Register for event
4. View registrations
5. Cancel registration if needed
6. Re-register again if cancelled

### Admin/President flow
1. Login
2. Open dashboard
3. Create event (optionally from club context)
4. Manage events
5. View registration activity

---

## 7. Data Model Highlights
### Main collections
- `users`
- `clubs`
- `events`
- `registrations`
- `announcements`

### Important relationship decisions
- `clubs.members` links users to clubs
- `events.registrations` stores registration references
- `users.eventsRegistered` tracks user registrations
- `registrations` has unique index on `(event, student)`

---

## 8. Security and Access Control
### Authentication
- JWT token-based auth
- Passwords hashed using bcryptjs

### Authorization
- Role checks in middleware (`authorize`)
- Protected admin actions

### Validation
- Schema-level validations (email, enums, ranges)
- Controller-level checks (capacity, date order, role restrictions)

---

## 9. Data Integrity Work Done
This is a key strong point for viva.

### Integrity controls implemented
- Field normalization (trim/case checks)
- Cross-field validation (dates, capacity)
- Registration state consistency handling
- Re-registration support after cancellation
- Event/user registration reference sync

### Repair utility
`backend/repair-data-integrity.js`:
- fixes mismatched references
- recomputes counters
- removes invalid links

---

## 10. Important Bug Solved (Tell this if asked)
### Issue
After cancellation, some users were blocked with “Already registered” due to stale registration state/reference combinations.

### Fix
- Reactivate non-active/stale registration safely instead of failing.
- Ensure cancellation clears attendance state.
- Add endpoint to get current user’s registration status for specific event.
- Update event detail UI to use backend truth.

### Why it matters
Prevents user confusion and ensures realistic production behavior.

---

## 11. UI/UX Approach
### Final UI direction
- Simple, plain, and consistent card-based layout
- Reduced decorative noise
- Mobile responsive pages
- Clean hierarchy for admin and student pages

### Reasoning
The goal was professional clarity and easier navigation, especially for demo and deployment readiness.

---

## 12. Deployment Readiness
### Current status
- Frontend build compiles successfully
- Backend health endpoint available
- Environment variable setup supported (`.env` / `.env.example`)

### Required env vars
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `PORT`

### Deployment split
- Frontend: static build (`frontend/build`)
- Backend: Node service (`backend/index.js`)

---

## 13. Demo Script (5-7 minutes)
1. Show login and role behavior.
2. Show clubs page and open a club.
3. As admin, create an event from club context.
4. As student, register for event.
5. Show My Registrations.
6. Cancel and re-register to demonstrate lifecycle fix.
7. Show admin event management and stats.

---

## 14. Likely Viva Questions and Strong Answers

### Q1. Why MERN?
MERN gives a fast full-stack workflow with JavaScript everywhere, clear frontend-backend separation, and a mature ecosystem for authentication, routing, and database integration.

### Q2. How is authentication secured?
Passwords are hashed with bcryptjs before storage, and JWT is used for authenticated API access. Protected routes verify token validity and role authorization.

### Q3. How do you prevent duplicate event registration?
`registrations` has a unique index on `(event, student)`. Controller logic also checks existing records and handles reactivation for cancelled/stale registrations safely.

### Q4. What happens when a user cancels registration?
Registration status becomes `cancelled`, attendance fields are reset, and references/counters are updated so event capacity and user history remain consistent.

### Q5. How do you ensure data consistency across collections?
Controllers update linked references (`Event`, `User`, `Registration`), and a dedicated repair script reconciles and repairs mismatches.

### Q6. What is role-based access in your project?
Students can browse/join/register. Admins/presidents can create/manage clubs/events. Authorization middleware enforces role permissions at API level.

### Q7. How do you handle errors?
Backend has centralized error handling middleware and returns consistent JSON responses. Frontend displays meaningful messages for user actions.

### Q8. How is project scalable?
Modular routes/controllers/models, clear API domains, and MongoDB indexes allow extending modules like notifications, approvals, payment, and analytics.

### Q9. What would you improve next?
- Refresh tokens / stricter auth policies
- Server-side pagination and search
- Audit logs and admin actions history
- Automated tests (unit + integration)
- CI/CD pipeline and monitoring

### Q10. How is this production-oriented and not just a demo?
It includes role security, validation, lifecycle bug fixes, integrity repair tooling, deployable build output, and realistic operational workflows (create/manage/register/cancel/re-register).

---

## 15. Project Limitations (Say honestly)
- No full automated test suite yet.
- No email/SMS notifications yet.
- Limited observability/analytics dashboard.

Stating these clearly usually improves evaluator confidence.

---

## 16. One-Minute Closing
ClubSphere solves a real campus management problem with a secure and structured MERN architecture. It supports both student and admin workflows, enforces data integrity, and is in a deployable state with practical features and validated event-registration lifecycle behavior.

---

## 17. Quick Backup Lines (If stuck)
- "I designed API permissions at middleware level to keep security centralized."
- "Data consistency was a key focus, so I added both runtime checks and a repair utility."
- "I intentionally simplified UI for clarity, maintainability, and real deployment readiness."
- "The registration lifecycle edge cases are handled now, including cancel and re-register scenarios."
