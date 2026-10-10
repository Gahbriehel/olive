# Olive Platform

> **Church Administration & Public Web Platform** — Frontend monorepo for church management, public engagement, event operations, and community connection.

Paired with the **[Dove API](../dove)** (`/dove`), the NestJS REST backend.

---

## Overview

Olive provides the modern frontend interfaces for a comprehensive Church Management System. Built as a high-performance monorepo, Olive contains both the authenticated administration dashboard used by church staff and leadership, and the public-facing church website used by congregation members, attendees, and visitors.

---

## Product Roadmap & Status

Olive is built in synchronized phases with the **Dove** backend:

| Phase | Name | Focus | Status |
|---|---|---|---|
| **Phase 1** | **Church Events Platform** | Youth Conference & event lifecycle, public registration, attendance desk, QR check-in, teams, games, live leaderboard, attendee directory | **Completed & Verified** ✅ |
| **Phase 2** | **Church Relationship Platform** | Self-service member profiles, magic link auth, PWA introduction, visitor follow-up, department/ministry management, weekly attendance | **In Progress** 🚧 |
| **Phase 3** | **Church Lifestyle Platform** | PWA engagement: devotionals, sermons, digital giving, prayer requests, push notifications, unified church calendar | Planned 📅 |
| **Phase 4** | **Church Operating System** | Multi-church SaaS, church finances, workforce/volunteer scheduling, enterprise analytics | Planned 📅 |

See [`docs/ROADMAP.md`](./docs/ROADMAP.md) for the complete multi-phase roadmap and [`docs/ROADMAP_STATUS.md`](./docs/ROADMAP_STATUS.md) for current implementation verification.

---

## System Architecture

```
                    ┌──────────────────────────────┐
                    │    Dove REST API (external)  │
                    │    /api/v1  ·  JWT auth      │
                    │    (NestJS 11 + Prisma 6)    │
                    └──────────────┬───────────────┘
                                   │ HTTPS / JSON
               ┌───────────────────┴───────────────────┐
               │                                       │
    ┌──────────▼──────────┐                 ┌──────────▼──────────┐
    │ apps/admin          │                 │ apps/web            │
    │ Staff dashboard     │                 │ Public church site  │
    │ (authenticated)     │                 │ (anonymous)         │
    └──────────┬──────────┘                 └──────────┬──────────┘
               │                                       │
               └───────────────┬───────────────────────┘
                               │ workspace deps
                   ┌───────────▼───────────┐
                   │ packages/types        │ API contract types
                   │ packages/ui           │ shared UI primitives
                   └───────────────────────┘
```

---

## Repository Structure

| Path | Purpose | Tech Stack |
|---|---|---|
| [`apps/admin`](./apps/admin) | Authenticated administrative portal for pastors, staff, desk workers, and coordinators. | Next.js 16 (App Router), React 19, Tailwind CSS v4, TanStack Query v5, Redux Toolkit, Headless UI |
| [`apps/web`](./apps/web) | Public-facing church website: landing, about, events catalog, event self-registration, public leaderboard, contact forms. | Next.js 16 (App Router), React 19, Tailwind CSS v4, TanStack Query v5 |
| [`packages/types`](./packages/types) | Shared TypeScript definitions representing the Dove REST API contract. | TypeScript |
| [`packages/ui`](./packages/ui) | Shared brand-neutral UI utilities (e.g. `cn()`). | TypeScript |
| [`docs/`](./docs) | System architecture, roadmap, and multi-tenancy documentation. | Markdown |

---

## Tech Stack & Tooling

- **Runtime & Workspaces:** Bun (`bun@1.3.13`)
- **Monorepo Engine:** Turborepo (`^2.4.4`)
- **Framework:** Next.js 16.2 (App Router), React 19.2
- **Styling:** Tailwind CSS v4 (Design tokens in `:root` and `.dark`, zero raw palette classes)
- **Server State & Data Fetching:** TanStack Query v5 (`@tanstack/react-query`)
- **Form Handling & Validation:** `react-hook-form` + `yup`
- **Icons:** `lucide-react`
- **Linting & Formatting:** ESLint 9, Prettier 3, Husky git hooks

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3+
- Running instance of the **Dove** backend API at `http://localhost:3000` (see `/dove` repository)

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Copy `.env.example` in `apps/admin` and `apps/web`:

```bash
# apps/admin/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

### 3. Start Development Servers

Run all workspace applications concurrently:

```bash
bun dev
```

- **Admin Dashboard:** [http://localhost:3001](http://localhost:3001) (or 3000 if backend is on another port)
- **Public Website:** [http://localhost:3002](http://localhost:3002)

---

## Common Scripts

Run from the monorepo root:

```bash
bun dev             # Start all apps in watch mode
bun build           # Build production bundles
bun lint            # Run ESLint across all apps
bun format          # Auto-format codebase with Prettier
bun check-types     # Type-check all workspaces with TypeScript
bun check-all       # Run format, lint, and type checks
```

---

## Documentation

| Document | Description |
|---|---|
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | Multi-phase product roadmap paired with Dove backend |
| [`docs/ROADMAP_STATUS.md`](./docs/ROADMAP_STATUS.md) | Current implementation status and Phase 1 verification |
| [`docs/architecture.md`](./docs/architecture.md) | Frontend architecture, design system tokens, and data flow |
| [`docs/multi-tenancy-architecture.md`](./docs/multi-tenancy-architecture.md) | Multi-tenancy & custom domain SaaS architecture |

---

## License

Private — All rights reserved.
