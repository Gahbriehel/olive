# Olive Roadmap Status Report

> **Status Date:** October 2026  
> **Repository Revision:** `main`  
> **Paired Backend:** [Dove API](../../dove) (`/dove`)  
> **Phase 1 Status:** **Completed & Verified** ✅  
> **Phase 2 Status:** **In Progress / Scoped** 🚧  

---

## Executive Summary

Olive has completed and verified **Phase 1: Church Events Platform** across all frontend applications (`apps/admin`, `apps/web`, and shared packages `packages/types`, `packages/ui`). The platform is fully paired with the Dove backend to deliver the Youth Conference and general church event workflows:

1. **Authentication & Session Security**: Full JWT authentication lifecycle in Admin, with access and refresh tokens, automatic refresh rotation on 401 via Axios interceptors, Redux auth slice, and RBAC guards covering Super Admin, Admin, Coordinator, and Registration Desk roles.
2. **Events Operations**: Complete event creation and editing with flyer image uploads, draft/published lifecycle, capacity monitoring, and public event discovery and browsing in `apps/web`.
3. **Public Registration Flow**: Public registration on `apps/web` with responsive modal, form validation, automatic Person deduplication (via Dove), balanced team allocation, and instant confirmation displaying registration number and downloadable/scannable QR pass.
4. **Attendance Desk & QR Scanner**: Dedicated registration desk interface (`/attendance`) in Admin with in-browser camera QR code scanner (`jsQR`), manual code entry, duplicate check-in rejection, check-in history log, CSV export, and undo check-in action.
5. **Teams, Games & Scoring**: Full team rosters with adaptive color badges, game configurations with `maxScore` validation, score management modal, and score resets.
6. **Live Leaderboards**: Dual implementation of the leaderboard — authenticated administrative view (`/leaderboard`) with export, and public live-updating leaderboard with visual podium in `apps/web` (`/leaderboard/[eventId]`).
7. **Congregation & People Database**: Central `Person` directory in Admin with demographic KPI cards (gender and membership breakdown), detailed profile modal, and streaming CSV exports.
8. **Communications & Operations**: Centralized Messaging Center (`/messaging-center`) with unified email composer (`EmailComposer`), email logs inspection, bounce remediation reports (`/reports/bounces`), upcoming birthdays tracking (`/reports/birthdays`), and public contact inquiries (`/contact`).
9. **UI & Code Quality Remediation**: Successfully completed all 6 phases (Phases 0–5) of the Admin UI remediation roadmap: 100% design token compliance, zero raw palette classes, robust dialogs/modals, unified `useListFilters`, and accessible form components.

---

## Evidence Snapshot

| Area | Current Evidence |
|---|---|
| **Applications** | 2 Next.js 16 applications (`apps/admin`, `apps/web`) + 2 workspace packages (`packages/types`, `packages/ui`). |
| **Backend Integration** | Configured via `NEXT_PUBLIC_API_URL` to Dove REST API (`http://localhost:3000/api/v1`). |
| **Type Check** | `bun run check-types`: **4/4 packages passed with zero errors** (`@olive/admin`, `@olive/web`, `@olive/types`, `@olive/ui`). |
| **Linting** | `bun run lint`: **Passed cleanly with zero errors** across all apps and packages. |
| **Design System** | Complete token migration in `apps/admin/globals.css`; lint enforced via `eslint.config.mjs` (`no-restricted-syntax`). |
| **UI Remediation** | Phases 0 through 5 marked **Done** in `docs/architecture.md`. |

---

## Phase 1 Frontend Implementation Matrix

| Roadmap Domain | Backend Pair (Dove) | Olive Implementation | Status | Verification |
|---|---|---|---|---|
| **Authentication & RBAC** | `POST /auth/login`<br>`POST /auth/refresh`<br>`GET /auth/profile` | `apps/admin/src/app/(auth)/login/page.tsx`<br>`apps/admin/src/utils/api-client.ts`<br>`apps/admin/src/utils/rbac.ts` | Complete | Token refresh on 401, role-based sidebar and route guarding, persistent session storage. |
| **Events** | `GET /events`<br>`POST /events`<br>`PATCH /events/:id`<br>`DELETE /events/:id` | `apps/admin/src/app/events/page.tsx`<br>`apps/admin/src/app/events/[id]/page.tsx`<br>`apps/web/src/app/events/page.tsx` | Complete | Event CRUD, flyer preview, date validation, published/draft status filters, capacity tracking. |
| **Registration** | `POST /events/:id/register`<br>`GET /registrations`<br>`GET /registrations/export` | `apps/web/src/components/events/RegisterModal.tsx`<br>`apps/admin/src/app/registrations/page.tsx` | Complete | Public self-registration, team allocation, QR pass display, admin table with pagination and CSV export. |
| **Teams** | `GET /teams`<br>`POST /teams`<br>`PATCH /teams/:id`<br>`DELETE /teams/:id` | `apps/admin/src/app/teams/page.tsx`<br>`apps/admin/src/components/Forms/TeamsForm.tsx` | Complete | Team CRUD, automatic badge color contrast, member count display, CSV export. |
| **QR Desk & Scanner** | `POST /attendance/checkin`<br>`GET /qr/:token.png` | `apps/admin/src/components/modals/QrScannerModal.tsx`<br>`apps/admin/src/app/attendance/page.tsx` | Complete | WebRTC camera scanning, sound feedback, duplicate rejection, manual registration code fallback. |
| **Attendance Operations** | `GET /attendance`<br>`GET /attendance/export`<br>`DELETE /attendance/:id` | `apps/admin/src/app/attendance/page.tsx`<br>`apps/admin/src/services/attendance.service.ts` | Complete | Real-time check-in logs, staff attribution badges, check-in reversal with `ConfirmActionModal`, CSV export. |
| **Games & Scoring** | `GET /games`<br>`POST /games`<br>`POST /scores`<br>`DELETE /scores/game/:id` | `apps/admin/src/app/games/page.tsx`<br>`apps/admin/src/components/modals/ManageScoresModal.tsx` | Complete | Game configuration, score bounds validation (`maxScore`), bulk score reset with danger confirmation. |
| **Leaderboard** | `GET /scores/leaderboard/:eventId`<br>`GET /scores/leaderboard/:eventId/export` | `apps/admin/src/app/leaderboard/page.tsx`<br>`apps/web/src/app/leaderboard/[eventId]/page.tsx` | Complete | Dynamic podium display (1st, 2nd, 3rd) and tabular rankings, CSV export in admin, real-time polling. |
| **People Directory** | `GET /people`<br>`POST /people`<br>`PATCH /people/:id`<br>`GET /people/export` | `apps/admin/src/app/people/page.tsx`<br>`apps/admin/src/components/Forms/PersonForm.tsx` | Complete | Demographic KPI aggregates, membership status filtering, edit modal, CSV export. |
| **Messaging & Email** | `GET /email/logs`<br>`POST /email/broadcast`<br>`GET /email/bounces` | `apps/admin/src/app/messaging-center/page.tsx`<br>`apps/admin/src/components/email/EmailComposer.tsx`<br>`apps/admin/src/components/modals/ViewEmailLogModal.tsx` | Complete | Broadcast email delivery, log inspection, HTML preview modal, bounce remediation workflow. |
| **Contact Submissions** | `GET /contact`<br>`PATCH /contact/:id` | `apps/admin/src/app/contact/page.tsx`<br>`apps/web/src/app/contact/page.tsx` | Complete | Public prayer & inquiry form, admin tabbed review table, status updating. |

---

## Phase 1 Success Criteria Verification

| Success Criterion (from `MVP_SCOPE.md`) | Frontend Verification in Olive | Status |
|---|---|---|
| Create and manage an event | Admin can create, edit, publish, and delete events with dates, flyers, and capacities on `/events`. | **Met** ✅ |
| Public registration | Users can register on `/events/[id]`, receive a registration number, balanced team, and QR pass. | **Met** ✅ |
| View registrations | Admin can search, filter by status/team, view attendee details, and export registrations. | **Met** ✅ |
| Assign teams | Admin manages teams; registrants are assigned automatically via backend rules. | **Met** ✅ |
| Generate and scan QR codes | QR pass rendered in web app; camera QR scanner in admin instantly checks in attendees. | **Met** ✅ |
| Check attendees in | Desk staff check attendees in via scanner or code; duplicate check-ins prompt warning; undo supported. | **Met** ✅ |
| Record game scores | Coordinators log scores against games and teams with `maxScore` enforcement on `/games`. | **Met** ✅ |
| Determine winning team | Live podium and rankings sort teams descending by total score on `/leaderboard`. | **Met** ✅ |
| Export participant data | One-click CSV export with UTF-8 BOM Excel compatibility across all major resource tables. | **Met** ✅ |
| Every participant is a Person | Registrants appear in `/people` with membership status, contact info, and activity history. | **Met** ✅ |

---

## Phase 2: Church Relationship Platform Readiness

With Phase 1 complete, Olive is prepared to pair with Dove's active Phase 2 initiatives:

### 1. Backend Dependencies (Dove)
- `Person` schema additions: `profileToken`, `profileTokenExpiresAt`, `followUpNotes`, `lastFollowUpAt`, `followUpStatus`.
- New endpoints:
  - `POST /profile/claim`, `GET /profile/:token`, `PATCH /profile/:token` (Public Profile Portal)
  - `POST /people/:id/promote` (Visitor → Member Promotion)
  - `GET/POST/PATCH/DELETE /departments` (Department Management)
  - `POST /departments/:id/members` (Department Assignments)

### 2. Frontend Work Ahead in Olive
1. **Admin People Directory Enhancements**:
   - Add "Promote" action button and dialog on `/people` with status picker (`MEMBER`, `WORKER`, `LEADER`).
   - Add Pastoral Follow-up tab/panel: follow-up notes editor, last-contacted timestamp, and status badges (`PENDING`, `IN_PROGRESS`, `CONVERTED`, `INACTIVE`).
2. **Department Management UI**:
   - New section in admin for ministries/departments and member assignment.
3. **PWA / Member Profile Portal**:
   - Deliver public magic link profile claim and edit screen with PWA installation prompt.
4. **Contract Types (`packages/types`)**:
   - Define Phase 2 models and payload types to maintain type-safe contracts with Dove.
