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
2. **Every API call lives in a `services/*.service.ts` file.** Services unwrap the response envelope with `extractData` / `extractArray` from `models/base.ts`.
3. **Query keys** start with the domain name followed by the params object: `["teams", params]`. A mutation invalidates its own domain plus any derived domains; for example, a team mutation also invalidates `["leaderboard"]`.
4. **Hooks return** data, `meta`, `isLoading`, `isError`, `error`, `refetch`, and `mutateAsync` functions with their `isPending` flags.
5. **List pages** keep page, limit, search and filters in `useListFilters`.
   - Tabular data renders in `Table`, with `ListToolbar` for list actions.
   - Card grids render inside `QueryState` with `Pagination`.
   - Every page that renders a query shows its error state (with retry) and its loading state, never an empty message instead.

**Global QueryClient** (`app/providers.tsx`): `retry: 1`, `refetchOnWindowFocus: false`.

### 3.3 API client (`utils/api-client.ts`)

- **Requests:** adds `Authorization: Bearer <access token>` and removes empty query params.
- **Responses:** the API wraps payloads in the `IBaseResponse<T>` envelope (`{ success, data, message, meta }`). Pagination details are in `meta`: `{ total, page, limit, totalPages }`.
- **On 401:** refreshes once via `POST /auth/refresh`, then retries the original request. If the refresh fails, it clears the tokens and redirects to `/login`.
- **Toasts:** each user action produces exactly one toast.
  - **Success:** a mutation declares `meta: { successMessage: "Event created" }` in its hook. The global `MutationCache` in `app/providers.tsx` shows it. The type is in `src/types/react-query.d.ts`. Successful responses themselves never toast.
  - **Errors:** the response interceptor toasts them. It stays silent for 401s, which the token refresh or redirect handles; for the refresh call itself; and for login, which shows an inline error.
  - **Components never toast API success or API errors themselves.** Use `customToast` only for client-side messages. Identical messages are merged, so a loop of score saves shows one toast.
  - Toast styling uses the design tokens, so toasts follow light and dark mode.

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
- **When adding a route,** add it to `ROUTE_PERMISSIONS` (which also makes it a known route: `KNOWN_ROUTES` is derived from it) and to `helpers/navlinks.tsx` if it belongs in the sidebar. The sidebar and the ⌘K command palette both read `navlinks.tsx` through `filterNavItems`, so they always show the same pages for a role.
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

Tokens are defined once in `apps/admin/src/app/globals.css`. The values live in `:root` (light) and `.dark` (dark), and `@theme inline` turns them into Tailwind utilities. Because of that, **token utilities switch theme automatically, so never pair them with a `dark:` variant.**

| Group | Utilities | Use for |
|---|---|---|
| Surfaces | `bg-app` | page background |
| | `bg-surface` | cards, panels, menus |
| | `bg-surface-raised` | dropdowns and controls that sit on a surface |
| | `bg-subtle` | inset or tinted areas, table headers, footers |
| | `bg-muted` | hover fills, chips |
| | `bg-muted-strong` | pressed or hover-on-muted fills, skeletons |
| | `bg-overlay` | dialog backdrop |
| Borders | `border-border` | default dividers and card edges |
| | `border-border-subtle` | inner dividers |
| | `border-border-control` | inputs, toggles, outline buttons |
| Text | `text-fg` | headings, body text |
| | `text-fg-secondary` | labels, secondary copy |
| | `text-fg-muted` | descriptions, meta text. This is **the lowest contrast allowed for text**. |
| | `text-fg-subtle` | icons, placeholders, disabled states. Not for text the user must read. |
| Accents | `primary`, `success`, `danger`, `warning`, `info` | Each comes in five forms: `bg-{a}` (solid fill), `hover:bg-{a}-hover`, `bg-{a}-soft` (tint), `border-{a}-border`, and `text-{a}-text` (readable on a surface or tint, passes WCAG AA). |
| Type | `text-2xs` (11px) | smallest size allowed; `text-xs` is the default for dense UI |

**Rules:**
- No raw Tailwind palette classes (`slate-*`, `indigo-*`, ...). No hex values or arbitrary text sizes in components.
  - `text-white` and `bg-white/NN` are allowed on solid accent fills.
  - Purely categorical colours (the Badge and StatsCard `purple` and `blue` variants) carry a scoped `eslint-disable` that states the reason.
- **Enforced by lint:** `no-restricted-syntax` in `apps/admin/eslint.config.mjs` errors on raw palette classes and arbitrary text sizes in every `.tsx` file under `src/`.
  - The login page and `not-found.tsx` are excluded, because those screens are always dark by design.
  - The only other exceptions are the categorical swatches in `Badge`, `StatsCard` and the leaderboard `Podium`. Each carries a scoped `eslint-disable` that states the reason.
- **Migration status:** complete. The app had about 3,100 raw palette classes; the only ones left are in the exceptions above.

### 6.2 Primitives: one per job

Each row is the **only** approved way to do that job. Items marked *(target)* don't exist yet; until they do, follow the closest existing pattern.

| Need | Use | Notes |
|---|---|---|
| Button | `ui/Button` | One API: `variant` (`primary` `secondary` `outline` `ghost` `danger`), `size` (`sm` `md` `lg` `icon`), `loading`, `leftIcon`, `rightIcon`. Defaults to `type="button"`. `DeleteButton` wraps it with a danger confirmation. |
| Status pill | `ui/StatusBadge`, which wraps `ui/Badge` | Labels and colours live in its `STATUS_STYLES` table; add new statuses there. No hand-rolled badge `<span>`s. |
| Team colour chip | `ui/TeamBadge` | Picks dark or white text from the team colour's lightness. |
| Card / KPI | `ui/Card`, `ui/StatsCard` | |
| Data list | `ui/Table` + `ui/ListToolbar` + `useListFilters` | Server-paginated tables don't sort (§7). |
| Pagination | `ui/Pagination` | `Table` uses it internally. Card grids use it directly. |
| Page title and actions | `ui/PageHeader` | Renders the page's only `<h1>`. Takes `title`, `description`, `icon`, `actions`, and `breadcrumbs` for nested pages (event detail, reports). |
| Loading / error / empty | `ui/QueryState` | Renders loading, then error, then empty, then content. Also provides `EmptyState`, `ErrorState`, `SkeletonCardGrid` and `SkeletonList`. `Table` has the same states built in, through `loading`, `isError`, `error`, `onRetry`, `resource` and `emptyState`. Never show an empty message while loading or after an error. |
| Form field | `FormElements/*`, all built on `ui/FormField` | `FormField` owns the label (`htmlFor`), required marker, `hint`, in-flow error and `aria-invalid`/`aria-describedby`. New controls use `useFieldIds`, `fieldAria` and `controlClass`. |
| Select | `ui/Select` (searchable, async, paginated) or `FormElements/Select` (native, for short fixed lists) | Both share the FormField contract. Multi-value: `FormElements/MultiSelect`. Pagination inside a dropdown: `FormElements/SelectPagination`. |
| Create/edit/detail overlay | `ui/SidebarModal` (side panel) | Built on Headless UI `Dialog`. Gives focus trap, Escape, scroll lock and ARIA. Props: `isOpen`, `onClose`, `title`, `description`, `footer`. |
| Short decision or confirmation | `ui/Modal` / `ConfirmActionModal` | Same Dialog base and props as SidebarModal, plus `maxWidth`. |
| Overlay action bar | the `footer` prop on Modal or SidebarModal | Secondary buttons first, primary last. A submit button outside the `<form>` uses `form={formId}`. |
| Form action bar | `ui/FormFooter` | For forms rendered in an overlay body; see §6.3. |
| Email writing | `email/EmailComposer` | One composer for broadcasts, registrant emails and birthday greetings.
  - It renders the shared content fields: subject, heading, message, image (optionally with upload), QR pass, and the CTA label and link.
  - Callers supply a `recipients` slot, their own mutation hook, any confirmation, and the footer.
  - Validation fragments live in `email/emailFields.ts`. |
| Contact submissions | `app/contact/_components/ContactTable` | One table for prayers and inquiries. The `type` prop selects the per-type config. |
| Row actions menu | `ui/ActionsList` (Radix Popover) | |
| Tabs | `ui/Tabs` | Button tabs follow the ARIA tabs pattern, with arrow, Home and End keys. Tabs with an `href` render as a `nav` of links with `aria-current`, for route-based sections such as contact. |
| Menus and pickers in the shell | Headless UI `Menu` / `Listbox` | Used for the topbar account menu and the active-event picker. Don't hand-roll dropdowns with click-outside handlers. |
| Toast | `helpers/customToast` | Never import `react-hot-toast` directly. |
| Spinner | `ui/Spinner` / `LoadingState` | The only loading indicator. Built on lucide `Loader2`. |

### 6.3 Interaction conventions

- **Destructive actions always confirm** through `ConfirmActionModal` with `tone="danger"`. Anything that deletes or irreversibly changes data (delete, clear scores) passes `tone="danger"` explicitly.
- **Actions with wide or outward effects also confirm,** using the default tone. Bulk email sends state the recipient count; marking a bounce resolved also confirms.
  - Non-destructive confirmations (e.g. sign out) use the default tone with a specific `confirmLabel`.
  - If the action throws, the dialog stays open and shows the error inside it.
- **Overlays:** forms and detail views open in the side panel; confirmations and short decisions use a centered modal.
  - *Known exceptions:* "Manage Scores" and "Remediate bounce".
- **Forms:**
  - **Setup:** react-hook-form with a yup schema, `useForm({ resolver: yupResolver(schema), mode: "onTouched" })`. Build schemas from the shared rules in `models/validation.ts` (`requiredText`, `email`, `requiredEmail`, `phone`, `url`). Don't write inline `rules` or duplicate regexes.
  - **Footer:** use `ui/FormFooter`, which sticks to the bottom of the panel.
    - Delete (`DeleteButton`) goes in `destructive`, on the far left, and is disabled while saving.
    - On the right, Cancel comes first and the primary action last.
    - Cancel is always present, in both create and edit mode.
    - Labels are "Create X" and "Save changes". Never use a bare "Submit".
  - **Submitting:** the submit button shows `loading` and blocks a double submit. It is also disabled while an upload is in progress.
  - **Unsaved changes:** a form inside a `Modal` or `SidebarModal` calls `useUnsavedChangesGuard(isDirty)` from `ui/UnsavedChanges`.
    - Escape, backdrop clicks and the close button then ask "Discard unsaved changes?". So does the form's Cancel, when wrapped in `guard(onCancel)`.
    - Reloading or leaving the page gets the browser's own prompt.
    - Closing the overlay after a successful save never prompts.
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
| 1 | Register tokens in `@theme`; migrate primitives to token utilities; lint against raw palette classes | **Done**. The whole app is on tokens and lint-enforced (§6.1). |
| 2 | Consolidate primitives: Button API, overlays on Headless UI Dialog with shared footer, `FormField` across all inputs, MultiSelect on Combobox, one `SelectPagination`, `Spinner`, `StatusBadge` table, `TeamBadge`; remove dead code (`ui/Drawer`, `helpers/copyToClipboard`, `useDebounce`, `react-spinners`) | **Done** |
| 3 | `PageHeader`, `Pagination`, `QueryState`/`Skeleton`, breadcrumbs; move all lists to `useListFilters`; error and loading states on every page; inline queries moved into `hooks/` | **Done**. The dark hero banners were removed and every page uses `PageHeader`. |
| 4 | Toasts through `MutationCache`; unsaved-changes guard; yup schemas; shared `FormFooter`; confirmations for bulk sends and bounce resolve; mutations moved out of components into hooks | **Done** |
| 5 | Shell clean-up: route permissions for `/contact` and `/messaging-center`; known routes derived from `ROUTE_PERMISSIONS`; mobile drawer and ⌘K palette on Headless UI `Dialog`; the palette lists real pages and actions instead of fake search results; topbar menus on Headless UI; one theme toggle; the stub bell and fake version/status removed. One `Tabs` component (Radix tabs removed), `EmailComposer` and `ContactTable`. Large files split, the biggest now about 450 lines (from about 1,200). Token lint covers the whole app. | **Done** |

Update the status column in the same PR that completes a phase.
