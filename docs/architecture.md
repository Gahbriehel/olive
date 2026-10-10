# Olive Platform Architecture

> **This is the single source of truth for how the Olive frontend platform is built.**
> If code and this document disagree, one of them is a bug: fix the code or update this file in the same PR.
> Each section says whether it describes how things are **now** (current) or how they should be (**target**).

Related: [Multi-tenancy & custom website strategy](./multi-tenancy-architecture.md) (future SaaS roadmap).

---

## 1. System overview

Olive is a church administration platform covering events, registrations, attendance, teams and games, people, messaging and reports. This repository holds the **frontends only**. The backend REST API is a separate service, reached at `NEXT_PUBLIC_API_URL`, which defaults to `http://localhost:3000/api/v1`.

```
                    ┌──────────────────────────────┐
                    │   Olive REST API (external)  │
                    │   /api/v1  ·  JWT auth       │
                    └──────────────┬───────────────┘
                                   │ HTTPS / JSON
              ┌────────────────────┴────────────────────┐
              │                                         │
   ┌──────────▼──────────┐                   ┌──────────▼──────────┐
   │ apps/admin          │                   │ apps/web            │
   │ Staff dashboard     │                   │ Public church site  │
   │ (authenticated)     │                   │ (anonymous)         │
   └──────────┬──────────┘                   └──────────┬──────────┘
              │                                         │
              └──────────────┬──────────────────────────┘
                             │ workspace deps
                 ┌───────────▼───────────┐
                 │ packages/types        │ API contract types
                 │ packages/ui           │ shared UI (currently only cn())
                 └───────────────────────┘
```

Deployment model today: **single-tenant**. Each church gets its own frontend and API instance; see the multi-tenancy doc.

---

## 2. Repository layout

| Path | What it is |
|---|---|
| `apps/admin` | Next.js admin dashboard for staff. Most of the code lives here. |
| `apps/web` | Next.js public site: home, about, events, event registration, contact, public leaderboard. |
| `packages/types` (`@olive/types`) | TypeScript types for the API contract: events, people, registrations, settings, contact, email logs, leaderboard. |
| `packages/ui` (`@olive/ui`) | Shared UI package. **Currently exports only `cn()`.** |
| `docs/` | Architecture docs (this file). |

**Tooling:** Bun workspaces (`bun@1.3.13`) and Turborepo (`turbo.json` tasks: `dev`, `build`, `lint`, `check-types`, `format`, `check-all`). Run `bun dev` / `bun run check-all` from the root.

**Stack (both apps):** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, TanStack Query v5, axios, react-hook-form, lucide-react, dayjs.

---

## 3. Admin app (`apps/admin`)

### 3.1 Source layout

```
src/
  app/                 Routes (App Router). Pages compose components; keep business logic out.
    (auth)/login/      Only unauthenticated route
    <module>/page.tsx  dashboard, people, events, events/[id], games, teams, attendance,
                       registrations, leaderboard, contact/*, messaging-center,
                       reports/{birthdays,bounces}, users, settings
  components/
    ui/                Design-system primitives (Button, Badge, Card, Table, Modal, ...)
    FormElements/      Form controls (Input, TextArea, Select, MultiSelect, Switch, ...)
    Forms/             Entity forms (EventsForm, PersonForm, TeamsForm, ...)
    modals/            Feature modals (ConfirmActionModal, FiltersModal, QrScannerModal, ...)
    layout/            App shell: MainShell, Sidebar, Topbar, CommandMenu
    views/, dashboard/ Larger composed views
  hooks/               One TanStack Query hook per domain (useEvents, useTeams, ...) + UI hooks
  services/            One API module per domain (*.service.ts), thin wrappers over apiClient
  models/              Admin-side types and API response adapters
  store/               Redux Toolkit: auth slice only
  context/             DashboardContext: UI shell state + selected event
  utils/               api-client, token storage, rbac, formatters
  helpers/             Small pure helpers (cn, formatDate, customToast, navlinks, ...)
  config/features.ts   Feature flags (env-driven)
```

### 3.2 Data flow (current, and the convention for new code)

```
page.tsx ──uses──▶ hooks/useX.ts ──calls──▶ services/x.service.ts ──▶ utils/api-client.ts ──▶ API
             (TanStack Query: queryKey,          (unwraps IBaseResponse,     (auth header, token
              mutations, invalidation)            returns typed data)          refresh, toasts)
```

**Rules:**
1. **Pages never call `apiClient` or `useQuery` directly.** They go through a domain hook in `hooks/`.
   *Known violations:* `reports/birthdays` and `reports/bounces` call `useQuery` inline.
2. **Every API call lives in a `services/*.service.ts` file.** Services unwrap the response envelope with `extractData` / `extractArray` from `models/base.ts`.
3. **Query keys** start with the domain name followed by the params object: `["teams", params]`. A mutation invalidates its own domain plus any derived domains; for example, a team mutation also invalidates `["leaderboard"]`.
4. **Hooks return** data, `meta`, `isLoading`, `isError`, `refetch`, and `mutateAsync` functions with their `isPending` flags.
5. **List pages** use `useListFilters` (pagination, search, filter panel) together with `Table` and `ListToolbar`.
   *Not yet migrated:* users, birthdays, events, games, teams, attendance.

**Global QueryClient** (`app/providers.tsx`): `retry: 1`, `refetchOnWindowFocus: false`.

### 3.3 API client (`utils/api-client.ts`)

- **Requests:** adds `Authorization: Bearer <access token>` and removes empty query params.
- **Responses:** the API wraps payloads in the `IBaseResponse<T>` envelope (`{ success, data, message, meta }`). Pagination details are in `meta`: `{ total, page, limit, totalPages }`.
- **On 401:** refreshes once via `POST /auth/refresh`, then retries the original request. If the refresh fails, it clears the tokens and redirects to `/login`.
- **Toasts (current):** shows a success toast after *every* POST/PUT/PATCH/DELETE and an error toast after every failure.
  **Target:** remove the automatic success toast. Each mutation hook passes `meta.successMessage` instead, and a global `MutationCache.onSuccess` shows it, so each action produces exactly one toast.

### 3.4 Authentication and authorization

- **Tokens** are stored in `localStorage` under `olive_access_token` and `olive_refresh_token` (`utils/token.ts`).
- **Auth state** lives in the Redux `auth` slice (`store/slices/authSlice.ts`): user, `isAuthenticated`, `isLoading`. Use it through `hooks/useAuth`.
- **Route guarding** happens on the client in `components/layout/MainShell.tsx`. Unauthenticated users are sent to `/login`. Users without permission for a route are sent to `getDefaultRouteForUser(user)`.
- **RBAC** is defined in `utils/rbac.ts`:
  - Roles are `SUPER_ADMIN`, `ADMIN`, `COORDINATOR`, `REGISTRATION_DESK`, plus `MEMBER`.
  - `normalizeRoleKey` maps legacy display names (e.g. "Church Admin") to these keys.
  - `ROUTE_PERMISSIONS` lists which roles can open each route.
  - `helpers/navlinks.tsx` filters the sidebar by the same roles.
  - `components/auth/AuthorityGuard` hides UI elements by role.
- **When adding a route,** update `ROUTE_PERMISSIONS`, `navlinks.tsx` **and** the `isKnownRoute` list in `MainShell.tsx`. **Target:** derive `isKnownRoute` from `ROUTE_PERMISSIONS`.
- Client-side guards are a UX layer only. **The API is the security boundary** and must enforce the same roles.

### 3.5 Client state

| Kind | Where |
|---|---|
| Server data | TanStack Query (hooks/) |
| Auth session | Redux `auth` slice |
| Shell UI: theme, mobile nav, command menu, QR scanner, global "create event", selected event | `DashboardContext` |
| List UI: page, limit, search, filters | `useListFilters` (local to the page) |
| Form state | react-hook-form |

The theme is a `dark` class on `<html>`. It's saved in `localStorage` (`olive_theme`) and applied before hydration by an inline script in `app/layout.tsx`.

### 3.6 Feature flags and environment

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api/v1` | API base URL (admin and web) |
| `NEXT_PUBLIC_STRICT_RBAC_RESTRICTIONS` | `true` | Restricts the Users directory and attendance check-ins to Super Admins (`config/features.ts`) |

---

## 4. Web app (`apps/web`)

- Public pages: `/`, `/about`, `/events`, `/events/[id]` (with the registration modal), `/contact`, `/leaderboard/[eventId]`.
- **No authentication.** One API module, `services/api.ts` (`webApiClient` and `webService`), typed with `@olive/types`.
- It has its own visual identity (charcoal, ivory and gold, Manrope and Playfair Display), defined through Tailwind `@theme` in `app/globals.css`. **It intentionally does not share the admin colour palette.**

---

## 5. Shared packages and the type contract

- `@olive/types` is **the API contract**. Any type that describes an API request or response belongs there, and both apps import it.
  - **Current:** `apps/web` uses it, but `apps/admin` does not import it at all. Admin redeclares overlapping types in `src/models/`. For example, `IBaseResponse` and `IQueryParams` exist in both places.
  - **Target:** admin imports contract types from `@olive/types`. `models/` keeps only admin-specific view models and adapters such as `adaptApiEventToChurchEvent`.
- `@olive/ui` should hold primitives that are genuinely shared and brand-neutral.
  - **Current:** only `cn()`, and neither app imports it. Duplicated today: `customToast`, `useCopyToClipboard` and `TruncatedTextWithCopy` exist in both apps.
  - **Target:** move these helpers into `@olive/ui`. Primitives with brand-specific styling stay in each app.

---

## 6. Admin UI system

### 6.1 Design tokens

- **Current:** `app/globals.css` defines CSS variables (`--bg-surface`, `--text-primary`, `--accent-*`, ...) with light and `.dark` values, but **no component uses them**. Components hardcode Tailwind palette classes (`bg-white dark:bg-zinc-900`, ...).
- **Target:** register the tokens with Tailwind `@theme inline` and use only token utilities:

| Use | Utility | Do not use |
|---|---|---|
| App background | `bg-app` | `bg-slate-50 dark:bg-zinc-950` |
| Cards, panels, popovers | `bg-surface` | `bg-white dark:bg-zinc-900` |
| Borders | `border-border` | `border-slate-200 dark:border-zinc-800` |
| Text | `text-fg`, `text-fg-secondary`, `text-fg-muted` | `text-slate-900 dark:text-slate-100`, ... |
| Brand, danger, success, warning | `bg-primary`, `text-danger`, `text-success`, `text-warning` | raw `indigo-*`, `rose-*`, `emerald-*`, `amber-*` |

- **Rules:**
  - No hex values in components.
  - No arbitrary values (`text-[11px]`, `rounded-[14px]`).
  - Dark mode greys are **zinc** only.
  - Smallest text size is `text-2xs` (11px); `text-xs` is the default for dense UI.

### 6.2 Primitives: one per job

Each row is the **only** approved way to do that job. Items marked *(target)* don't exist yet; until they do, follow the closest existing pattern.

| Need | Use | Notes |
|---|---|---|
| Button | `ui/Button` | One API: `variant` (`primary` `secondary` `outline` `ghost` `danger`), `size` (`sm` `md` `lg` `icon`), `loading`, `leftIcon`, `rightIcon`. Defaults to `type="button"`. `DeleteButton` wraps it with a danger confirmation. |
| Status pill | `ui/StatusBadge`, which wraps `ui/Badge` | Labels and colours live in its `STATUS_STYLES` table; add new statuses there. No hand-rolled badge `<span>`s. |
| Team colour chip | `ui/TeamBadge` | Picks dark or white text from the team colour's lightness. |
| Card / KPI | `ui/Card`, `ui/StatsCard` | |
| Data list | `ui/Table` + `ui/ListToolbar` + `useListFilters` | Server-paginated tables don't sort (§7). |
| Pagination outside a table | `Pagination` *(target)* | Replaces 6 hand-written pagers. |
| Page title and actions | `PageHeader` *(target)* | Renders the page's only `<h1>`. |
| Loading / error / empty | `QueryState` + `Skeleton` *(target)* | Never show an empty message while loading or after an error. |
| Form field | `FormElements/*`, all built on `ui/FormField` | `FormField` owns the label (`htmlFor`), required marker, `hint`, in-flow error and `aria-invalid`/`aria-describedby`. New controls use `useFieldIds`, `fieldAria` and `controlClass`. |
| Select | `ui/Select` (searchable, async, paginated) or `FormElements/Select` (native, for short fixed lists) | Both share the FormField contract. Multi-value: `FormElements/MultiSelect`. Pagination inside a dropdown: `FormElements/SelectPagination`. |
| Create/edit/detail overlay | `ui/SidebarModal` (side panel) | Built on Headless UI `Dialog`. Gives focus trap, Escape, scroll lock and ARIA. Props: `isOpen`, `onClose`, `title`, `description`, `footer`. |
| Short decision or confirmation | `ui/Modal` / `ConfirmActionModal` | Same Dialog base and props as SidebarModal, plus `maxWidth`. |
| Overlay action bar | the `footer` prop on Modal or SidebarModal | Secondary buttons first, primary last. A submit button outside the `<form>` uses `form={formId}`. |
| Row actions menu | `ui/ActionsList` (Radix Popover) | |
| Toast | `helpers/customToast` | Never import `react-hot-toast` directly. |
| Spinner | `ui/Spinner` / `LoadingState` | The only loading indicator. Built on lucide `Loader2`. |

### 6.3 Interaction conventions

- **Destructive actions always confirm** through `ConfirmActionModal` with `tone="danger"`. Anything that deletes or irreversibly changes data (delete, clear scores, bulk sends) passes `tone="danger"` explicitly.
  - Non-destructive confirmations (e.g. sign out) use the default tone with a specific `confirmLabel`.
  - If the action throws, the dialog stays open and shows the error inside it.
- **Overlays:** forms and detail views open in the side panel; confirmations and short decisions use a centered modal.
  - *Known exceptions:* "Manage Scores" and "Remediate bounce".
- **Forms:**
  - Use react-hook-form.
  - Footer: Cancel on the left, primary action on the right; Delete is separate and is disabled while saving.
  - Submit shows `loading` and blocks double-submit.
  - *(target)* Closing a form with unsaved changes asks for confirmation through the confirmation modal.
  - *(target)* Validation uses yup schemas through `yupResolver` (both dependencies are already installed but unused).
- **Feedback:** one toast per user action (§3.3). Errors that belong to a specific field are shown on that field, not in a toast.

---

## 7. Known limitations

| Area | Limitation | Consequence |
|---|---|---|
| Table sorting | The API has no sort params. | Column sorting is turned off on server-paginated tables and only works on client-side tables. |
| Page stats | There are no aggregate endpoints for users or events. | Breakdown cards on `/users` and `/events` count only the loaded page and are labelled "Current page only" when that's the case. |
| Team auto-assignment | There's no per-event field in the API. | It's configured church-wide only, in Settings (`IChurchSettings.preferences.autoAssignTeams`). The event form doesn't offer it. |
| Route guard | Runs only in the browser. | Security depends on the API enforcing roles. |
| Tokens | Stored in `localStorage`. | Readable by any script on the page (XSS exposure). Consider httpOnly cookies when the API supports them. |

---

## 8. UI remediation roadmap

Source: the October 2026 admin UI/UX audit.

| Phase | Scope | Status |
|---|---|---|
| 0 | Functional bugs: confirm-modal `tone`/errors, Table server-sort, stats labelling, PersonForm role badge, password-dialog dismissal, EventsForm category error, removal of the dead `autoAssignTeams` event toggle | **Done** |
| 1 | Register tokens in `@theme`; migrate primitives to token utilities; lint against raw palette classes | Planned |
| 2 | Consolidate primitives: Button API, overlays on Headless UI Dialog with shared footer, `FormField` across all inputs, MultiSelect on Combobox, one `SelectPagination`, `Spinner`, `StatusBadge` table, `TeamBadge`; remove dead code (`ui/Drawer`, `helpers/copyToClipboard`, `useDebounce`, `react-spinners`) | **Done**. Phase 1 (tokens) has not been done yet, so the new primitives still use palette classes. |
| 3 | `PageHeader`, `Pagination`, `QueryState`/`Skeleton`, breadcrumbs; move all lists to `useListFilters` | Planned |
| 4 | Toasts through `MutationCache`; unsaved-changes guard; yup schemas; confirmations for bulk sends | Planned |
| 5 | Shell clean-up (theme toggle, topbar menus on Radix, mobile drawer); split large pages; share one `EmailComposer` and one `ContactTable` | Planned |

Update the status column in the same PR that completes a phase.
