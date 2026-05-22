# avance-now — System Architecture & Building Blocks

> Complete system architecture, building block decomposition, and design patterns.

---

## 1. Architecture Style

avance-now uses a **plugin-based modular monolith** architecture:

- A minimal, opinionated **Core** handles authentication, RBAC, the Hook engine, the Plugin loader, and the Commerce domain
- **Plugins** extend the system by registering hooks, routes, and UI via declared manifests
- **Security** is enforced at both the application and database levels
- The **frontend** is server-rendered HTML with DaisyUI. Plugins may add any JavaScript library to their own sections

---

## 2. System Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                     BROWSER                           │
│  EJS HTML + DaisyUI CSS + Plugin JS (any library)    │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼───────────────────────────────┐
│               FASTIFY HTTP LAYER                      │
│     Rate Limiting · Auth Check · Session Validation   │
└──────┬──────────────┬──────────────┬─────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌───▼──────────┐
│  Auth       │ │  Core      │ │  Plugin      │
│  Module     │ │  Router    │ │  Loader      │
└──────┬──────┘ └─────┬──────┘ └───┬──────────┘
       │              │              │
┌──────▼──────────────▼──────────────▼───────────────┐
│                  HOOK ENGINE                         │
│          AVN: Actions · Filters · Registry           │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│               EJS TEMPLATE ENGINE                     │
│       Server-rendered HTML with Hook injection        │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              DATABASE (via ORM)                       │
│      Security · Plugin Isolation · Session Context    │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              JOB QUEUE WORKERS                        │
│   Emails · Reports · Webhooks · Scheduled Tasks       │
│   (Redis-backed if configured, DB-backed otherwise)   │
└──────────────────────────────────────────────────────┘
```

---

## 3. Building Blocks — Level 1 (Whitebox)

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
    │   Database    │ │    Redis     │ │  File Storage  │
    │  (via ORM)   │ │  (optional)  │ │  (local / S3)  │
    └───────────────┘ └─────────────┘ └────────────────┘
```

### Building Block Responsibilities

| Name | Responsibility |
|---|---|
| **Auth Module** | Login, logout, MFA (TOTP), session management, brute-force protection |
| **Commerce Core** | Documents, parties, products, document items, payments, universal meta/cache/taxonomy/media/notes |
| **Plugin System** | Manifest reader, file system loader, permission consent UI, DB permission automation, install/uninstall lifecycle |
| **Hook Engine** | Actions and Filters registration, priority queue execution, plugin registry, conflict detection |
| **AI Assistant** | Session management, context cache builder, user-scoped API proxy |
| **Fastify HTTP Layer** | Routing, rate limiting, session validation, RBAC middleware, API versioning |
| **Job Queue Workers** | Background job execution, retry logic, Redis/DB adapter |
| **Admin UI (EJS)** | Server-rendered pages, DaisyUI components, hook injection points |

---

## 4. Building Blocks — Level 2 (Internal Structure)

### 4.1 Auth Module

**Responsibility:** All authentication and session management. No plugin can override this.

**Sub-components:**

| Component | Function |
|---|---|
| `login-handler` | Validates credentials, fires `AVN:auth.before_login` / `AVN:auth.after_login` |
| `session-manager` | Creates/validates/revokes tokens in `avn_user_sessions` |
| `mfa-handler` | TOTP setup, verification, and enforcement |
| `brute-force-guard` | Rate limiting (10 req/min/IP), lockout after 5 failures |

**Interfaces:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `validateSession(token)` middleware used by all protected routes

---

### 4.2 Hook Engine

**Responsibility:** The primary extensibility mechanism. Manages all Actions and Filters.

**Sub-components:**

| Component | Function |
|---|---|
| `action-registry` | Stores `name → [(priority, handler, pluginKey)]` mappings |
| `filter-registry` | Stores `name → [(priority, handler, pluginKey)]` mappings |
| `executor` | Runs handlers in priority order with error isolation |
| `conflict-detector` | Warns when two plugins register the same hook at the same priority |

**Public API:**
```typescript
hooks.addAction(name: string, handler: ActionHandler, priority?: number): void
hooks.doAction(name: string, payload: unknown): Promise<string>
hooks.addFilter(name: string, handler: FilterHandler, priority?: number): void
hooks.applyFilter<T>(name: string, value: T, context?: unknown): Promise<T>
hooks.getRegistered(): HookRegistry
```

---

### 4.3 Plugin System

**Responsibility:** Load, validate, install, and manage plugins safely.

**Sub-components:**

| Component | Function |
|---|---|
| `manifest-reader` | Reads and validates `plugin.json`, verifies cryptographic signature |
| `fs-loader` | Scans plugin directory at startup, bootstraps each plugin |
| `consent-ui` | Renders permission consent screen before install |
| `grant-manager` | Creates DB roles and issues permissions on approval |
| `lifecycle-manager` | Executes `onInstall`, `onUninstall`, `onActivate`, `onDeactivate` callbacks |

---

### 4.4 Commerce Core

**Responsibility:** The primary domain entities of the ERP.

**Sub-components:**

| Component | Function |
|---|---|
| `documents` | CRUD for `avn_documents` and `avn_document_items` |
| `parties` | CRUD for `avn_parties` |
| `products` | CRUD for `avn_products` |
| `payments` | CRUD for `avn_payments` |
| `universal-meta` | Service layer for `avn_meta` |
| `universal-cache` | Service layer for `avn_cache` |
| `taxonomy` | Service layer for `avn_taxonomies` and `avn_taxonomy_items` |
| `media` | File upload and linking via `avn_media` |
| `notes` | Note creation and linking via `avn_notes` |

---

## 5. Building Blocks — Level 3 (Database Pattern)

All Core entities follow the same universal pattern:

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

## 6. Design Patterns Used

| Pattern | Where Used | Purpose |
|---|---|---|
| **Plugin Architecture** | Core + all extensions | Extensibility without modifying Core |
| **Observer / Event (Hook System)** | Hook Engine | Decoupled extension points via Actions and Filters |
| **Repository Pattern** | DB service layers | Abstracts database access from business logic |
| **Middleware Chain** | Fastify | Auth check → Permission check → Rate limit → Handler |
| **Polymorphic Association** | `avn_meta`, `avn_cache`, `avn_taxonomy_items`, `avn_media`, `avn_notes` | Universal linking to any entity without schema changes |
| **ADR (Architecture Decision Records)** | Design Decisions | Documents every significant architectural decision with rationale |

---

## 7. External Communication Partners

| Communication Partner | Input to System | Output from System |
|---|---|---|
| **Staff (Browser)** | HTTP requests, form submissions, file uploads | Server-rendered HTML pages, API responses |
| **Plugin Marketplace** | Plugin packages with signatures | Installed, verified plugins |
| **AI Provider (OpenAI / Anthropic / Ollama)** | User chat messages via proxy | AI responses scoped to user permissions |
| **Email Server (SMTP)** | — | Outgoing emails (invoices, notifications) |
| **File Storage (local / S3)** | Uploaded files | Stored media files |
| **Redis (optional)** | — | Job queue backend, session cache |

---

## 8. Technical Communication Channels

| Channel | Direction | Technology |
|---|---|---|
| Browser ↔ Server | Bidirectional | HTTPS (HTTP/1.1 + HTTP/2), WebSocket for real-time |
| Server ↔ Database | Server → DB | TCP via ORM driver |
| Server ↔ Redis | Server → Cache | TCP, Redis protocol (optional — falls back to DB) |
| Server ↔ AI Provider | Server → External | HTTPS, OpenAI-compatible REST API |
| Server ↔ SMTP | Server → External | SMTP/TLS for outgoing email |
| Server ↔ File Storage | Server → Storage | Local filesystem or S3-compatible API |
| CLI → Server | One-way | Direct Node.js process (no network) |

---

*Source: avance-now-arc42.md (Sections 3, 4, 5, 8.4) and avance-now-analysis-v2.md (Section 8)*
