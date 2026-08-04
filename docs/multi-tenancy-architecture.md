# Multi-Tenant Architecture & Custom Website Integration Strategy

## 1. Executive Summary

This document defines the roadmap and technical architecture for transforming **Olive** from a single-tenant deployment model into a scalable, multi-tenant SaaS platform. 

Under this architecture, multiple churches can either:
1. Use the hosted **Olive Web Portal** (`<church-slug>.olive.app` or `olive.app/churches/<church-slug>`) where their website content, branding, events, and registration forms are dynamically populated from their Admin Dashboard settings.
2. Plug their existing **Custom Church Websites** directly into the Olive Backend API via API keys or tenant headers.

---

## 2. Architecture Comparison

### Single-Tenant Model (Current Phase 1)
* **Deployment:** Dedicated instance of `apps/web` and backend API per church.
* **Configuration:** Environment variable `NEXT_PUBLIC_API_URL` points directly to the church's dedicated server address.
* **Data Isolation:** Complete infrastructure separation per church.

### Multi-Tenant Model (Target Architecture)
* **Deployment:** Single shared frontend (`apps/web`) cluster and single shared backend API cluster serving `N` churches.
* **Data Isolation:** Logical data isolation in database queries using `churchId` / `tenantId` columns across all entities (Events, Registrations, People, Users, Teams, Settings).
* **Tenant Resolution:** Automatically resolves tenant context on every request via Subdomain, Custom Domain, URL Slug, or Request Header.

---

## 3. Tenant Context Resolution Strategy

When a user visits a church page or calls an API endpoint, tenant context is established through one of four resolution strategies:

```
                  ┌───────────────────────────────┐
                  │       Incoming Request        │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
[ Custom Domain ]        [ Subdomain ]             [ URL Slug / Header ]
gracecitychurch.org      gracecity.olive.app       olive.app/churches/gracecity
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                ┌───────────────────────────────────┐
                │ Tenant Resolver (Middleware / API)│
                │ Extract Slug -> Fetch Church ID   │
                └─────────────────┬─────────────────┘
                                  ▼
                ┌───────────────────────────────────┐
                │ Inject Tenant Header:             │
                │ X-Tenant-Slug: gracecity          │
                └─────────────────┬─────────────────┘
                                  ▼
                ┌───────────────────────────────────┐
                │  Return Scoped Settings & Events  │
                └───────────────────────────────────┘
```

1. **Subdomain Resolution**: `https://<church-slug>.olive.app` (e.g. `https://gracecity.olive.app`)
2. **Custom Domain Resolution**: `https://gracecitychurch.org` mapped via CNAME to Olive edge servers.
3. **URL Route Slug**: `https://olive.app/churches/<church-slug>`
4. **API Header (for external custom websites)**: `X-Tenant-Slug: <church-slug>` or `Authorization: Bearer <church-api-key>`

---

## 4. Admin Content Management System (CMS)

To empower church admins to manage their entire website dynamically without touch of code, the **Olive Admin Dashboard** (`apps/admin`) provides a rich Content Management section under `/settings`:

### Manageable Website Modules
* **Church Identity & Branding:**
  * Church Name, Branch, Campus Name
  * Logo URL, Favicon URL
  * Primary Accent Color (`#HEX`), Secondary Color, Dark/Light theme defaults
* **Contact & Location:**
  * Physical Address, Google Maps embed link
  * Phone, Email, Social Media links (Facebook, Instagram, YouTube, X)
  * Service Times (e.g., "Sundays at 9:00 AM & 11:30 AM")
* **Hero Banner & Call to Actions:**
  * Hero Headline (e.g., "Welcome Home. Join Us This Sunday.")
  * Hero Subtitle & Background Media / Image URL
  * Primary Call to Action text and link
* **About, Mission & Vision:**
  * Church History / Our Story
  * Mission Statement
  * Vision Statement & Core Beliefs
* **Leadership & Pastors Showcase:**
  * Pastor / Staff profile cards (Name, Role/Title, Bio, Photo URL, Social handles)

---

## 5. API Specifications for Multi-Tenancy & External Integrations

### Public Tenant Endpoints

#### 1. Fetch Church Settings & Public Content
`GET /api/v1/churches/:tenantSlug/settings`
*(Or `GET /api/v1/settings` with `X-Tenant-Slug: :tenantSlug` header)*

**Response Payload:**
```json
{
  "status": "success",
  "data": {
    "id": "church_123",
    "slug": "gracecity",
    "name": "Grace City Church",
    "branding": {
      "primaryColor": "#10b981",
      "logoUrl": "https://cdn.olive.app/logos/gracecity.png",
      "heroHeadline": "Experience God's Grace Together",
      "heroSubtitle": "Join us live in-person every Sunday at 9:00 AM & 11:00 AM"
    },
    "location": {
      "address": "123 Hope Boulevard, Cityville",
      "phone": "+1 (555) 019-2831",
      "email": "info@gracecity.org"
    },
    "about": {
      "story": "Founded in 2010...",
      "mission": "To share hope and transform lives...",
      "vision": "A community united in worship and service..."
    },
    "serviceTimes": [
      { "day": "Sunday", "time": "09:00 AM", "label": "First Service" },
      { "day": "Sunday", "time": "11:00 AM", "label": "Second Service" }
    ]
  }
}
```

#### 2. Fetch Published Events for Tenant
`GET /api/v1/churches/:tenantSlug/events?status=PUBLISHED`

#### 3. Submit Public Event Registration
`POST /api/v1/churches/:tenantSlug/registrations`

---

## 6. External Custom Website Plug Integration

For churches that already have their own custom-built frontend website (e.g. built on Next.js, Webflow, React, WordPress) and want to use Olive strictly as an Event Management & Registration engine:

1. **API Key Generation:** Admin generates a Public Read/Write API Key from `apps/admin -> Settings -> Developer API`.
2. **Client Header:** The external site attaches `X-Tenant-Key: <api-key>` to API calls.
3. **Embeddable Widgets:** Olive provides lightweight JavaScript/React web components for embedding Event Cards and Registration Modals directly into any custom website.

---

## 7. Roadmap & Phased Transition Plan

* **Phase 1 (Current): Single-Tenant Workspace Architecture**
  * Establish monorepo structure (`apps/admin`, `apps/web`, `packages/types`, `packages/ui`).
  * `apps/web` connects directly via `NEXT_PUBLIC_API_URL`.
* **Phase 2: Database Scoping & Admin Content Fields**
  * Add `tenantSlug` / `churchId` columns to backend models.
  * Expand `/settings` endpoint and UI to support rich website content (Hero, Mission, Service times).
* **Phase 3: Multi-Tenant Host Routing & Custom Domain Support**
  * Implement Next.js Middleware in `apps/web` for subdomain/custom-domain extraction.
  * Enable Public API keys for external church website integrations.
