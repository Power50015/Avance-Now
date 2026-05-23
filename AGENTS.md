<!-- SPECKIT START -->

# avance-now Constitution

## Core Principles

### I. Minimal Core, Maximum Extensibility

The core is not a kitchen sink. It provides secure authentication, RBAC, and base commerce functionality. All other features are delivered through a sandboxed, permission-gated plugin system.

### II. Security is not a plugin

Authentication, permissions, and audit logging are Core responsibilities. Plugins must explicitly declare their required permissions in a manifest (`plugin.json`) and receive admin approval before installation. Unapproved access is blocked at the database level.

### III. The Schema Reflects Reality

No EAV hacks. Every entity has its own normalized schema with typed columns, foreign keys, and indexes. We use universal `avn_meta`, `avn_cache`, and `avn_taxonomies` tables via polymorphic associations for extensible data.

### IV. Server-First Rendering

Server-rendered HTML (via EJS) is required to enable the Hook system (`hooks.doAction`, `hooks.applyFilter`). Plugins may use any JS framework on the frontend, but must align with DaisyUI CSS.

### V. Quality & Test-First

Strict TypeScript must be enforced. Do not use `any` unless absolutely unavoidable. JSDoc is required on every exported function, class, and type. A minimum of 80% test coverage per module using Vitest is mandatory before any phase is marked complete.

## Current Plan & Scope

# avance-now — Implementation Phases & Roadmap

> Complete step-by-step roadmap for building the avance-now platform.

---

## 1. Implementation Strategy

The development of avance-now is broken down into **32 distinct, small phases**.

**Rules of Execution:**

1. Each phase produces specific, testable deliverables.
2. A phase is not complete until all its unit and integration tests pass (minimum 80% coverage).
3. No phase starts until the previous phase is verified and reviewed by a human.
4. This ensures steady, high-quality progress without accumulating technical debt.

---

## 2. Phase 0 — Foundation Setup

| Phase  | Title                      | Deliverables                                                                                                      |
| ------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **0a** | Repository & Tooling Setup | Monorepo structure, TypeScript config, ESLint strict, Prettier, Husky pre-commit hooks, basic README.             |
| **0b** | Docker Setup               | `Dockerfile`, `docker-compose.yml` (dev/test/prod), PostgreSQL container with `init.sql`, Nginx config.           |
| **0c** | Fastify Bootstrap          | Minimal Fastify server (`src/server.ts`), environment config validation, `/health` endpoint, basic error handler. |

---

## 3. Phase 1 — Database & Security Layer

| Phase  | Title                       | Deliverables                                                                                                            |
| ------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **1a** | Core Database Migrations    | Migration runner setup. Migrations for all 24 Core tables across 9 schema sections. Indexes configured.                 |
| **1b** | ORM Security Configuration  | ORM-level configurations for data scoping. Functions for setting session context. Tests verifying cross-user isolation. |
| **1c** | Plugin GRANT Infrastructure | Functions for creating isolated database roles for plugins and granting scoped table access based on manifests.         |
| **1d** | Seed Data                   | Default admin user (from env), default Roles (Admin, Manager, Staff, Read-Only), Core permissions, default settings.    |

---

## 4. Phase 2 — Authentication Core

| Phase  | Title                  | Deliverables                                                                                            |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| **2a** | Authentication Core    | Login, logout, session creation in `avn_user_sessions`, session validation middleware.                  |
| **2b** | MFA (TOTP)             | QR code generation, TOTP verification endpoint, MFA enforcement middleware.                             |
| **2c** | Brute Force Protection | Rate limiting (10 req/min/IP), 15-minute lockout after 5 failed attempts, `AVN:auth.login_failed` hook. |

---

## 5. Phase 3 — Authorization (RBAC)

| Phase  | Title                    | Deliverables                                                                              |
| ------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| **3a** | Roles & Permissions CRUD | Full REST API and DB service for `avn_roles` and `avn_permissions`.                       |
| **3b** | User Role Assignment     | Endpoints to assign/remove roles to/from users.                                           |
| **3c** | RBAC Middleware          | `requirePermission()` middleware factory. Hook `AVN:user.permission_check`. 403 handling. |

---

## 6. Phase 4 — Hook Engine

| Phase  | Title          | Deliverables                                                                                              |
| ------ | -------------- | --------------------------------------------------------------------------------------------------------- |
| **4a** | Actions Engine | `hooks.addAction()`, `hooks.doAction()`. Priority execution queue. Error isolation. 100% test coverage.   |
| **4b** | Filters Engine | `hooks.addFilter()`, `hooks.applyFilter()`. Priority execution. 100% test coverage.                       |
| **4c** | Hook Registry  | Internal tracking of registered hooks per plugin. Conflict detection for identical priorities. Debug API. |

---

## 7. Phase 5 — UI Foundation

| Phase  | Title              | Deliverables                                                                                  |
| ------ | ------------------ | --------------------------------------------------------------------------------------------- |
| **5a** | EJS Admin Shell    | Base HTML layout, sidebar, header, footer. DaisyUI components. Hooks for menu/head injection. |
| **5b** | Dashboard Page     | `GET /dashboard`. Default widgets (Recent Docs, Stats). Hook `AVN:admin.dashboard_widgets`.   |
| **5c** | CSS Build Pipeline | Tailwind config with DaisyUI. Postcss build. Light/dark theme support.                        |

---

## 8. Phase 6 — Core Domain Entities

| Phase  | Title                     | Deliverables                                                                                    |
| ------ | ------------------------- | ----------------------------------------------------------------------------------------------- |
| **6a** | Parties CRUD              | Service layer, REST API, admin UI for `avn_parties`. Relevant hooks wired.                      |
| **6b** | Products CRUD             | Service layer, REST API, admin UI for `avn_products`. `AVN:product.price` filter wired.         |
| **6c** | Documents CRUD            | Service layer, REST API, UI for `avn_documents`. Status transitions. Number generation filter.  |
| **6d** | Document Items            | Items CRUD, subtotal computation, product autocomplete vs free-text support.                    |
| **6e** | Payments CRUD             | Service layer, REST API, admin UI for `avn_payments`. Meta-linking to documents.                |
| **6f** | Universal Tables Services | Service layers for `avn_meta`, `avn_cache`, and taxonomies. UI for tags/categories on entities. |
| **6g** | Media & Notes             | File upload endpoint (local disk). Notes CRUD. UI components for attaching to entities.         |

---

## 9. Phase 7 — Plugin System Architecture

| Phase  | Title               | Deliverables                                                                            |
| ------ | ------------------- | --------------------------------------------------------------------------------------- |
| **7a** | Manifest Reader     | Schema validation for `plugin.json`. Cryptographic signature verification logic.        |
| **7b** | File System Loader  | Startup scanner. Bootstrapping sequence for hooks and routes. Error isolation handling. |
| **7c** | Consent UI          | Admin screen displaying requested permissions before install. Acceptance logic.         |
| **7d** | DB GRANT Automation | Automatic creation of DB roles and scoped grants upon plugin installation approval.     |
| **7e** | Lifecycle Manager   | Execution of `onInstall`, `onUninstall`, `onActivate`, `onDeactivate` callbacks.        |

---

## 10. Phase 8 — API & Documentation

| Phase  | Title                 | Deliverables                                                                                      |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------- |
| **8a** | REST API Completion   | Finalize all Core endpoints. Ensure consistent `{ error, message, code }` formats and validation. |
| **8b** | OpenAPI Documentation | Auto-generate Swagger/OpenAPI spec from Fastify schemas. Host Swagger UI at `/api/docs`.          |

---

## 11. Phase 9 — AI Integration

| Phase  | Title                 | Deliverables                                                                            |
| ------ | --------------------- | --------------------------------------------------------------------------------------- |
| **9a** | AI Session Management | Chat endpoint, session storage in `avn_ai_sessions` tied to active user token.          |
| **9b** | Context Cache Builder | Compilation of plugin manifests and DB schema into `avn_ai_context_cache`.              |
| **9c** | AI Chat Interface     | Admin UI chat panel. Proxy logic ensuring AI calls respect the user's RBAC permissions. |

---

## 12. Phase 10 — Marketplace Integration

| Phase   | Title                  | Deliverables                                                                    |
| ------- | ---------------------- | ------------------------------------------------------------------------------- |
| **10a** | Marketplace UI         | In-app browser for marketplace plugins. Details, search, and category filters.  |
| **10b** | Signature Verification | Public key registry implementation. Blocking tampered or unsigned plugins.      |
| **10c** | Install Flow           | End-to-end flow: Download → Verify → Consent UI → Install → Lifecycle triggers. |

---

## 13. Phase 11 — Background Jobs

| Phase   | Title                  | Deliverables                                                                          |
| ------- | ---------------------- | ------------------------------------------------------------------------------------- |
| **11a** | DB Job Queue           | `avn_jobs` polling worker. Retry logic with exponential backoff. Dead letter storage. |
| **11b** | Redis Queue (Optional) | Redis adapter interface. Auto-switch to Redis if configured, fallback to DB.          |

---

## 14. Phase 12 — System Administration

| Phase   | Title              | Deliverables                                                                               |
| ------- | ------------------ | ------------------------------------------------------------------------------------------ |
| **12a** | Settings Panel     | Global settings UI grouped by module. Hook for plugins to inject their own setting panels. |
| **12b** | Audit Log Viewer   | Admin UI to search, filter, and paginate through `avn_audit_log` records.                  |
| **12c** | Soft Delete / Edit | Configuration to enable historical tracking of `old_data` for soft deletes and edits.      |

## Technical Constraints

- **Language**: TypeScript (Node.js 20 LTS)
- **HTTP Framework**: Fastify
- **Templating**: EJS
- **CSS**: DaisyUI + Tailwind CSS
- **Database**: PostgreSQL (via ORM)
- **Cache/Queue**: Redis (optional)
- **Containers**: Docker + Docker Compose

## Governance

- All database tables MUST start with `avn_`.
- All hooks MUST start with `AVN:`.
- All environment variables MUST start with `AVN_`.
- File and directory names MUST use `kebab-case`.
- The `AVN_NODE_ENV` variable dictates the execution context (`development`, `test`, `production`).

<!-- SPECKIT END -->
