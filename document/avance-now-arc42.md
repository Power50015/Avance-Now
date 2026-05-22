# avance-now — Software Architecture Documentation (arc42)

> arc42 Template — Revision 7.0 EN
> By Dr. Gernot Starke & Dr. Peter Hruschka — http://arc42.de
> Filled with avance-now project content.

**Project:** avance-now
**Version:** 0.3.0-draft
**Status:** Pre-development — Conceptual Phase
**License:** GPL v3
**Last Updated:** 2026-05-21

---

## Table of Contents

1. [Introduction and Goals](#1-introduction-and-goals)
2. [Architecture Constraints](#2-architecture-constraints)
3. [System Scope and Context](#3-system-scope-and-context)
4. [Solution Strategy](#4-solution-strategy)
5. [Building Block View](#5-building-block-view)
6. [Runtime View](#6-runtime-view)
7. [Deployment View](#7-deployment-view)
8. [Cross-Cutting Concepts](#8-cross-cutting-concepts)
9. [Design Decisions (ADRs)](#9-design-decisions-adrs)
10. [Quality Requirements](#10-quality-requirements)
11. [Risks and Technical Debt](#11-risks-and-technical-debt)
12. [Glossary](#12-glossary)

---

## 1. Introduction and Goals

### 1.1 Requirements Overview

**avance-now** is a lightweight, extensible, open-source ERP platform for businesses that need a solid, secure foundation to grow on top of. The core ships with invoice-focused operations functionality — documents, parties, products, payments — and everything beyond that is delivered through a sandboxed, permission-gated plugin system.

The system is **not** a storefront. It is an internal operations tool. Staff creates documents, manages parties, tracks payments, and monitors inventory. There is no customer-facing checkout, no cart, no consumer portal.

**Core functional requirements:**

- Document management: create, track, and manage invoices and orders (incoming and outgoing)
- Party management: track customers and suppliers in a single unified table
- Product catalog: maintain an internal catalog of products and services
- Payment tracking: record and link payments to documents
- Plugin system: allow third-party developers to safely extend the system
- User access: role-based access control with customizable roles and permissions
- AI assistant: built-in chat assistant operating under the active user's permissions
- Audit trail: immutable log of all state-changing actions

**Driving forces:**

- WordPress proved the plugin ecosystem model works at scale — but its security and architecture have fundamental flaws
- Businesses need an ERP that is safe to extend, easy to self-host, and open forever
- Plugin developers need a platform that gives them clear, predictable extension points without requiring trust

---

### 1.2 Quality Goals

| Priority | Quality Goal | Scenario |
|---|---|---|
| 1 | **Security** | A malicious plugin cannot access data outside its declared permissions — not even by knowing table names |
| 2 | **Extensibility** | A plugin developer can add a new document type, new UI sections, and new API endpoints without modifying Core code |
| 3 | **Reliability** | A plugin that crashes does not crash the Core. Background jobs run on schedule regardless of web traffic |
| 4 | **Maintainability** | Any module can be understood, tested, and modified independently. 80% minimum test coverage enforced per module |
| 5 | **Self-Hostability** | The system runs with a single `docker compose up` command on any Linux server |

---

### 1.3 Stakeholders

| Role | Expectations |
|---|---|
| **Business Owner / Admin** | Easy to install and operate. Plugin installation is safe with visible permission consent. Full audit trail. |
| **Staff (end user)** | Fast, reliable admin panel. AI assistant helps with daily tasks. Clear document and payment workflows. |
| **Plugin Developer** | Clear, documented Hook API. Stable Core contracts. Manifest-based permission system. Freedom to use any frontend library. |
| **Open Source Contributor** | Clean codebase. Strict linting and formatting. Documented modules. Test coverage enforced. |
| **System Administrator** | Docker-first deployment. Environment variable configuration. Redis optional. PostgreSQL as the only database. |

---

## 2. Architecture Constraints

### 2.1 Technical Constraints

| Constraint | Motivation |
|---|---|
| **Database Agnostic via ORM** | The application uses an ORM which abstracts database operations, allowing it to support any relational database (e.g., PostgreSQL, MySQL, SQLite) without problems. |
| **Node.js 20 LTS** | Long-term support guarantees stability for an open source project. npm ecosystem gives the widest plugin developer contributor pool. |
| **TypeScript strict mode** | Type safety is non-negotiable for a plugin system where multiple developers extend the same codebase. |
| **EJS as templating engine** | Server-side HTML rendering is required to enable the Hook system. Plugins must be able to inject HTML at defined action points during page rendering — this is impossible with a pure SPA approach. |
| **No raw SQL for plugins** | Plugins interact with the database exclusively through the Core's Query Builder API, which automatically applies RLS context and enforces declared table permissions. |
| **GPL v3 license** | Plugins that are distributed to others must be open source. This keeps the ecosystem permanently open. |

### 2.2 Organizational Constraints

| Constraint | Motivation |
|---|---|
| **Centralized plugin marketplace** | All marketplace plugins undergo security review and must include cryptographic signatures. No self-published plugins on the official marketplace. |
| **No multi-tenancy in Core** | Keeps the schema simple. Organizations running the platform as SaaS for multiple clients implement their own isolation layer. |
| **No mobile app in Core** | The REST API serves all clients. Mobile apps are separate systems built on top of the public API. |

### 2.3 Conventions

| Convention | Motivation |
|---|---|
| **`avn_` prefix for all DB tables** | Prevents naming collisions between Core tables and plugin-created tables |
| **`AVN:` prefix for all hook names** | Prevents hook naming collisions between Core and plugins |
| **`AVN_` prefix for all env variables** | Clear identification in deployment environments |
| **kebab-case for file and folder names** | Consistent, filesystem-safe naming across all platforms |
| **JSDoc on every exported function** | IDE support and auto-generated documentation |
| **External MD files per module in `/docs/modules/`** | Human-readable documentation alongside the codebase |
| **Minimum 80% test coverage per module** | Quality gate enforced before any phase is marked complete |

---

## 3. System Scope and Context

### 3.1 Business Context

avance-now sits between the organization's staff and its business data. External communication partners are limited to configured services — no external systems are required to run the Core.

```
┌─────────────────────────────────────────────────────────────────┐
│                        avance-now                                │
│                                                                  │
│   Staff → Admin Panel → Documents, Parties, Products, Payments  │
│   Admin → Plugin Manager → Marketplace Plugins                  │
│   Any Client → REST API → All Core functionality                │
└─────────────────────────────────────────────────────────────────┘
```

| Communication Partner | Input to System | Output from System |
|---|---|---|
| **Staff (Browser)** | HTTP requests, form submissions, file uploads | Server-rendered HTML pages, API responses |
| **Plugin Marketplace** | Plugin packages with signatures | Installed, verified plugins |
| **AI Provider (OpenAI / Anthropic / Ollama)** | User chat messages via proxy | AI responses scoped to user permissions |
| **Email Server (SMTP)** | — | Outgoing emails (invoices, notifications) |
| **File Storage (local / S3)** | Uploaded files | Stored media files |
| **Redis (optional)** | — | Job queue backend, session cache |

### 3.2 Technical Context

| Channel | Direction | Technology |
|---|---|---|
| Browser ↔ Server | Bidirectional | HTTPS (HTTP/1.1 + HTTP/2), WebSocket for real-time |
| Server ↔ PostgreSQL | Server → DB | TCP, PostgreSQL wire protocol, Node.js `pg` driver |
| Server ↔ Redis | Server → Cache | TCP, Redis protocol (optional — falls back to DB) |
| Server ↔ AI Provider | Server → External | HTTPS, OpenAI-compatible REST API |
| Server ↔ SMTP | Server → External | SMTP/TLS for outgoing email |
| Server ↔ File Storage | Server → Storage | Local filesystem or S3-compatible API |
| CLI → Server | One-way | Direct Node.js process (no network) |

---

## 4. Solution Strategy

### 4.1 Technology Decisions

| Layer | Choice | Rationale |
|---|---|---|
| **Language** | TypeScript (Node.js 20 LTS) | Type safety end-to-end, largest open source contributor pool |
| **HTTP Framework** | Fastify | Maximum architectural freedom. No imposed patterns. 70K+ req/s. First-party WebSocket. Does not compete with our plugin system design. |
| **Templating Engine** | EJS | Server-side HTML rendering that enables the Hook system. Plugin developers write `.ejs` files — identical feel to PHP templates. |
| **CSS** | DaisyUI + Tailwind CSS | Semantic component classes, built-in theming. Shared between Core and all plugins. No framework lock-in. |
| **Database** | Database Agnostic | Supported via ORM. Operations, relationships, and meta-data are abstracted to run seamlessly on PostgreSQL, MySQL, and other compatible databases. |
| **Cache / Queue** | Redis (optional) | System is fully functional without Redis. When configured, Redis backs the job queue and session cache for better performance. |
| **Testing** | Vitest | Fast, TypeScript-native. Runs alongside the build without extra configuration. |
| **Containers** | Docker + Docker Compose | Reproducible dev/test/prod environments. Easy self-hosting with a single command. |

### 4.2 Top-Level Decomposition

avance-now uses a **plugin-based modular monolith** architecture:

- A minimal, opinionated **Core** handles authentication, RBAC, the Hook engine, the Plugin loader, and the Commerce domain (documents, parties, products, payments)
- **Plugins** extend the system by registering hooks, routes, and UI via declared manifests
- **Security** is enforced at the database level (PostgreSQL RLS + GRANT) — not just the application level
- The **frontend** is server-rendered HTML with DaisyUI. Plugins may add any JavaScript library to their own sections without affecting Core or other plugins.

### 4.3 Decisions to Achieve Quality Goals

| Quality Goal | Approach |
|---|---|
| **Security** | PostgreSQL GRANT per plugin. RLS on all tables. Android-style consent screen. Cryptographic plugin signatures. Session token scoping for AI. |
| **Extensibility** | Hook engine (Actions + Filters) inspired by WordPress. Universal meta/cache/taxonomy tables usable by any entity. Plugin manifest declares all extension points. |
| **Reliability** | Real job queue in `avn_jobs`. Dedicated worker process independent of web requests. Plugin error isolation — one plugin failure does not crash Core. |
| **Maintainability** | Strict TypeScript. ESLint + Prettier enforced on commit. JSDoc on all exports. 80% test coverage gate. 32 small phases with human review between each. |
| **Self-Hostability** | Official `docker-compose.yml`. Single `docker compose up` starts the full stack. Redis is optional. Only PostgreSQL is required. |

### 4.4 Relevant Organizational Decisions

- Development follows 32 small implementation phases, each with a human review gate before proceeding
- GPL v3 license ensures all distributed plugins remain open source
- Centralized marketplace with signature verification and security review
- No multi-tenancy, no mobile app, no customer portal — these are plugins or external systems

---

## 5. Building Block View

### 5.1 Whitebox Overall System

```
┌──────────────────────────────────────────────────────────────────┐
│                        avance-now Core                            │
│                                                                   │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐  ┌─────────────┐  │
│  │   Auth    │  │  Commerce │  │   Plugin   │  │     AI      │  │
│  │  Module   │  │   Core    │  │   System   │  │  Assistant  │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬──────┘  └──────┬──────┘  │
│        │              │               │                │          │
│  ┌─────▼──────────────▼───────────────▼────────────────▼──────┐  │
│  │                      Hook Engine                            │  │
│  │              AVN: Actions · Filters · Registry              │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────▼───────────────────────────────────┐  │
│  │                   Fastify HTTP Layer                         │  │
│  │         Rate Limiting · Session Validation · Router          │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
└────────────────────────────┼──────────────────────────────────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
    ┌────────▼──────┐ ┌──────▼──────┐ ┌─────▼──────────┐
    │  PostgreSQL   │ │    Redis     │ │  File Storage  │
    │  (required)   │ │  (optional)  │ │  (local / S3)  │
    └───────────────┘ └─────────────┘ └────────────────┘
```

**Contained Building Blocks:**

| Name | Responsibility |
|---|---|
| **Auth Module** | Login, logout, MFA (TOTP), session management, brute-force protection |
| **Commerce Core** | Documents, parties, products, document items, payments, universal meta/cache/taxonomy/media/notes |
| **Plugin System** | Manifest reader, file system loader, permission consent UI, PostgreSQL GRANT automation, install/uninstall lifecycle |
| **Hook Engine** | Actions and Filters registration, priority queue execution, plugin registry, conflict detection |
| **AI Assistant** | Session management, context cache builder, user-scoped API proxy |
| **Fastify HTTP Layer** | Routing, rate limiting, session validation, RBAC middleware, API versioning |
| **Job Queue Workers** | Background job execution, retry logic, Redis/DB adapter |
| **Admin UI (EJS)** | Server-rendered pages, DaisyUI components, hook injection points |

---

### 5.2 Level 2 — Internal Structure of Key Building Blocks

#### 5.2.1 Auth Module

**Responsibility:** All authentication and session management. No plugin can override this.

**Sub-components:**
- `login-handler` — validates credentials, fires `AVN:auth.before_login` / `AVN:auth.after_login`
- `session-manager` — creates/validates/revokes tokens in `avn_user_sessions`
- `mfa-handler` — TOTP setup, verification, and enforcement
- `brute-force-guard` — rate limiting (10 req/min/IP), lockout after 5 failures

**Interfaces:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `validateSession(token)` middleware used by all protected routes

---

#### 5.2.2 Hook Engine

**Responsibility:** The primary extensibility mechanism. Manages all Actions and Filters.

**Sub-components:**
- `action-registry` — stores `name → [(priority, handler, pluginKey)]` mappings
- `filter-registry` — stores `name → [(priority, handler, pluginKey)]` mappings
- `executor` — runs handlers in priority order with error isolation
- `conflict-detector` — warns when two plugins register the same hook at the same priority

**Public API:**
```typescript
hooks.addAction(name: string, handler: ActionHandler, priority?: number): void
hooks.doAction(name: string, payload: unknown): Promise<string>
hooks.addFilter(name: string, handler: FilterHandler, priority?: number): void
hooks.applyFilter<T>(name: string, value: T, context?: unknown): Promise<T>
hooks.getRegistered(): HookRegistry
```

---

#### 5.2.3 Plugin System

**Responsibility:** Load, validate, install, and manage plugins safely.

**Sub-components:**
- `manifest-reader` — reads and validates `plugin.json`, verifies cryptographic signature
- `fs-loader` — scans plugin directory at startup, bootstraps each plugin
- `consent-ui` — renders permission consent screen before install
- `grant-manager` — creates PostgreSQL roles and issues GRANTs on approval
- `lifecycle-manager` — executes `onInstall`, `onUninstall`, `onActivate`, `onDeactivate` callbacks

---

#### 5.2.4 Commerce Core

**Responsibility:** The primary domain entities of the ERP.

**Sub-components:**
- `documents` — CRUD for `avn_documents` and `avn_document_items`
- `parties` — CRUD for `avn_parties`
- `products` — CRUD for `avn_products`
- `payments` — CRUD for `avn_payments`
- `universal-meta` — service layer for `avn_meta`
- `universal-cache` — service layer for `avn_cache`
- `taxonomy` — service layer for `avn_taxonomies` and `avn_taxonomy_items`
- `media` — file upload and linking via `avn_media`
- `notes` — note creation and linking via `avn_notes`

---

### 5.3 Level 3 — Database Layer

All Core entities follow the same pattern:

```
Entity Table (e.g. avn_documents)
    ↓ referenced by
avn_meta          (JSONB flexible data — any plugin writes here)
avn_cache         (computed numeric/date/text values — fast reads)
avn_taxonomy_items (tag and category links)
avn_media         (linked files)
avn_notes         (linked text notes)
```

This pattern is available to **any** entity — Core or plugin-created — without schema changes.

---

## 6. Runtime View

### 6.1 Page Request with Hook Injection

```
Browser: GET /documents/INV-2024-001

1. Fastify receives request
2. Session validation middleware checks token → avn_user_sessions
3. RBAC middleware checks permission: read:documents
4. DocumentsController fetches document from PostgreSQL
5. hooks.doAction('AVN:document.before_render', { document })
   → Plugins inject pre-render side effects
6. EJS renders base template with document data
7. html += hooks.doAction('AVN:document.after_header', { document })
   → Warranty plugin injects warranty badge HTML
8. html += renderItems(document.items)
9. html += hooks.doAction('AVN:document.after_items', { document })
   → Tax plugin injects tax summary HTML
10. html = hooks.applyFilter('AVN:document.page_html', html)
    → Any plugin can modify the final HTML
11. Complete HTML sent to browser
```

---

### 6.2 Plugin Installation Flow

```
Admin: clicks "Install" on marketplace plugin

1. Core downloads plugin package
2. manifest-reader reads plugin.json
3. Cryptographic signature verified against developer public key
4. Consent screen rendered:
   "This plugin requests: read avn_products, write avn_warranty_details,
    hook AVN:document.after_header"
5. Admin clicks "Approve & Install"
6. grant-manager:
   a. CREATE ROLE warranty_plugin_role
   b. GRANT SELECT ON avn_products TO warranty_plugin_role
   c. GRANT SELECT, INSERT, UPDATE ON avn_warranty_details TO warranty_plugin_role
7. lifecycle-manager calls plugin.onInstall() → creates avn_warranty_details table
8. lifecycle-manager calls plugin.onActivate() → registers hooks and routes
9. hooks.doAction('AVN:plugin.after_install', { plugin })
10. Plugin appears as active in admin panel
```

---

### 6.3 AI Chat Request

```
User: "Show me all unpaid invoices this month"

1. POST /api/v1/ai/chat { message: "..." }
2. Server loads user's AI session from avn_ai_sessions
3. Server loads AI context from avn_ai_context_cache
   (includes descriptions of all installed plugins)
4. Server builds prompt: context + conversation history + new message
5. Server calls AI provider API (OpenAI-compatible endpoint)
6. AI responds with: "I'll look up unpaid invoices for you"
   and tool call: GET /api/v1/documents?type=invoice&status=draft&direction=outgoing
7. Server executes the API call using the USER's session token
   → RLS and RBAC enforce what data the user can see
8. Result returned to AI
9. AI formats response: "You have 7 unpaid invoices totaling 24,500 EGP"
10. Action logged in avn_audit_log under user_id (not AI)
11. Response stored in avn_ai_sessions.messages
12. Response returned to browser
```

---

### 6.4 Background Job Execution

```
Invoice email job:

1. Document status changes to "confirmed"
2. hooks.doAction('AVN:document.status_changed', { document, oldStatus, newStatus })
3. Email plugin's hook handler calls: jobs.enqueue('send.invoice.email', { documentId })
4. Row inserted into avn_jobs: { type: 'send.invoice.email', status: 'pending', run_at: now }
5. Web request completes — user sees instant response
...
6. Worker process polls avn_jobs every 5 seconds
7. Worker picks up job, sets status = 'running'
8. hooks.doAction('AVN:job.before_process', { job })
9. Worker executes: render PDF → send SMTP email
10. Worker sets status = 'done'
11. hooks.doAction('AVN:job.after_process', { job, result })
```

---

## 7. Deployment View

### 7.1 Infrastructure Level 1 (Production)

```
Internet
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│                    Linux Server                            │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                Docker Compose Stack                  │  │
│  │                                                     │  │
│  │  ┌──────────────┐    ┌──────────────────────────┐  │  │
│  │  │    Nginx     │    │     avance-now app        │  │  │
│  │  │  (port 80/   │───▶│   (Node.js, port 3000)   │  │  │
│  │  │    443)      │    │   + Worker process        │  │  │
│  │  └──────────────┘    └──────────┬───────────────┘  │  │
│  │                                 │                   │  │
│  │                    ┌────────────▼──────────┐        │  │
│  │                    │     PostgreSQL 16      │        │  │
│  │                    │  (port 5432, internal) │        │  │
│  │                    └───────────────────────┘        │  │
│  │                                                     │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │   Redis 7 (optional — profile: with-redis)   │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Volumes: postgres_data, uploads, plugin_files            │
└───────────────────────────────────────────────────────────┘
```

**Mapping of Building Blocks to Infrastructure:**

| Building Block | Container |
|---|---|
| Fastify HTTP server | `app` container (Node.js) |
| Job Queue Worker | `app` container (separate process) |
| EJS template rendering | `app` container |
| PostgreSQL database | `postgres` container |
| Session/queue cache | `redis` container (optional) |
| File uploads | `app` container → mounted volume |
| Static assets | `nginx` container (served directly) |

---

### 7.2 Infrastructure Level 2 — Environments

**Development (`docker-compose.dev.yml`):**
- Volume mounts for hot-reload
- Debug ports exposed
- `AVN_NODE_ENV=development`
- Seed data auto-applied on startup

**Test (`docker-compose.test.yml`):**
- Fresh PostgreSQL instance per run
- Wiped after tests complete
- No Redis (DB-backed queue only)
- `AVN_NODE_ENV=test`

**Production (`docker-compose.yml`):**
- No debug ports
- TLS via Nginx
- Secrets via environment variables (never in compose file)
- Health check on `/health` endpoint

---

## 8. Cross-Cutting Concepts

### 8.1 Domain Concepts

The core domain model:

- **Document** — the universal record (invoice, order, or plugin-defined type). Has direction (incoming/outgoing), status lifecycle, and line items.
- **Document Item** — a line in a document. References a catalog product (optional) or uses a free-text description with manual pricing.
- **Party** — any organization or person (customer, supplier, or both).
- **Product** — an internal catalog item (not customer-facing).
- **Payment** — a standalone financial record. Linked to documents via `avn_meta`.
- **Plugin** — a declared, signed package that extends the system through hooks, routes, and DB migrations.
- **Hook** — a named point in execution where plugins can inject behavior (Action) or modify data (Filter).

---

### 8.2 User Experience (UX)

- Admin panel is server-rendered HTML — fast first paint, no SPA loading
- DaisyUI + Tailwind CSS provides consistent styling across Core and all plugins
- Light and dark themes built-in via DaisyUI CSS variables
- Full RTL layout support (Arabic, Hebrew, and other RTL languages)
- All strings are translatable via i18n (to be implemented in a dedicated phase)
- Plugin developers use DaisyUI classes — no custom CSS frameworks needed

---

### 8.3 Security

**Authentication layer (Core):**
- bcrypt/argon2 password hashing
- TOTP-based MFA
- Short-lived session tokens in `avn_user_sessions`
- Brute-force: 5 failures → 15-minute lockout
- Rate limiting: 10 auth requests/min per IP

**Authorization layer (Core + PostgreSQL):**
- RBAC: every route checks `requirePermission('action:resource')`
- `AVN:user.permission_check` filter fires on every check — plugins can extend it
- PostgreSQL Row Level Security on all user-owned tables
- Each plugin gets its own PostgreSQL role with GRANT on only declared tables
- Undeclared table access returns "relation does not exist" — not "permission denied"

**Plugin security:**
- Cryptographic code signing required for marketplace plugins
- Android-style consent screen before any plugin installation
- No raw SQL for plugins — Query Builder API only
- Plugin DB role has no access to `avn_users`, `avn_user_sessions`, or `avn_audit_log`

**AI security:**
- AI operates exclusively through the user's session token
- AI cannot see or modify data outside the user's permissions
- All AI-triggered actions are logged in `avn_audit_log` under the user's `user_id`

**API security:**
- Every endpoint requires valid session token (except `/health` and `/api/v1/auth/login`)
- CSRF protection on all state-changing requests
- Input validation via Fastify JSON Schema on every route

---

### 8.4 Architecture and Design Patterns

| Pattern | Where Used | Purpose |
|---|---|---|
| **Plugin Architecture** | Core + all extensions | Extensibility without modifying Core |
| **Observer / Event (Hook System)** | Hook Engine | Decoupled extension points via Actions and Filters |
| **Repository Pattern** | DB service layers | Abstracts database access from business logic |
| **Middleware Chain** | Fastify | Auth check → Permission check → Rate limit → Handler |
| **Polymorphic Association** | `avn_meta`, `avn_cache`, `avn_taxonomy_items`, `avn_media`, `avn_notes` | Universal linking to any entity without schema changes |
| **ADR (Architecture Decision Records)** | Section 9 | Documents every significant architectural decision with rationale |

---

### 8.5 Under-the-Hood

**Persistence:**
- Every entity table has proper typed columns, FK constraints, and indexes
- JSONB used only for descriptive metadata (`avn_meta`) — never for queryable numeric/date values
- Queryable values go in `avn_cache` as typed key-value rows
- Polymorphic associations via `(reference_id, reference_table)` compound keys

**Transactions:**
- All writes to multiple tables wrapped in PostgreSQL transactions
- Migration runner applies migrations in order, with rollback support

**Session management:**
- Sessions stored in `avn_user_sessions` with expiry
- Session context set via `SET LOCAL app.user_id = '...'` before each query for RLS

**Caching:**
- `avn_cache` stores computed values (totals, counts, dates) updated asynchronously
- Redis cache layer (when configured) for session data and job queue

**Background jobs:**
- DB-backed by default: `avn_jobs` polled every 5 seconds by worker process
- Redis-backed when `AVN_REDIS_URL` is set
- Retry logic: max 3 attempts with exponential backoff
- Dead letter: failed jobs stored with full error for manual inspection

---

### 8.6 Development Concepts

**Code organization:**
```
packages/
  core/         ← main ERP application
  shared/       ← shared types and utilities
  cli/          ← command-line tools
```

**Quality gates (enforced on every commit):**
- ESLint with `@typescript-eslint/strict-type-checked`
- Prettier formatting check
- TypeScript `--noEmit` type check
- Husky pre-commit hook runs lint-staged

**Testing levels:**
- Unit tests alongside each module (`*.test.ts`)
- Integration tests against real test PostgreSQL instance
- 80% line coverage minimum per module before phase completion

**Documentation:**
- JSDoc on every exported function with `@param`, `@returns`, `@throws`, and `@fires` tags
- External `/docs/modules/` files per module for human reading
- OpenAPI 3.0 spec auto-generated from Fastify route schemas

---

### 8.7 Operational Concepts

**Deployment:**
- `docker compose up` starts the full production stack
- `docker compose -f docker-compose.dev.yml up` for development with hot-reload
- `AVN_*` environment variables for all configuration

**Logging:**
- Fastify built-in structured JSON logging
- Log level configurable via `AVN_LOG_LEVEL`
- All state-changing actions logged to `avn_audit_log` (permanent, immutable)

**Health monitoring:**
- `GET /health` returns `{ status: "ok", version, db: "ok", redis: "ok|disabled" }`
- Docker health check configured on the app container

**Updates:**
- One-click staging environment in admin panel
- Updates applied to staging first
- Admin approves promotion to production or rolls back
- Database migrations are versioned and reversible

---

## 9. Design Decisions (ADRs)

### ADR-001 — Database Agnostic via ORM

**Status:** Accepted

**Context:** The project needs a database system that can seamlessly support application operations, relationships, and meta-data across different environments.

**Decision:** Database Agnostic using an ORM. Support for multiple databases (e.g., PostgreSQL, MySQL).

**Rationale:** Using an ORM allows the application to abstract away database-specific features. Security and data scoping will be handled securely through the ORM and application layer. This provides maximum flexibility for hosting and deployment, allowing users to choose their preferred database.

**Consequences:** Increased hosting options (can use shared MySQL hosting, SQLite for development, etc.). Wider adoption. The security model and plugin isolation must be implemented via the ORM and application logic rather than relying on database-specific features.

---

### ADR-002 — Server-Side HTML Rendering with EJS

**Status:** Accepted

**Context:** The system needs a Hook system where plugins can inject HTML at specific points in a page — identical in spirit to WordPress Actions & Filters.

**Decision:** EJS templating engine for server-side HTML rendering. No SPA framework for the Core admin panel.

**Rationale:** The Hook system (`doAction` returning HTML strings) only works when HTML is built on the server in a sequential, hookable pipeline. In a pure SPA model, the rendering happens in the browser — plugins would need a separate, complex frontend hook system in addition to the server-side one. Server rendering keeps the Hook system in one place: the server. Plugins write `.ejs` files and register handlers — exactly like PHP plugin development.

**Consequences:** Plugin developers can use any JS library for interactive components. DaisyUI CSS is the only shared frontend contract. No React/Vue dependency for Core.

---

### ADR-003 — Universal Polymorphic Tables (meta, cache, taxonomy)

**Status:** Accepted

**Context:** Every entity (document, product, party, payment) needs flexible metadata, computed cache values, and tag/category support. Plugin-created entities need the same.

**Decision:** One universal `avn_meta` table, one `avn_cache` table, and one `avn_taxonomy_items` table — all using `(reference_id, reference_table)` polymorphic association.

**Rationale:** Separate `products_meta`, `parties_meta`, etc. tables would multiply with every new entity — including plugin entities. A plugin creating a `avn_crm_deals` table would also need `avn_crm_deals_meta` and `avn_crm_deals_cache`. Universal tables mean any entity — Core or plugin — can have metadata, cache, and taxonomy without any schema changes. The trade-off is losing FK constraints on the reference, which is acceptable because RLS and the permission system provide data integrity at a higher level.

**Consequences:** Any entity gets meta/cache/taxonomy for free. Plugin developers call `meta.attach()`, `cache.set()`, `taxonomy.attach()` — same API for all entities. No migration needed to add metadata to a new entity.

---

### ADR-004 — Android-Inspired Plugin Permission Model

**Status:** Accepted

**Context:** WordPress plugins get unrestricted database and filesystem access on installation. 96% of WordPress vulnerabilities in 2024 came from plugins.

**Decision:** Every plugin must declare all required permissions in `plugin.json`. The admin sees a consent screen before installation. PostgreSQL GRANTs are issued only for declared tables. Undeclared tables are invisible to the plugin.

**Rationale:** Security must be enforced at the database level, not just the application level. Even if a plugin has a bug or is compromised, it physically cannot access data outside its declared permissions. The consent screen creates explicit user awareness — identical to how Android apps request permissions.

**Consequences:** Plugin developers must declare their database access upfront. Plugin installation requires admin approval. Plugins cannot use raw SQL. The system is significantly more secure than any application-level permission check.

---

### ADR-005 — GPL v3 License

**Status:** Accepted

**Context:** The project needs a license that keeps the ecosystem permanently open and prevents closed-source forks that take without giving back.

**Decision:** GPL v3 for the Core and all official packages.

**Rationale:** Since avance-now is a web application and plugins run on the server alongside Core code, plugins are derivative works under GPL. Any plugin that is distributed must be licensed under GPL. This mirrors how WordPress works. GPL v3 (rather than v2) provides additional patent protection. AGPL was considered but rejected because it appears on corporate blacklists and would hurt adoption.

**Consequences:** The ecosystem stays permanently open. Plugin developers can build commercial plugins (selling support/updates) but cannot ship closed-source binaries. Enterprise companies can self-host and customize without releasing changes (private use doesn't trigger GPL distribution requirements).

---

### ADR-006 — No Multi-Tenancy in Core

**Status:** Accepted

**Context:** Multi-tenancy would require `tenant_id` on every table, every query, every RLS policy, and every plugin-created table.

**Decision:** avance-now Core is single-tenant. Organizations running it as SaaS build their own isolation layer.

**Rationale:** Adding `tenant_id` to every table increases schema complexity, requires every query to filter by tenant, and forces every plugin developer to handle tenant isolation correctly. For the majority of installations (a single organization self-hosting), multi-tenancy is unnecessary overhead. SaaS operators who need it can implement it as an infrastructure layer (separate databases per tenant, or a proxy that injects tenant context).

**Consequences:** Simpler schema. Simpler queries. Plugin developers don't need to think about tenant isolation. SaaS deployments require additional infrastructure work.

---

## 10. Quality Requirements

### 10.1 Quality Tree

```
Quality
├── Security
│   ├── Plugin isolation (database-level, not application-level)
│   ├── Authentication (Core-owned, MFA, brute-force protection)
│   ├── Authorization (RBAC + PostgreSQL RLS)
│   └── Supply chain (cryptographic signatures)
│
├── Extensibility
│   ├── Hook system (Actions + Filters at every key point)
│   ├── Universal tables (meta/cache/taxonomy for any entity)
│   ├── Plugin manifest (declarative, dependency-resolved)
│   └── Frontend freedom (any JS library per plugin)
│
├── Reliability
│   ├── Plugin error isolation (one plugin failure ≠ Core failure)
│   ├── Real job queue (independent of web traffic)
│   └── Staged updates (no direct production deployments)
│
├── Maintainability
│   ├── Test coverage (80% minimum per module)
│   ├── Type safety (TypeScript strict mode)
│   ├── Documentation (JSDoc + external MD)
│   └── Small phases (32 phases with human review gates)
│
└── Operability
    ├── Self-hostability (single docker compose up)
    ├── Health endpoint (/health)
    └── Audit log (immutable, permanent)
```

### 10.2 Quality Scenarios

| ID | Attribute | Scenario | Priority |
|---|---|---|---|
| QS-01 | Security | A plugin attempts to SELECT from `avn_users`. PostgreSQL returns "relation does not exist". The plugin receives no data and cannot confirm the table exists. | Critical |
| QS-02 | Security | An attacker installs a plugin containing malicious code. The plugin is rejected because its cryptographic signature does not match the marketplace public key. | Critical |
| QS-03 | Extensibility | A plugin developer adds a new document type `quote` by registering `type: 'quote'` in their plugin. No Core code changes. Quotes appear in the documents list with their own status labels via `AVN:document.status_label` filter. | High |
| QS-04 | Extensibility | A plugin attaches metadata to a `avn_crm_deals` record using `meta.attach()`. The universal `avn_meta` table stores it without any migration. | High |
| QS-05 | Reliability | A plugin's `AVN:document.after_header` handler throws an uncaught exception. The page renders normally — the hook engine logs the error and continues without the plugin's output. | High |
| QS-06 | Reliability | The server receives 500 simultaneous job enqueues. The worker process handles them sequentially from `avn_jobs`. No web requests are delayed. | High |
| QS-07 | Maintainability | A new contributor opens any module in an IDE. JSDoc appears on every exported function. The `/docs/modules/` file explains the module's purpose, API, and hook points. | Medium |
| QS-08 | Operability | A system administrator runs `docker compose up` on a fresh Ubuntu 24 server. The application is accessible on port 80 within 2 minutes. | High |
| QS-09 | Performance | An admin requests the documents list with 10,000 documents. The query uses a PostgreSQL index on `avn_documents.status` and `avn_documents.created_at`. Response time under 200ms. | Medium |
| QS-10 | Auditability | A staff member uses the AI assistant to update a document status. The `avn_audit_log` records the change under the staff member's `user_id` — not an AI system account. | High |

---

## 11. Risks and Technical Debt

### 11.1 Technical Risks

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | **Plugin ecosystem adoption** — GPL v3 and the permission consent model may slow down early plugin developer adoption | Medium | High | Provide excellent SDK documentation, sample plugins, and a developer guide from day one |
| R-02 | **EJS performance at scale** — Server-side rendering with many hook injection points may slow page responses under high concurrency | Low | Medium | Benchmark early. Add response caching for read-only pages. Use streaming where possible. |
| R-03 | **PostgreSQL-only limitation** — Organizations that cannot use PostgreSQL (shared MySQL hosting, legacy infrastructure) cannot use avance-now | Medium | Medium | Clear documentation. Docker makes PostgreSQL trivially available. |
| R-04 | **Hook system abuse** — A plugin that registers many heavy hooks could degrade performance for all users | Low | High | Hook execution timeout per handler. Plugin Health Score tracks hook registration count. |
| R-05 | **AI provider dependency** — The AI assistant requires a configured external API provider | Low | Low | System is fully functional without AI. AI is an opt-in feature configured by the admin. |
| R-06 | **Supply chain risk in npm ecosystem** — A compromised npm dependency could inject malicious code into Core | Low | Critical | Lock all dependency versions. Use `npm audit`. Prefer minimal dependencies. |

### 11.2 Technical Debt

| ID | Debt | Where | Effort | Priority |
|---|---|---|---|---|
| TD-01 | **No i18n in Phase 0** — String translations not implemented in early phases | All EJS templates | Medium | Medium — implement in a dedicated phase after UI stabilizes |
| TD-02 | **Local file storage only** — S3-compatible storage is planned but not in early phases | `avn_media` / file upload | Low | Low — pluggable storage adapter added when needed |
| TD-03 | **Single-worker job processor** — Multiple worker instances may cause duplicate job execution | Job Queue | Medium | Medium — add distributed locking when scaling becomes necessary |
| TD-04 | **No plugin update mechanism** — Updating a plugin requires uninstall + reinstall in early phases | Plugin System | Medium | Medium — implement in marketplace phases |
| TD-05 | **No rate limiting on API endpoints** — Only auth endpoints are rate-limited in early phases | All API routes | Low | High — add in Phase 8 (API layer) |

---

## 12. Glossary

| Term | Definition |
|---|---|
| **Action** | A named hook point where plugins can inject HTML or trigger side effects. Fired with `hooks.doAction('AVN:name', payload)`. Returns concatenated HTML strings from all registered handlers. |
| **ADR** | Architecture Decision Record. A document capturing a significant architectural decision, its context, rationale, and consequences. |
| **avn_** | The prefix used on all avance-now database table names to prevent naming collisions with plugin tables. Example: `avn_documents`, `avn_products`. |
| **AVN:** | The prefix used on all avance-now hook and filter names. Example: `AVN:document.created`, `AVN:product.price`. |
| **AVN_** | The prefix used on all avance-now environment variables. Example: `AVN_DATABASE_URL`, `AVN_SECRET_KEY`. |
| **Cache Table** | The universal `avn_cache` table. Stores computed numeric, date, and text values as key-value rows per entity reference. Used for fast reads without re-computing. |
| **Core** | The minimal, non-plugin, non-optional part of avance-now. Includes Auth, Commerce, Hook Engine, Plugin System, AI Assistant, Job Queue, and Admin UI shell. |
| **Document** | The primary financial record in avance-now. Can represent an invoice, order, or any plugin-defined type. Has direction (incoming/outgoing) and a status lifecycle. |
| **Document Item** | A single line in a document. References a catalog product (optional) or uses a free-text description with a manually entered price. |
| **EAV** | Entity-Attribute-Value. A database anti-pattern where rows store (entity_id, attribute_name, value) instead of proper typed columns. WordPress uses this via `wp_postmeta`. avance-now explicitly avoids it. |
| **EJS** | Embedded JavaScript Templates. The templating engine used for server-side HTML rendering in avance-now. |
| **Filter** | A named hook point where plugins can modify a value before it is used. Applied with `hooks.applyFilter('AVN:name', value, context)`. Each registered handler receives the output of the previous one. |
| **GRANT** | A PostgreSQL privilege grant. Each plugin receives a PostgreSQL database role with GRANT only on its declared tables. |
| **Hook Engine** | The Core module that manages Action and Filter registration and execution. The primary extensibility mechanism. |
| **HPOS** | High Performance Order Storage. WooCommerce's 2023 retrofit to fix their EAV-based order storage. Showed 5x faster order processing — confirming avance-now's normalized design approach. |
| **Meta Table** | The universal `avn_meta` table. Stores JSONB descriptive data per entity reference. Used for flexible, non-queryable attributes. |
| **Party** | Any organization or person in the system — customer, supplier, or both. Replaces the separate "customer" and "supplier" tables. |
| **Phase** | One of 32 small implementation units in the avance-now development roadmap. Each phase produces specific deliverables and requires human review before proceeding. |
| **Plugin** | A signed package that extends avance-now by declaring permissions, registering hooks, creating database tables, and adding routes and UI. |
| **plugin.json** | The manifest file for every plugin. Declares the plugin's identity, version, dependencies, required permissions, hook registrations, and API routes. |
| **Polymorphic Association** | A database pattern where a row references any table via `(reference_id, reference_table)` instead of a specific FK. Used by `avn_meta`, `avn_cache`, `avn_taxonomy_items`, `avn_media`, and `avn_notes`. |
| **RBAC** | Role-Based Access Control. Every user is assigned roles. Every role has permissions. Every API route checks for a specific permission. |
| **RLS** | Row Level Security. A PostgreSQL feature that automatically filters query results based on the current session context. Used to enforce per-plugin data isolation. |
| **Taxonomy** | A tag or category in the `avn_taxonomies` table. Can be attached to any entity (Core or plugin) via `avn_taxonomy_items`. Supports hierarchical categories via `parent_id`. |
| **Worker** | The background process that polls `avn_jobs` and executes pending jobs. Runs independently from the web request process. |

---

*avance-now Architecture Documentation — arc42 format*
*Template: arc42 by Dr. Gernot Starke & Dr. Peter Hruschka — http://arc42.de*
*Content: avance-now Core Team | License: GPL v3*
