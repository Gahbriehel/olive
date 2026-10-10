# Olive Product Roadmap

> **Paired with Backend:** [Dove API](../../dove) (`/dove`)  
> **Status Date:** October 2026  
> **Current Platform Phase:** **Phase 1 Complete ✅ · Phase 2 In Progress 🚧**

---

## Overview

Olive is the frontend monorepo (Admin dashboard, Public web app, Shared packages) paired with the **Dove** backend REST API (`/dove`). This roadmap tracks the product phases across both repositories, mapping backend capabilities directly to frontend experiences.

> **Note on Roadmaps:**  
> - **Product Roadmap (this document):** Overall system functionality spanning Olive and Dove (Phase 1–4).  
> - **UI Remediation Roadmap:** Frontend design system, accessibility, and refactoring milestones documented in [`docs/architecture.md`](./architecture.md#8-ui-remediation-roadmap) (Phases 0–5, all complete).

---

## Phase Summary

| Phase | Title | Focus | Backend (Dove) | Frontend (Olive) |
|---|---|---|---|---|
| **Phase 1** | **Church Events Platform** | Youth Conference & event lifecycle management | **Completed & Verified** ✅ | **Completed & Verified** ✅ |
| **Phase 2** | **Church Relationship Platform** | Visitor retention, member profiles, magic link, follow-up, departments | **In Progress** 🚧 | **In Progress / Scoped** 🚧 |
| **Phase 3** | **Church Lifestyle Platform** | Member engagement, PWA, devotionals, sermons, giving, prayer requests | Planned 📅 | Planned 📅 |
| **Phase 4** | **Church Operating System** | Multi-church SaaS, finance, workforce, enterprise analytics | Planned 📅 | Architecture documented 📑 |

---

## Phase 1 — Church Events Platform ✅

### Goal
Successfully power the Youth Conference and church event operations: from public registration and team assignment to on-the-day QR desk check-in, competitive games scoring, live leaderboard, and attendee directory.

### Status: **Completed & Verified**

Both the Dove backend and Olive frontend have achieved complete Phase 1 parity and verification.

### Phase 1 Matrix: Frontend vs Backend Pairing

| Domain / Capability | Backend Endpoint(s) in Dove | Olive Admin (`apps/admin`) | Olive Web (`apps/web`) |
|---|---|---|---|
| **Authentication & RBAC** | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/profile`, `PATCH /auth/change-password` | JWT auth, Redux auth slice, refresh rotation interceptor, route guards (`SUPER_ADMIN`, `ADMIN`, `COORDINATOR`, `REGISTRATION_DESK`) | Anonymous / Public only |
| **Events Management** | `GET /events` (public), `POST/PATCH/DELETE /events`, `GET /events/:id` | Full event lifecycle (`/events`, `/events/[id]`), draft/published status, capacity, flyer image uploads | Public events catalog (`/events`) and event detail (`/events/[id]`) |
| **Event Registration** | `POST /events/:id/register` (public), `GET /registrations`, `GET /registrations/export` | Registration directory (`/registrations`), filters, status chips, export to CSV, registration details modal | Public modal registration on `/events/[id]`, balanced team assignment, confirmation with QR token |
| **Teams Management** | `GET/POST/PATCH/DELETE /teams`, `GET /teams/export` | Teams dashboard (`/teams`), color badges, member rosters, church-isolated CRUD | Rendered in event details and leaderboard |
| **QR Check-in & Tooling** | `POST /attendance/checkin`, `GET /qr/:token.png` | Camera QR scanner (`QrScannerModal`), manual code entry, duplicate check-in prevention | QR pass rendering on successful registration and email confirmations |
| **Attendance Desk** | `GET /attendance`, `GET /attendance/export`, `DELETE /attendance/:id` | Desk logs (`/attendance`), staff attribution, CSV export, undo check-in action | N/A |
| **Games & Scoring** | `GET/POST/PATCH/DELETE /games`, `POST /scores`, `PATCH /scores/:id`, `DELETE /scores/game/:id` | Games manager (`/games`), score input overlay with `maxScore` validation, score reset | N/A |
| **Leaderboard** | `GET /scores/leaderboard/:eventId`, `GET /scores/leaderboard/:eventId/export` | Live podium & table ranking (`/leaderboard`), CSV export | Public real-time leaderboard (`/leaderboard/[eventId]`) |
| **People Database** | `GET/POST/PATCH/DELETE /people`, `GET /people/export` | Directory (`/people`), demographic breakdown cards, status tags (`VISITOR`, `MEMBER`, `WORKER`, `LEADER`) | N/A |
| **Messaging & Logs** | `GET /email/logs`, `POST /email/broadcast`, `GET /email/bounces` | Messaging Center (`/messaging-center`), broadcast composer (`EmailComposer`), email logs viewer | Public contact forms (`/contact`) |
| **Reports** | `GET /birthdays`, `GET /email/bounces` | Birthday greetings (`/reports/birthdays`), bounce remediations (`/reports/bounces`) | N/A |

---

## Phase 2 — Church Relationship Platform 🚧

### Goal
Turn one-time event attendees and visitors into known, connected church members. Every `Person` record created in Phase 1 can now self-serve their profile, receive pastoral follow-up, join ministries/departments, and progress along the discipleship path.

### Key Architectural Decisions

1. **Self-Service Profile Portal (Public)**
   - Members scan a QR code or tap a link to claim and edit their profile without requiring a username/password.
   - Flow: Enter email/phone → receive magic link → open pre-filled profile → update details.
2. **Passwordless Magic Link Auth**
   - Public endpoints on Dove (`POST /profile/claim`, `GET /profile/:token`, `PATCH /profile/:token`).
   - Short-lived token (`profileToken` with 30-min expiry) on `Person`.
3. **PWA Introduction (`dove-app` / Member Portal)**
   - PWA install prompt triggers immediately upon saving profile ("Profile saved — install app to stay connected").
   - Creates the install base for Phase 3 engagement features.
4. **Visitor → Member Promotion**
   - Admin-only action in Olive Admin (`POST /people/:id/promote`).
   - Guarded by profile completeness (requires email or phone). Prevents ghost records from being promoted.
5. **Visitor Follow-up Tracking**
   - Pastoral care tracking on `Person`: notes, last contacted date, and status (`PENDING`, `IN_PROGRESS`, `CONVERTED`, `INACTIVE`).
6. **Department Management**
   - Ministries/serving units (Choir, Media, Ushers, etc.) with `DepartmentMembership` assignments.

### Phase 2 Implementation Scope & Deliverables

#### 1. Olive Admin Dashboard (`apps/admin`)
- [ ] **Visitor Promotion Action**: Promote button in `PersonForm` / `PersonDetailsModal` calling `POST /people/:id/promote` with target status (`MEMBER`, `WORKER`, `LEADER`).
- [ ] **Follow-up Workflow**:
  - Filter visitors by `followUpStatus` (`PENDING`, `IN_PROGRESS`, `CONVERTED`, `INACTIVE`) on `/people`.
  - Pastoral notes editor and last contacted timestamp logger.
  - Follow-up queue view / tab for ministry team.
- [ ] **Department Management**:
  - New route `/departments` (or tab under settings/people): CRUD for church departments.
  - Department assignment modal for people.
  - Filter people directory by department.
- [ ] **Weekly Service Attendance**:
  - Weekly attendance tracking interface (Sunday service attendance separate from event attendance).
  - Trend reporting for recurring attendance.
- [ ] **Segmented Email Broadcasts**:
  - Messaging Center recipient filters: by `membershipStatus`, `followUpStatus`, and `departmentId`.

#### 2. Public Member Portal / PWA Frontend
- [ ] **Magic Link Profile Claim**: Entry screen to request magic link via email/phone.
- [ ] **Pre-filled Profile Form**: Editing first name, last name, phone, gender, date of birth, address.
- [ ] **PWA Install Prompt**: Contextual prompt triggered upon successful profile completion.

#### 3. Shared Types Package (`packages/types`)
- [ ] Add `Department` and `DepartmentMembership` interfaces.
- [ ] Add `FollowUpStatus` enum (`PENDING`, `IN_PROGRESS`, `CONVERTED`, `INACTIVE`).
- [ ] Add `PromotePersonPayload` and `ProfileClaimPayload` DTOs.
- [ ] Add Weekly Attendance contracts.

---

## Phase 3 — Church Lifestyle Platform 📅

### Goal
Provide members with daily connection to the church via the installed PWA.

### Planned Modules
- **Daily Devotionals**: Daily reading plans and reflections.
- **Sermons & Media**: Audio/video sermon library with tagging.
- **Digital Giving**: Secure tithes, offerings, and special project donations.
- **Prayer Requests**: Member submission and pastoral prayer chain management.
- **Push Notifications**: Event reminders, service updates, and urgent prayer alerts.
- **Church Calendar**: Unified congregational calendar and service schedules.

---

## Phase 4 — Church Operating System 📅

### Goal
Scale the platform to multi-church networks and denominations with enterprise operations.

### Planned Modules
- **Multi-Tenant SaaS**: Tenant isolation, custom subdomains, branded public websites (detailed in [`docs/multi-tenancy-architecture.md`](./multi-tenancy-architecture.md)).
- **Church Finances & Accounting**: Ledger, budgets, expense approvals, donor tax statements.
- **Workforce & Volunteer Scheduling**: Rota management, check-in for volunteers, clash detection.
- **Executive Analytics & Reporting**: Demographic growth, retention curves, giving trends.
