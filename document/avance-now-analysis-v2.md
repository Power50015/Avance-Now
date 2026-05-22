# avance-now — Project Analysis Document
> An open-source, plugin-driven ERP platform. Minimal core. Maximum extensibility. Security by design.

**Status:** Pre-development — Conceptual Phase
**Version:** 0.3.0-draft
**License:** GPL v3
**Last Updated:** 2026-05-21

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Inspiration & Philosophy](#2-inspiration--philosophy)
3. [Problems We Are Solving](#3-problems-we-are-solving)
4. [Core Design Principles](#4-core-design-principles)
5. [Technology Stack](#5-technology-stack)
6. [Naming & Prefix Conventions](#6-naming--prefix-conventions)
7. [Code Quality Standards](#7-code-quality-standards)
8. [System Architecture](#8-system-architecture)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Hook System — Actions & Filters](#10-hook-system--actions--filters)
11. [Plugin System & Permission Model](#11-plugin-system--permission-model)
12. [Database Architecture](#12-database-architecture)
13. [Database Schema](#13-database-schema)
14. [Real-World Data Examples](#14-real-world-data-examples)
15. [Cases Handled by Plugins](#15-cases-handled-by-plugins)
16. [AI Integration](#16-ai-integration)
17. [Core Features](#17-core-features)
18. [API Design](#18-api-design)
19. [Security Model](#19-security-model)
20. [Docker & Infrastructure](#20-docker--infrastructure)
21. [Implementation Phases](#21-implementation-phases)
22. [What We Intentionally Exclude from Core](#22-what-we-intentionally-exclude-from-core)
23. [Comparison Table](#23-comparison-table)
24. [Decisions Log](#24-decisions-log)

---

## 1. Project Vision

**avance-now** is a lightweight, extensible, open-source ERP platform built for businesses that need a solid, secure foundation they can grow on top of. The core ships with invoice-focused commerce functionality — documents, parties, products, payments — and everything beyond that is delivered through a sandboxed, permission-gated plugin system.

The project is not a storefront. It is an internal operations tool. Staff creates documents, manages parties, tracks payments, and monitors inventory. There is no customer-facing checkout, no cart, no consumer portal.

The guiding metaphor: **WordPress taught us the concept. We are doing the execution right.**

---

## 2. Inspiration & Philosophy

| Inspiration | What We Borrow | What We Reject |
|---|---|---|
| **WordPress** | Plugin ecosystem, Hook system (Actions & Filters), simplicity | EAV database, zero plugin sandboxing, insecure auth, WP-Cron, XML-RPC |
| **WooCommerce** | Commerce-first thinking | Postmeta-based storage |
| **Android** | Per-plugin permission system, explicit consent | N/A |
| **Fastify** | Minimal HTTP layer, maximum freedom | Opinionated MVC |
| **PostgreSQL** | Row Level Security, GRANT system, JSONB | EAV workarounds |

### Core Philosophy

> *"The core does one thing well. Plugins do the rest — but only with your permission."*

- **Minimal Core, Maximum Extensibility** — the core is not a kitchen sink.
- **Security is not a plugin** — auth, permissions, and audit logging are Core responsibilities.
- **Plugins are guests** — they declare what they need and receive explicit approval.
- **The schema reflects reality** — no EAV hacks.
- **Server-first rendering** — HTML built on server enables the Hook system.
- **Freedom by design** — plugin developers choose their own JS tools.

---

## 3. Problems We Are Solving

### P-SEC-01 · Authentication Bypass Vulnerabilities
**WordPress Problem:** Authentication delegated to plugins. In 2024, CVE-2024-10924 allowed login as any user without a password.

**Our Solution:** Auth is a Core responsibility. Built-in MFA (TOTP), short-lived session tokens, brute-force protection — all in Core.

### P-SEC-02 · Plugin Vulnerability Surface (96% of All Breaches)
**WordPress Problem:** 96% of vulnerabilities from plugins. 43% require zero auth. Any plugin gets full DB access.

**Our Solution:** Android-inspired permission model. Plugin declares what it needs. Admin approves. Unapproved access is invisible, not just blocked.

### P-SEC-03 · Supply Chain Attacks
**WordPress Problem:** In 2024, attackers compromised a plugin pipeline and hit 2 million sites.

**Our Solution:** Cryptographic code signing. Core verifies signature before install or update.

### P-SEC-04 · Abandoned Plugins
**WordPress Problem:** 1,614 plugins removed in 2024 for unpatched vulnerabilities.

**Our Solution:** Plugin Health Score showing last update, open CVEs, maintenance status.

### P-ARCH-01 · EAV Database Anti-Pattern
**WordPress Problem:** Everything stored in two tables using EAV. WooCommerce HPOS retrofit showed 5x faster orders — proving the original design was broken.

**Our Solution:** Every entity has its own normalized schema. JSONB only for descriptive metadata, never for queryable values.

### P-ARCH-02 · WP-Cron (Fake Scheduler)
**WordPress Problem:** Jobs fire only on page visits. Unreliable and slow.

**Our Solution:** Real background job queue in `avn_jobs` with dedicated worker processes.

### P-ARCH-03 · XML-RPC & Heartbeat API
**WordPress Problem:** XML-RPC (1990s protocol) used for brute-force attacks. Heartbeat polls server every 15 seconds per tab.

**Our Solution:** No XML-RPC — does not exist. Real-time via SSE or WebSockets.

### P-ARCH-04 · Plugin Conflicts & No Dependency Management
**WordPress Problem:** No dependency system. Plugin conflicts discovered after crash.

**Our Solution:** `plugin.json` manifest with explicit dependencies. Core resolves graph before install.

### P-OPS-01 · Dangerous Updates
**WordPress Problem:** Updates applied directly to live site cause downtime.

**Our Solution:** One-click staging. Updates applied to staging first. Admin approves promotion or rolls back.

### P-OPS-02 · Flat Role System
**WordPress Problem:** 5 fixed roles — inadequate for ERP.

**Our Solution:** Full RBAC. Roles fully customizable. Permissions scoped to modules and plugins.

---

## 4. Core Design Principles

```
1.  Security is not a plugin — it is the Core.
2.  Plugins are guests — they must ask permission.
3.  The schema reflects reality — no EAV hacks.
4.  Background work happens in the background.
5.  Updates should never break production.
6.  The Hook system enables infinite extensibility.
7.  Plugin developers are free to choose their JS tools.
8.  Explicit is better than magic.
9.  The database enforces security, not just the application.
10. GPL keeps the ecosystem open — forever.
11. Every identifier is prefixed — confusion is the enemy.
12. Code is documented before it is shipped.
13. Nothing ships without a test.
```

---

## 5. Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| **Language** | TypeScript (Node.js) | Type safety, largest contributor pool, modern ecosystem |
| **HTTP Framework** | Fastify | Maximum architectural freedom, 70K+ req/s, first-party WebSocket |
| **Templating Engine** | EJS | Server-side HTML, enables Hook system, PHP-like simplicity |
| **CSS** | DaisyUI + Tailwind CSS | Semantic classes, theming, shared across Core and all plugins |
| **Database** | PostgreSQL | JSONB, Row Level Security, GRANT system, 35 years maturity |
| **Cache / Queue** | Redis (optional) | System runs without it. Redis improves performance when configured. |
| **Linter** | ESLint + TypeScript rules | Catch errors before runtime |
| **Formatter** | Prettier | Automated formatting, no style debates |
| **Testing** | Vitest | Fast, TypeScript-native |
| **Containers** | Docker + Docker Compose | Reproducible environments, easy self-hosting |
| **Package Manager** | npm workspaces | Monorepo support, universal familiarity |
| **License** | GPL v3 | Distributed plugins must be open source |

### Why Fastify Over Other Options

**Laravel** — enforces a "Laravel way" conflicting with our architecture. PHP has weaker WebSocket support.
**Next.js** — requires Vercel hosting in practice. Incompatible with self-hosted open source ERP.
**Django** — smaller plugin developer community for ERP use cases.
**TanStack Start** — immature ecosystem for community-driven open source.
**NestJS** — enforces decorators/DI/controllers that constrain our plugin architecture.
**Fastify** — handles HTTP and gets out of the way. Everything above it is ours to design.

### Why EJS Over Template Literals

EJS allows separate `.ejs` files with clean HTML — identical in feel to PHP templates. Template literals embed HTML in JS strings, breaking readability and removing partials/layouts support.

### Why Database Agnostic (ORM)

The application uses an ORM which abstracts database operations, allowing it to support any relational database (e.g., PostgreSQL, MySQL, SQLite). Security, tenant isolation, and plugin data scoping are managed through the ORM and application layer, providing maximum flexibility and broader hosting options.

---

## 6. Naming & Prefix Conventions

### Database Tables — `avn_` prefix

```sql
avn_users         avn_roles         avn_permissions
avn_documents     avn_products      avn_parties
avn_plugins       avn_meta          avn_cache
avn_taxonomies    avn_taxonomy_items
```

Plugin-created tables use both prefixes:

```sql
avn_crm_deals
avn_warranty_details
avn_inventory_warehouses
```

### Hooks & Filters — `AVN:` prefix

```typescript
hooks.doAction('AVN:document.created', data)
hooks.applyFilter('AVN:product.price', price, context)

// Plugin hooks
hooks.doAction('AVN:crm-plugin:deal.closed', deal)
```

### Environment Variables — `AVN_` prefix

```
AVN_DATABASE_URL
AVN_PORT
AVN_SECRET_KEY
AVN_REDIS_URL
AVN_AI_PROVIDER_URL
AVN_AI_API_KEY
```

### TypeScript Modules — No prefix needed

```typescript
// Module import handles scoping cleanly
import { create, update } from '@avance-now/documents'
import { register } from '@avance-now/hooks'
// No need for: function AVNCreateDocument() {}
```

### File & Folder Names — kebab-case

```
src/
  core/
    auth/
    documents/
    hook-engine/
    plugin-loader/
  plugins/
  shared/
```

---

## 7. Code Quality Standards

### ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:@typescript-eslint/stylistic"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

### Git Hooks — Husky + lint-staged

```
pre-commit:
  - lint-staged (ESLint + Prettier on staged files)
  - TypeScript type check

pre-push:
  - unit tests for changed modules
```

### Documentation Standards

**Layer 1 — JSDoc in code** for every exported function, class, and type:

```typescript
/**
 * Creates a new document and fires the AVN:document.created hook.
 *
 * @param {CreateDocumentInput} input - Document data
 * @param {RequestContext} ctx - Request context with user and session
 * @returns {Promise<Document>} The created document with generated number
 * @throws {ValidationError} If required fields are missing or invalid
 * @fires AVN:document.before_create
 * @fires AVN:document.after_create
 */
export async function createDocument(
  input: CreateDocumentInput,
  ctx: RequestContext,
): Promise<Document> {}
```

**Layer 2 — External MD files** in `/docs/modules/`:

```
docs/
  modules/
    auth.md
    documents.md
    hook-engine.md
    plugin-system.md
    database.md
    api.md
```

Each module doc contains: purpose, public API, hook points, usage examples, plugin extension guide.

### Testing Standards

Every module has a `*.test.ts` file alongside it:

```
src/core/documents/
  create.ts
  create.test.ts
  update.ts
  update.test.ts
```

**Unit tests** — every exported function tested in isolation with mocked dependencies.
**Integration tests** — full request-response against real test database. Run after every phase.
**Coverage requirement** — minimum 80% line coverage per module before phase is complete.

---

## 8. System Architecture

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
│           POSTGRESQL (Security Layer)                 │
│   RLS Policies · Plugin GRANT Roles · Session Context │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              JOB QUEUE WORKERS                        │
│   Emails · Reports · Webhooks · Scheduled Tasks       │
│   (Redis-backed if configured, DB-backed otherwise)   │
└──────────────────────────────────────────────────────┘
```

---

## 9. Frontend Architecture

### Philosophy

Server-rendered HTML on every request. No SPA, no client-side router. React, Vue, Alpine.js, vanilla JS — plugin developers choose. Only shared layer is **DaisyUI CSS classes**.

### How Pages Are Built

```
Browser requests /documents
        ↓
Fastify receives request
        ↓
Auth & permission check
        ↓
Core Router → DocumentsController
        ↓
Controller fetches data
        ↓
hooks.doAction('AVN:document.before_render', data)
        ↓
EJS template renders HTML
        ↓
hooks.applyFilter('AVN:document.page_html', html)
        ↓
Complete HTML sent to browser
```

### Plugin Frontend Structure

```
my-plugin/
  plugin.json
  backend/
    routes.ts
    hooks.ts
  views/
    my-page.ejs
    partials/
      my-widget.ejs
  public/
    app.js        ← any JS framework
    style.css     ← DaisyUI classes only
  docs/
    README.md
```

---

## 10. Hook System — Actions & Filters

The Hook system mirrors WordPress Actions & Filters in spirit but runs entirely in TypeScript on the server.

### Actions (doAction) — inject HTML or trigger side effects

```typescript
// Core defines action points
let html = renderTemplate('documents/show', { document })
html += hooks.doAction('AVN:document.after_header', { document })
html += renderItems(document.items)
html += hooks.doAction('AVN:document.after_items', { document })

// Plugin registers to that action
hooks.addAction('AVN:document.after_header', (ctx) => {
  return ejs.render(`<div class="badge badge-info">Verified ✓</div>`)
}, 10)
```

### Filters (applyFilter) — modify a value before use

```typescript
// Core applies filter
const price = hooks.applyFilter('AVN:product.price', product.price, { product, user })

// Plugin modifies price
hooks.addFilter('AVN:product.price', (price, ctx) => {
  if (ctx.user.role === 'vip') return price * 0.9
  return price
})
```

### Priority System

```typescript
hooks.addAction('AVN:document.after_header', handler, 10) // runs first
hooks.addAction('AVN:document.after_header', handler, 20) // runs second
// Default priority = 10
```

---

### Complete Hook Reference

#### Auth Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:auth.before_login` | Action | Before login attempt | `{ email, ip }` |
| `AVN:auth.after_login` | Action | Successful login | `{ user, session }` |
| `AVN:auth.login_failed` | Action | Failed attempt | `{ email, ip, reason }` |
| `AVN:auth.before_logout` | Action | Before logout | `{ user, session }` |
| `AVN:auth.after_logout` | Action | After logout | `{ userId }` |
| `AVN:auth.credentials` | Filter | Validates credentials | `credentials` |
| `AVN:auth.session_data` | Filter | Session payload before save | `sessionData` |

#### User Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:user.before_create` | Action | Before user creation | `{ input }` |
| `AVN:user.after_create` | Action | After user creation | `{ user }` |
| `AVN:user.before_update` | Action | Before update | `{ user, changes }` |
| `AVN:user.after_update` | Action | After update | `{ user }` |
| `AVN:user.permission_check` | Filter | Permission evaluation | `{ allowed, permission, user }` |
| `AVN:user.profile_fields` | Filter | Profile extra fields HTML | `html` |

#### Document Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:document.before_create` | Action | Before creation | `{ input }` |
| `AVN:document.after_create` | Action | After creation | `{ document }` |
| `AVN:document.before_update` | Action | Before update | `{ document, changes }` |
| `AVN:document.after_update` | Action | After update | `{ document }` |
| `AVN:document.before_delete` | Action | Before deletion | `{ document }` |
| `AVN:document.after_delete` | Action | After deletion | `{ documentId }` |
| `AVN:document.status_changed` | Action | Status transition | `{ document, oldStatus, newStatus }` |
| `AVN:document.number_generated` | Filter | Document number format | `{ number, document }` |
| `AVN:document.data` | Filter | Data before save | `documentData` |
| `AVN:document.title` | Filter | Title in UI | `{ title, document }` |
| `AVN:document.status_label` | Filter | Human-readable status | `{ label, status }` |
| `AVN:document.after_header` | Action | Template: after header | `{ document }` |
| `AVN:document.after_items` | Action | Template: after items list | `{ document }` |
| `AVN:document.before_totals` | Action | Template: before totals | `{ document }` |
| `AVN:document.after_totals` | Action | Template: after totals | `{ document }` |
| `AVN:document.page_html` | Filter | Full page HTML | `html` |
| `AVN:document.item_row_html` | Filter | Single item row HTML | `{ html, item }` |
| `AVN:document.actions_html` | Filter | Action buttons HTML | `{ html, document }` |

#### Product Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:product.before_create` | Action | Before creation | `{ input }` |
| `AVN:product.after_create` | Action | After creation | `{ product }` |
| `AVN:product.before_update` | Action | Before update | `{ product, changes }` |
| `AVN:product.after_update` | Action | After update | `{ product }` |
| `AVN:product.stock_changed` | Action | Stock changes | `{ product, oldStock, newStock, reason }` |
| `AVN:product.price` | Filter | Price calculation | `{ price, product, context }` |
| `AVN:product.data` | Filter | Data before save | `productData` |
| `AVN:product.card_html` | Filter | Product card HTML | `{ html, product }` |
| `AVN:product.detail_html` | Filter | Detail page extra HTML | `{ html, product }` |

#### Party Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:party.before_create` | Action | Before creation | `{ input }` |
| `AVN:party.after_create` | Action | After creation | `{ party }` |
| `AVN:party.before_update` | Action | Before update | `{ party, changes }` |
| `AVN:party.after_update` | Action | After update | `{ party }` |
| `AVN:party.data` | Filter | Data before save | `partyData` |
| `AVN:party.card_html` | Filter | Party card HTML | `{ html, party }` |

#### Payment Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:payment.before_create` | Action | Before creation | `{ input }` |
| `AVN:payment.after_create` | Action | After creation | `{ payment }` |
| `AVN:payment.before_delete` | Action | Before deletion | `{ payment }` |
| `AVN:payment.data` | Filter | Data before save | `paymentData` |
| `AVN:payment.method_label` | Filter | Human-readable method | `{ label, method }` |

#### Plugin Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:plugin.before_install` | Action | Before install | `{ manifest }` |
| `AVN:plugin.after_install` | Action | After install | `{ plugin }` |
| `AVN:plugin.before_uninstall` | Action | Before removal | `{ plugin }` |
| `AVN:plugin.after_uninstall` | Action | After removal | `{ pluginKey }` |
| `AVN:plugin.activated` | Action | Plugin activated | `{ plugin }` |
| `AVN:plugin.deactivated` | Action | Plugin deactivated | `{ plugin }` |

#### Admin UI Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:admin.head` | Filter | HTML `<head>` section | `html` |
| `AVN:admin.header` | Filter | Page header HTML | `html` |
| `AVN:admin.footer` | Filter | Page footer HTML | `html` |
| `AVN:admin.sidebar_menu` | Filter | Sidebar menu items | `menuItems[]` |
| `AVN:admin.dashboard_widgets` | Filter | Dashboard widgets HTML | `html` |
| `AVN:admin.settings_panels` | Filter | Settings panel tabs | `panels[]` |
| `AVN:admin.breadcrumb` | Filter | Breadcrumb items | `breadcrumbs[]` |

#### API Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:api.before_request` | Action | Before any API request | `{ request }` |
| `AVN:api.after_response` | Action | After any API response | `{ request, response }` |
| `AVN:api.document_response` | Filter | Document API response | `{ data, document }` |
| `AVN:api.product_response` | Filter | Product API response | `{ data, product }` |
| `AVN:api.party_response` | Filter | Party API response | `{ data, party }` |

#### Job Hooks

| Hook | Type | Fired When | Payload |
|---|---|---|---|
| `AVN:job.before_process` | Action | Before job execution | `{ job }` |
| `AVN:job.after_process` | Action | After job execution | `{ job, result }` |
| `AVN:job.failed` | Action | Job permanently failed | `{ job, error }` |

---

## 11. Plugin System & Permission Model

### Plugin Manifest (plugin.json)

```json
{
  "id": "warranty-plugin",
  "name": "Warranty Manager",
  "version": "1.0.0",
  "author": "Acme Corp",
  "signature": "sha256:abc123...",
  "requires_core": ">=1.0.0",
  "dependencies": [],
  "permissions": {
    "database": {
      "avn_warranty_details": ["read", "write"],
      "avn_products": ["read"]
    },
    "hooks": [
      "AVN:document.after_header",
      "AVN:product.detail_html"
    ],
    "api_routes": ["/warranty", "/warranty/:id"],
    "http_outbound": []
  }
}
```

### Installation Flow

```
Admin selects plugin
        ↓
Core reads plugin.json + verifies signature
        ↓
Consent screen:
┌───────────────────────────────────────────┐
│  Warranty Manager requests access to:     │
│                                           │
│  ✅ Read/write: avn_warranty_details      │
│  ✅ Read: avn_products                   │
│  ✅ Hook: AVN:document.after_header      │
│  ✅ API routes: /warranty, /warranty/:id │
│                                           │
│  ❌ No access to: documents, payments,   │
│     users, or any other table            │
│                                           │
│  [ Cancel ]      [ Approve & Install ]   │
└───────────────────────────────────────────┘
        ↓
Admin approves
        ↓
Core creates PostgreSQL role: warranty_plugin_role
Core issues GRANT on declared tables only
Core registers plugin hooks and routes
```

### Database Security Enforcement

```sql
-- On install
CREATE ROLE warranty_plugin_role;
GRANT SELECT, INSERT, UPDATE ON avn_warranty_details TO warranty_plugin_role;
GRANT SELECT ON avn_products TO warranty_plugin_role;

-- Plugin tries to access undeclared table
SELECT * FROM avn_documents
-- ERROR: relation "avn_documents" does not exist
-- Not "permission denied" — "does not exist"
```

---

## 12. Database Architecture

### Design Principles

**Universal Meta Table** — one `avn_meta` serves all entities. Links via `reference_id` + `reference_table`. Plugins use it without creating new tables.

**Universal Cache Table** — one `avn_cache` stores computed numeric, date, and text values for any entity via key-value per reference.

**Universal Taxonomy** — one `avn_taxonomies` + `avn_taxonomy_items` handles tags and categories for any entity — Core or plugin.

**Normalized schema** — every entity has typed columns, FK constraints, and indexes.

**PostgreSQL RLS** — enforced at database level on all tables.

**Plugin DB roles** — each plugin gets its own PostgreSQL GRANT role.

### The Universal Meta Pattern

```
avn_meta
┌──────────────────┬──────────┬──────────────────────────────┐
│ reference_id     │ UUID     │ ID of the linked record      │
│ reference_table  │ VARCHAR  │ "avn_products"               │
│ data             │ JSONB    │ flexible descriptive data    │
└──────────────────┴──────────┴──────────────────────────────┘

Examples:
reference_table="avn_products",      data={"color":"red","material":"oak"}
reference_table="avn_parties",       data={"vat_number":"123"}
reference_table="avn_crm_deals",     data={"source":"referral"}  ← plugin
reference_table="avn_document_items",data={"tax_code":"VAT14","tax_rate":14}
```

### The Universal Cache Pattern

```
avn_cache
┌──────────────────┬───────────┬──────────────────────────────┐
│ reference_id     │ UUID      │ ID of the linked record      │
│ reference_table  │ VARCHAR   │ "avn_documents"              │
│ key              │ VARCHAR   │ "total" / "paid_amount"      │
│ num_value        │ DECIMAL   │ for numeric values           │
│ date_value       │ TIMESTAMP │ for date values              │
│ text_value       │ TEXT      │ for text values              │
│ updated_at       │ TIMESTAMP │ NOT NULL                     │
└──────────────────┴───────────┴──────────────────────────────┘

Examples:
reference_table="avn_documents", key="total",        num_value=1740.00
reference_table="avn_documents", key="tax_amount",   num_value=210.00
reference_table="avn_documents", key="due_at",       date_value=2024-12-01
reference_table="avn_parties",   key="total_billed", num_value=45000.00
reference_table="avn_products",  key="total_sold",   num_value=320
reference_table="avn_products",  key="last_sold",    date_value=2024-11-15
reference_table="avn_parties",   key="risk_level",   text_value="high"
```

### The Taxonomy Pattern

```
avn_taxonomies
┌──────────────┬──────────┬──────────────────────────────────┐
│ id           │ UUID PK  │                                  │
│ type         │ ENUM     │ tag / category                   │
│ name         │ VARCHAR  │ "Electronics" / "Urgent"         │
│ slug         │ VARCHAR  │ UNIQUE "electronics"             │
│ parent_id    │ FK null  │ → avn_taxonomies (hierarchy)     │
│ description  │ TEXT     │ nullable                         │
│ created_at   │ TIMESTAMP│ NOT NULL                         │
└──────────────┴──────────┴──────────────────────────────────┘

avn_taxonomy_items
┌──────────────┬──────────┬──────────────────────────────────┐
│ taxonomy_id  │ FK       │ → avn_taxonomies                 │
│ entity_type  │ VARCHAR  │ "avn_products" / "avn_parties"   │
│ entity_id    │ UUID     │ the record's ID                  │
└──────────────┴──────────┴──────────────────────────────────┘
UNIQUE on (taxonomy_id, entity_type, entity_id)
INDEX on (entity_type, entity_id)
```

Any entity — Core or plugin — can be tagged or categorized with no schema changes.

---

## 13. Database Schema

### Section 1 — Users & Access

```
avn_users
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ name        │ VARCHAR   │ NOT NULL             │
│ email       │ VARCHAR   │ UNIQUE NOT NULL       │
│ password    │ VARCHAR   │ NOT NULL hashed      │
│ mfa_secret  │ VARCHAR   │ nullable             │
│ is_active   │ BOOLEAN   │ DEFAULT true         │
│ last_login  │ TIMESTAMP │ nullable             │
│ created_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘

avn_user_sessions
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ user_id     │ FK        │ → avn_users          │
│ token       │ VARCHAR   │ UNIQUE NOT NULL       │
│ ip_address  │ VARCHAR   │ nullable             │
│ user_agent  │ VARCHAR   │ nullable             │
│ last_active │ TIMESTAMP │ NOT NULL             │
│ expires_at  │ TIMESTAMP │ NOT NULL             │
│ created_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘

avn_roles
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ name        │ VARCHAR   │ NOT NULL             │
│ description │ TEXT      │ nullable             │
└─────────────┴───────────┴──────────────────────┘

avn_permissions
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ key         │ VARCHAR   │ UNIQUE "read:orders" │
│ module      │ VARCHAR   │ NOT NULL             │
│ description │ VARCHAR   │ nullable             │
└─────────────┴───────────┴──────────────────────┘

avn_role_permissions
┌──────────────┬────────────────────┐
│ role_id      │ FK→avn_roles       │
│ permission_id│ FK→avn_permissions │
└──────────────┴────────────────────┘

avn_user_roles
┌─────────────┬────────────────┐
│ user_id     │ FK→avn_users   │
│ role_id     │ FK→avn_roles   │
└─────────────┴────────────────┘
```

### Section 2 — Plugin System

```
avn_plugins
┌──────────────┬───────────┬──────────────────────┐
│ id           │ UUID      │ PK                   │
│ plugin_key   │ VARCHAR   │ UNIQUE NOT NULL       │
│ version      │ VARCHAR   │ NOT NULL             │
│ is_active    │ BOOLEAN   │ DEFAULT true         │
│ manifest     │ JSONB     │ NOT NULL             │
│ installed_at │ TIMESTAMP │ NOT NULL             │
└──────────────┴───────────┴──────────────────────┘

avn_plugin_permissions
┌───────────────┬───────────┬──────────────────────┐
│ plugin_id     │ FK        │ → avn_plugins        │
│ permission_key│ VARCHAR   │ NOT NULL             │
│ granted_at    │ TIMESTAMP │ NOT NULL             │
│ granted_by    │ FK        │ → avn_users          │
└───────────────┴───────────┴──────────────────────┘
```

### Section 3 — Core Entities

```
avn_parties
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ type        │ ENUM      │ customer/supplier/   │
│             │           │ both                 │
│ name        │ VARCHAR   │ NOT NULL             │
│ email       │ VARCHAR   │ nullable             │
│ phone       │ VARCHAR   │ nullable             │
│ address     │ JSONB     │ nullable             │
│ created_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘

avn_products
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ name        │ VARCHAR   │ NOT NULL             │
│ sku         │ VARCHAR   │ UNIQUE nullable      │
│ price       │ DECIMAL   │ NOT NULL             │
│ stock       │ INTEGER   │ DEFAULT 0            │
│ unit        │ VARCHAR   │ nullable             │
│ is_active   │ BOOLEAN   │ DEFAULT true         │
│ created_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘
```

### Section 4 — Documents

```
avn_documents
┌──────────────┬───────────┬────────────────────────────────┐
│ id           │ UUID      │ PK                             │
│ type         │ VARCHAR   │ invoice/order/(plugin types)   │
│ direction    │ ENUM      │ outgoing / incoming            │
│ status       │ VARCHAR   │ draft/confirmed/paid/cancelled │
│ number       │ VARCHAR   │ nullable                       │
│ party_id     │ FK        │ → avn_parties nullable         │
│ created_by   │ FK        │ → avn_users                   │
│ issued_at    │ TIMESTAMP │ nullable                       │
│ due_at       │ TIMESTAMP │ nullable                       │
│ created_at   │ TIMESTAMP │ NOT NULL                       │
└──────────────┴───────────┴────────────────────────────────┘

avn_document_items
┌──────────────┬───────────┬──────────────────────┐
│ id           │ UUID      │ PK                   │
│ document_id  │ FK        │ → avn_documents      │
│ product_id   │ FK        │ → avn_products null  │
│ description  │ VARCHAR   │ NOT NULL             │
│ quantity     │ DECIMAL   │ NOT NULL             │
│ unit_price   │ DECIMAL   │ NOT NULL             │
│ subtotal     │ DECIMAL   │ NOT NULL             │
│ sort_order   │ INTEGER   │ DEFAULT 0            │
└──────────────┴───────────┴──────────────────────┘
```

Meta and cache for `avn_document_items` use the universal `avn_meta` and `avn_cache` tables with `reference_table = 'avn_document_items'`. This allows plugins to attach per-line data (e.g. discount reason, tax breakdown, serial number) without any schema changes.

### Section 5 — Payments

```
avn_payments
┌──────────────┬───────────┬──────────────────────┐
│ id           │ UUID      │ PK                   │
│ amount       │ DECIMAL   │ NOT NULL             │
│ method       │ VARCHAR   │ cash/transfer/check  │
│ reference    │ VARCHAR   │ nullable             │
│ paid_at      │ TIMESTAMP │ NOT NULL             │
│ created_by   │ FK        │ → avn_users          │
│ created_at   │ TIMESTAMP │ NOT NULL             │
└──────────────┴───────────┴──────────────────────┘
```

Payments link to documents through `avn_meta`:
`reference_table = 'avn_payments'`, `data = { "document_id": "uuid", "allocated_amount": 1000 }`.
One payment can span multiple documents. No hard-coded allocation table needed.

### Section 6 — Universal Tables

```
avn_meta
┌──────────────────┬───────────┬────────────────────────┐
│ reference_id     │ UUID      │ NOT NULL               │
│ reference_table  │ VARCHAR   │ NOT NULL               │
│ data             │ JSONB     │ NOT NULL               │
└──────────────────┴───────────┴────────────────────────┘
INDEX on (reference_id, reference_table)

avn_cache
┌──────────────────┬───────────┬────────────────────────┐
│ reference_id     │ UUID      │ NOT NULL               │
│ reference_table  │ VARCHAR   │ NOT NULL               │
│ key              │ VARCHAR   │ NOT NULL               │
│ num_value        │ DECIMAL   │ nullable               │
│ date_value       │ TIMESTAMP │ nullable               │
│ text_value       │ TEXT      │ nullable               │
│ updated_at       │ TIMESTAMP │ NOT NULL               │
└──────────────────┴───────────┴────────────────────────┘
INDEX on (reference_id, reference_table, key)

avn_taxonomies
┌──────────────┬───────────┬──────────────────────┐
│ id           │ UUID      │ PK                   │
│ type         │ ENUM      │ tag / category       │
│ name         │ VARCHAR   │ NOT NULL             │
│ slug         │ VARCHAR   │ UNIQUE NOT NULL       │
│ parent_id    │ FK        │ → avn_taxonomies null│
│ description  │ TEXT      │ nullable             │
│ created_at   │ TIMESTAMP │ NOT NULL             │
└──────────────┴───────────┴──────────────────────┘

avn_taxonomy_items
┌──────────────┬───────────┬──────────────────────┐
│ taxonomy_id  │ FK        │ → avn_taxonomies     │
│ entity_type  │ VARCHAR   │ "avn_products"       │
│ entity_id    │ UUID      │ NOT NULL             │
└──────────────┴───────────┴──────────────────────┘
UNIQUE on (taxonomy_id, entity_type, entity_id)
INDEX on (entity_type, entity_id)
```

### Section 7 — Shared Utilities

```
avn_media
┌──────────────┬───────────┬──────────────────────┐
│ id           │ UUID      │ PK                   │
│ entity_type  │ VARCHAR   │ nullable             │
│ entity_id    │ UUID      │ nullable             │
│ filename     │ VARCHAR   │ NOT NULL             │
│ original_name│ VARCHAR   │ NOT NULL             │
│ mime_type    │ VARCHAR   │ NOT NULL             │
│ size_bytes   │ INTEGER   │ NOT NULL             │
│ path         │ VARCHAR   │ NOT NULL             │
│ disk         │ VARCHAR   │ local/s3/...         │
│ uploaded_by  │ FK        │ → avn_users          │
│ created_at   │ TIMESTAMP │ NOT NULL             │
└──────────────┴───────────┴──────────────────────┘

avn_notes
┌──────────────┬───────────┬──────────────────────┐
│ id           │ UUID      │ PK                   │
│ entity_type  │ VARCHAR   │ nullable             │
│ entity_id    │ UUID      │ nullable             │
│ content      │ TEXT      │ NOT NULL             │
│ created_by   │ FK        │ → avn_users          │
│ created_at   │ TIMESTAMP │ NOT NULL             │
│ updated_at   │ TIMESTAMP │ NOT NULL             │
└──────────────┴───────────┴──────────────────────┘
```

### Section 8 — System

```
avn_audit_log
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ type        │ ENUM      │ action/soft_delete/  │
│             │           │ soft_edit            │
│ user_id     │ FK        │ → avn_users nullable │
│ action      │ VARCHAR   │ "invoice.created"    │
│ entity      │ VARCHAR   │ "avn_documents"      │
│ entity_id   │ UUID      │ nullable             │
│ old_data    │ JSONB     │ nullable             │
│ new_data    │ JSONB     │ nullable             │
│ ip_address  │ VARCHAR   │ nullable             │
│ created_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘

avn_jobs
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ type        │ VARCHAR   │ "send.email"         │
│ payload     │ JSONB     │ NOT NULL             │
│ status      │ ENUM      │ pending/running/     │
│             │           │ done/failed          │
│ attempts    │ INTEGER   │ DEFAULT 0            │
│ error       │ TEXT      │ nullable             │
│ run_at      │ TIMESTAMP │ NOT NULL             │
│ created_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘

avn_settings
┌─────────────┬───────────┬──────────────────────┐
│ key         │ VARCHAR   │ PK                   │
│ value       │ JSONB     │ NOT NULL             │
│ updated_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘
```

### Section 9 — AI

```
avn_ai_sessions
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ user_id     │ FK        │ → avn_users          │
│ messages    │ JSONB     │ NOT NULL             │
│ created_at  │ TIMESTAMP │ NOT NULL             │
│ updated_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘

avn_ai_context_cache
┌─────────────┬───────────┬──────────────────────┐
│ id          │ UUID      │ PK                   │
│ context     │ JSONB     │ NOT NULL             │
│ updated_at  │ TIMESTAMP │ NOT NULL             │
└─────────────┴───────────┴──────────────────────┘
```

---

## 14. Real-World Data Examples

### Example 1 — Incoming Invoice: 10% Discount + 14% Tax + Note + Image

**Scenario:** Company received a supplier invoice. 10% bulk discount negotiated. 14% VAT applies. Accountant attached a scan and added a note.

**avn_documents:**
```json
{
  "id": "doc-001",
  "type": "invoice",
  "direction": "incoming",
  "status": "confirmed",
  "number": "SINV-2024-0042",
  "party_id": "party-supplier-001",
  "issued_at": "2024-11-01T00:00:00Z",
  "due_at": "2024-12-01T00:00:00Z"
}
```

**avn_document_items:**
```json
[
  {
    "id": "item-001",
    "document_id": "doc-001",
    "product_id": "prod-chair-001",
    "description": "Office Chair Model X",
    "quantity": 5,
    "unit_price": 200.00,
    "subtotal": 1000.00,
    "sort_order": 1
  },
  {
    "id": "item-002",
    "document_id": "doc-001",
    "product_id": null,
    "description": "Delivery and installation service",
    "quantity": 1,
    "unit_price": 150.00,
    "subtotal": 150.00,
    "sort_order": 2
  }
]
```

**avn_meta (discount stored here — no Core column needed):**
```json
{
  "reference_id": "doc-001",
  "reference_table": "avn_documents",
  "data": {
    "discount_type": "percentage",
    "discount_value": 10,
    "discount_reason": "Bulk order negotiated rate"
  }
}
```

**avn_cache (computed totals for fast reads):**
```json
[
  { "reference_id": "doc-001", "reference_table": "avn_documents",
    "key": "subtotal",       "num_value": 1150.00 },
  { "reference_id": "doc-001", "reference_table": "avn_documents",
    "key": "discount_amount","num_value": 115.00 },
  { "reference_id": "doc-001", "reference_table": "avn_documents",
    "key": "taxable_amount", "num_value": 1035.00 },
  { "reference_id": "doc-001", "reference_table": "avn_documents",
    "key": "tax_amount",     "num_value": 144.90 },
  { "reference_id": "doc-001", "reference_table": "avn_documents",
    "key": "total",          "num_value": 1179.90 },
  { "reference_id": "doc-001", "reference_table": "avn_documents",
    "key": "paid_amount",    "num_value": 0.00 },
  { "reference_id": "doc-001", "reference_table": "avn_documents",
    "key": "due_at",         "date_value": "2024-12-01T00:00:00Z" }
]
```

**avn_media (attached invoice scan):**
```json
{
  "id": "media-001",
  "entity_type": "avn_documents",
  "entity_id": "doc-001",
  "filename": "sinv-2024-0042-scan.jpg",
  "original_name": "scan.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 245000,
  "path": "/uploads/2024/11/sinv-2024-0042-scan.jpg",
  "disk": "local"
}
```

**avn_notes:**
```json
{
  "entity_type": "avn_documents",
  "entity_id": "doc-001",
  "content": "Original paper invoice filed in folder A-2024. Approved by manager Nov 3rd."
}
```

---

### Example 2 — Outgoing Invoice Paid in Two Installments

**Scenario:** Invoice of 3000 EGP. Customer paid 1000 first, then 2000.

**avn_payments — first payment:**
```json
{
  "id": "pay-001",
  "amount": 1000.00,
  "method": "transfer",
  "reference": "TRF-20241105-001",
  "paid_at": "2024-11-05T10:00:00Z"
}
```

**avn_meta — link first payment to document:**
```json
{
  "reference_id": "pay-001",
  "reference_table": "avn_payments",
  "data": {
    "document_id": "doc-002",
    "allocated_amount": 1000.00
  }
}
```

Second payment links the same way with `allocated_amount: 2000.00`.

**avn_cache after full payment:**
```json
[
  { "key": "total",       "num_value": 3000.00 },
  { "key": "paid_amount", "num_value": 3000.00 },
  { "key": "remaining",   "num_value": 0.00 }
]
```

---

### Example 3 — Product with Tags and Nested Category

**Scenario:** "Industrial Steel Shelf" tagged as "Heavy Duty" and "Sale", under category "Storage > Shelving".

**avn_taxonomies:**
```json
[
  { "id": "tax-001", "type": "category", "name": "Storage",    "slug": "storage",    "parent_id": null },
  { "id": "tax-002", "type": "category", "name": "Shelving",   "slug": "shelving",   "parent_id": "tax-001" },
  { "id": "tax-003", "type": "tag",      "name": "Heavy Duty", "slug": "heavy-duty", "parent_id": null },
  { "id": "tax-004", "type": "tag",      "name": "Sale",       "slug": "sale",       "parent_id": null }
]
```

**avn_taxonomy_items:**
```json
[
  { "taxonomy_id": "tax-002", "entity_type": "avn_products", "entity_id": "prod-shelf" },
  { "taxonomy_id": "tax-003", "entity_type": "avn_products", "entity_id": "prod-shelf" },
  { "taxonomy_id": "tax-004", "entity_type": "avn_products", "entity_id": "prod-shelf" }
]
```

---

### Example 4 — Party with Cache Stats

**Scenario:** Supplier "Al-Nile Trading" — computed stats stored in cache for dashboard.

**avn_cache for party:**
```json
[
  { "reference_id": "party-001", "reference_table": "avn_parties",
    "key": "total_billed",    "num_value": 85000.00 },
  { "reference_id": "party-001", "reference_table": "avn_parties",
    "key": "total_paid",      "num_value": 72000.00 },
  { "reference_id": "party-001", "reference_table": "avn_parties",
    "key": "outstanding",     "num_value": 13000.00 },
  { "reference_id": "party-001", "reference_table": "avn_parties",
    "key": "last_invoice_at", "date_value": "2024-11-20T00:00:00Z" },
  { "reference_id": "party-001", "reference_table": "avn_parties",
    "key": "risk_level",      "text_value": "medium" }
]
```

---

## 15. Cases Handled by Plugins

These are real business cases Core intentionally does not handle. Each shows how a plugin addresses them using Core's existing tables and hooks.

### Case 1 — Recurring / Subscription Invoices

**Core gap:** No scheduled document generation.

**Plugin solution:** Plugin creates `avn_recurring_schedules` table and uses `AVN:job.before_process` to generate invoices on schedule:
```json
{
  "document_id": "template-doc",
  "frequency": "monthly",
  "next_run": "2024-12-01",
  "last_run": "2024-11-01"
}
```

---

### Case 2 — Multi-Currency Documents

**Core gap:** All amounts in single base currency.

**Plugin solution:** Plugin stores currency data in `avn_meta` and hooks into `AVN:document.item_row_html` to display converted amounts:
```json
{
  "reference_table": "avn_documents",
  "data": {
    "currency": "USD",
    "exchange_rate": 49.50,
    "original_total": 100.00
  }
}
```

---

### Case 3 — Credit Notes Linked to Original Invoice

**Core gap:** Documents have no built-in relationship to each other.

**Plugin solution:** Plugin registers document type `credit_note` and stores link in `avn_meta`:
```json
{
  "reference_table": "avn_documents",
  "data": {
    "document_type_label": "Credit Note",
    "linked_document_id": "original-invoice-uuid",
    "credit_reason": "Returned goods — items damaged"
  }
}
```

---

### Case 4 — Multi-Step Approval Workflow

**Core gap:** No approval flow. Documents go straight to confirmed.

**Plugin solution:** Plugin creates `avn_approvals` table. Uses `AVN:document.status_changed` to block progression until all steps approved:
```json
{
  "document_id": "po-doc",
  "step": 2,
  "approver_id": "manager-uuid",
  "status": "pending"
}
```

---

### Case 5 — VAT Breakdown Per Line Item

**Core gap:** Tax is a document-level total in cache. No per-item tax in Core.

**Plugin solution:** Plugin stores per-item tax in `avn_meta` for each `avn_document_items` record and hooks into `AVN:document.item_row_html`:
```json
{
  "reference_id": "item-001",
  "reference_table": "avn_document_items",
  "data": {
    "tax_code": "VAT14",
    "tax_rate": 14,
    "tax_amount": 28.00
  }
}
```

---

### Case 6 — Customer Price Lists

**Core gap:** All parties see the same product price.

**Plugin solution:** Plugin hooks into `AVN:product.price` filter:
```typescript
hooks.addFilter('AVN:product.price', async (price, ctx) => {
  const customPrice = await getCustomPrice(ctx.product.id, ctx.party?.id)
  return customPrice ?? price
})
```

---

### Case 7 — Automatic Stock Deduction on Invoice

**Core gap:** Creating an invoice does not automatically reduce stock.

**Plugin solution:** Plugin hooks into `AVN:document.after_create`:
```typescript
hooks.addAction('AVN:document.after_create', async ({ document }) => {
  if (document.type === 'invoice' && document.direction === 'outgoing') {
    for (const item of document.items) {
      if (item.product_id) {
        await deductStock(item.product_id, item.quantity)
        hooks.doAction('AVN:product.stock_changed', { ... })
      }
    }
  }
})
```

---

## 16. AI Integration

### Philosophy

The AI assistant is a Core feature — not a plugin. It is aware of all installed plugins automatically through the architecture.

### How the AI Knows About Plugins

When a plugin installs, its `plugin.json` is stored in `avn_plugins` and compiled into `avn_ai_context_cache`. The AI receives this cache as part of its context on every session start — identical in spirit to how WordPress knows about registered CPTs automatically.

### How the AI Operates

The AI operates exclusively through the user's own session token:

```
User asks AI: "Show me all overdue invoices"
        ↓
AI uses user's session token
        ↓
AI calls: GET /api/v1/documents?type=invoice&status=overdue
        ↓
System responds based on what the user's token permits
        ↓
All AI actions logged under user's ID in avn_audit_log
```

### AI Configuration

Admin configures the AI provider once in settings (API key + endpoint). Supports any OpenAI-compatible API: OpenAI, Anthropic, Ollama, or any compatible provider.

---

## 17. Core Features

**Document Management** — Universal `avn_documents` table. Handles invoices, orders, and plugin-defined types. Incoming and outgoing. Status lifecycle with Hook-driven transitions. Line items support catalog products or free-text. Meta, cache, notes, media, taxonomy via universal tables.

**Party Management** — Single table for customers, suppliers, dual-role entities. Taxonomy support. Notes and media attachable. Cache for computed stats.

**Product Catalog** — Internal catalog for staff. SKU, unit, price, stock. Taxonomy support. Cache for computed stats.

**Payment Tracking** — Payments recorded independently. Linked to documents via meta. Split payments across multiple documents.

**User & Access Management** — Fully custom RBAC. MFA (TOTP). Session management. Brute-force protection.

**Audit Logging** — Every state-changing action logged. Optional soft delete and edit history.

**Background Jobs** — Real job queue. Dedicated worker process. Redis-backed when configured.

**AI Assistant** — Built into Core. Operates under user's permissions. Plugin-aware via context cache.

---

## 18. API Design

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/documents
POST   /api/v1/documents
GET    /api/v1/documents/:id
PUT    /api/v1/documents/:id
DELETE /api/v1/documents/:id
GET    /api/v1/documents/:id/items
POST   /api/v1/documents/:id/items

GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id

GET    /api/v1/parties
POST   /api/v1/parties
GET    /api/v1/parties/:id
PUT    /api/v1/parties/:id
DELETE /api/v1/parties/:id

GET    /api/v1/payments
POST   /api/v1/payments
GET    /api/v1/payments/:id
DELETE /api/v1/payments/:id

GET    /api/v1/taxonomies
POST   /api/v1/taxonomies
POST   /api/v1/taxonomies/:id/attach

GET    /api/v1/plugins
POST   /api/v1/plugins/:id/install
POST   /api/v1/plugins/:id/activate
POST   /api/v1/plugins/:id/deactivate
DELETE /api/v1/plugins/:id

GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id

GET    /api/v1/audit-log
GET    /api/v1/jobs
GET    /api/v1/settings
PUT    /api/v1/settings

POST   /api/v1/ai/chat
GET    /api/v1/ai/sessions
```

Plugin routes registered via Core route registry with declared permissions.

---

## 19. Security Model

**Authentication** — bcrypt/argon2 hashing. TOTP MFA. Short-lived tokens in `avn_user_sessions`. Device tracking.

**Plugin Security** — Cryptographic signing. Consent screen. PostgreSQL GRANT per plugin. RLS on all tables. Query Builder only — no raw SQL. Undeclared table: "does not exist".

**API Security** — Session token required. RBAC on every request. CSRF protection. Rate limiting at Fastify layer.

**Audit & Compliance** — Complete audit log. IP and user agent tracking. Optional soft delete history. All AI actions attributed to user.

---

## 20. Docker & Infrastructure

### File Structure

```
docker/
  Dockerfile
  Dockerfile.dev
  docker-compose.yml
  docker-compose.dev.yml
  docker-compose.test.yml
  postgres/
    init.sql
  nginx/
    nginx.conf
```

### docker-compose.yml (Production)

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      AVN_DATABASE_URL: postgres://...
      AVN_SECRET_KEY: ${AVN_SECRET_KEY}
    depends_on: [postgres]

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_DB: avance_now
      POSTGRES_USER: ${AVN_DB_USER}
      POSTGRES_PASSWORD: ${AVN_DB_PASSWORD}

  redis:
    image: redis:7-alpine
    profiles: ["with-redis"]

volumes:
  postgres_data:
```

`docker-compose.dev.yml` adds volume mounts for hot-reload and debug ports.
`docker-compose.test.yml` runs tests against a fresh isolated PostgreSQL instance, wiped after every run.

---

## 21. Implementation Phases

Each phase ends with a full test run and human review before proceeding. No phase starts until the previous is verified complete.

### Phase 0a — Repository & Tooling Setup
Monorepo, TypeScript, ESLint, Prettier, Husky, lint-staged.

**Deliverables:**
- Monorepo with `packages/core`, `packages/shared`, `packages/cli`
- `tsconfig.json` strict mode
- `.eslintrc.json` with TypeScript rules
- `.prettierrc`
- `.husky/pre-commit` running lint-staged
- `README.md` with setup instructions

---

### Phase 0b — Docker Setup
Containers for dev, production, and testing.

**Deliverables:**
- `Dockerfile` and `Dockerfile.dev`
- `docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.test.yml`
- PostgreSQL container with `init.sql`
- Redis container (optional profile)
- `nginx.conf`

---

### Phase 0c — Fastify Bootstrap
Minimal Fastify server with env config and health check.

**Deliverables:**
- `src/server.ts`
- `src/config.ts` with env validation
- `GET /health` → `{ status: "ok", version }`
- Basic error handler and logger

---

### Phase 1a — Core Database Migrations
All Core table migrations.

**Deliverables:**
- Migration runner setup
- Migrations for all 9 schema sections
- All `avn_` prefixed tables
- Proper indexes on FK and cache lookup columns

---

### Phase 1b — Row Level Security Policies
RLS on all user-owned tables.

**Deliverables:**
- RLS enabled on `avn_documents`, `avn_parties`, `avn_products`, `avn_payments`, `avn_audit_log`, `avn_meta`, `avn_cache`
- Session context function `avn_current_user_id()`
- Tests verifying cross-user isolation

---

### Phase 1c — Plugin GRANT Infrastructure
PostgreSQL role system for plugin isolation.

**Deliverables:**
- `create_plugin_role(plugin_key)` function
- `grant_table_access(role, table, operations[])` function
- `revoke_plugin_role(plugin_key)` function
- Tests: plugin role cannot access undeclared tables

---

### Phase 1d — Seed Data
Initial data to run the application.

**Deliverables:**
- Default admin user (credentials from env)
- Default roles: Admin, Manager, Staff, Read-Only
- Core permissions for all modules
- Default settings keys

---

### Phase 2a — Authentication Core
Login, logout, session management.

**Deliverables:**
- `POST /api/v1/auth/login` → returns session token
- `POST /api/v1/auth/logout` → invalidates session
- `GET /api/v1/auth/me`
- Session in `avn_user_sessions`
- Session validation middleware

---

### Phase 2b — MFA (TOTP)
Two-factor authentication.

**Deliverables:**
- MFA setup endpoint (QR code)
- MFA verify endpoint
- MFA enforcement middleware
- `mfa_secret` encrypted at rest

---

### Phase 2c — Brute Force Protection
Rate limiting and account lockout.

**Deliverables:**
- Max 5 failed attempts → 15-minute lockout
- Rate limiting on auth endpoints (10 req/min per IP)
- `AVN:auth.login_failed` hook fired on each failure

---

### Phase 3a — RBAC Roles & Permissions CRUD
Create, read, update, delete roles and permissions.

**Deliverables:**
- Full CRUD for `avn_roles`
- Full CRUD for `avn_permissions`
- Assign permissions to roles endpoint

---

### Phase 3b — User Role Assignment
Assign roles to users.

**Deliverables:**
- `POST /api/v1/users/:id/roles`
- `DELETE /api/v1/users/:id/roles/:roleId`
- User roles visible in profile

---

### Phase 3c — RBAC Middleware
Permission check on every protected route.

**Deliverables:**
- `requirePermission('read:documents')` middleware factory
- 403 on permission denied with clear message
- `AVN:user.permission_check` filter on every check
- Unit tests for permission logic

---

### Phase 4a — Hook Engine — Actions

**Deliverables:**
- `hooks.addAction(name, handler, priority)`
- `hooks.doAction(name, payload)`
- Priority queue execution
- Error isolation (one handler failure does not break others)
- JSDoc on all exports
- 100% unit test coverage

---

### Phase 4b — Hook Engine — Filters

**Deliverables:**
- `hooks.addFilter(name, handler, priority)`
- `hooks.applyFilter(name, value, context)`
- Same priority and error isolation as Actions
- 100% unit test coverage

---

### Phase 4c — Hook Registry
Track registered hooks per plugin.

**Deliverables:**
- Registry mapping hook → plugin → handlers
- `hooks.getRegistered()` for debugging
- Conflict detection warning for same priority collision
- `docs/modules/hook-engine.md`

---

### Phase 5a — EJS Admin Shell
Base admin HTML layout.

**Deliverables:**
- `views/layouts/admin.ejs` with DaisyUI
- `views/partials/sidebar.ejs`
- `views/partials/header.ejs`
- `views/partials/footer.ejs`
- `AVN:admin.head`, `AVN:admin.sidebar_menu`, `AVN:admin.footer` wired in

---

### Phase 5b — Dashboard Page

**Deliverables:**
- `GET /dashboard`
- `views/dashboard.ejs`
- `AVN:admin.dashboard_widgets` wired in
- 3 default widgets: Recent Documents, Recent Payments, System Stats

---

### Phase 5c — DaisyUI & Tailwind Build

**Deliverables:**
- Tailwind config with DaisyUI plugin
- CSS build via postcss
- Light and dark theme configured
- RTL layout support confirmed

---

### Phase 6a — Parties CRUD

**Deliverables:**
- DB service layer for `avn_parties`
- Full REST API and admin UI
- All party hooks wired
- `AVN:party.card_html` filter in party list
- Unit + integration tests

---

### Phase 6b — Products CRUD

**Deliverables:**
- DB service layer for `avn_products`
- Full REST API and admin UI
- All product hooks wired
- `AVN:product.price` filter wired in all price displays
- Unit + integration tests

---

### Phase 6c — Documents CRUD

**Deliverables:**
- DB service layer for `avn_documents`
- Full REST API and admin UI
- Document number generation with filter
- All document hooks wired
- Status transition validation
- Unit + integration tests

---

### Phase 6d — Document Items

**Deliverables:**
- DB service layer for `avn_document_items`
- Add/edit/remove items
- Auto-compute subtotals
- Product autocomplete for catalog items
- Free-text items (null product_id)
- `AVN:document.item_row_html` filter wired
- Integration tests: mixed catalog and free-text items

---

### Phase 6e — Payments CRUD

**Deliverables:**
- DB service layer for `avn_payments`
- Full REST API and admin UI
- Link to document via `avn_meta`
- All payment hooks wired
- Unit + integration tests

---

### Phase 6f — Universal Tables Service Layer
Meta, Cache, Taxonomy wired into all entities.

**Deliverables:**
- `meta.attach(referenceId, referenceTable, data)`
- `meta.get(referenceId, referenceTable)`
- `cache.set(referenceId, referenceTable, key, value)`
- `cache.get(referenceId, referenceTable, key)`
- `taxonomy.attach(taxonomyId, entityType, entityId)`
- Tag and category management UI
- Tags visible on party, product, document pages
- Unit tests for all service functions

---

### Phase 6g — Media & Notes

**Deliverables:**
- File upload `POST /api/v1/media`
- Local disk storage (configurable to S3 later)
- Notes CRUD endpoints
- Media and notes displayed on document, party, product pages

---

### Phase 7a — Plugin Manifest Reader

**Deliverables:**
- `readManifest(pluginPath)` with schema validation
- Signature verification (warning for unsigned)
- `docs/modules/plugin-system.md`
- Unit tests with valid and invalid manifest fixtures

---

### Phase 7b — Plugin File System Loader

**Deliverables:**
- Plugin directory scanner at startup
- Bootstrap sequence: read → validate → register hooks → register routes
- Plugin error isolation (one plugin fails, Core continues)
- Startup log of loaded plugins

---

### Phase 7c — Plugin Permission Consent UI

**Deliverables:**
- Install consent page listing all requested permissions
- Accept / Reject UI
- Permissions stored in `avn_plugin_permissions` after approval
- Rejected permissions block plugin activation

---

### Phase 7d — PostgreSQL GRANT Automation

**Deliverables:**
- Auto-create plugin DB role on install approval
- Issue GRANTs for declared tables
- Revoke GRANTs and drop role on uninstall
- Integration test: plugin role cannot SELECT from undeclared table

---

### Phase 7e — Plugin Install/Uninstall Lifecycle

**Deliverables:**
- `plugin.onInstall(callback)` — migrations, seeds
- `plugin.onUninstall(callback)` — drop tables, clean data
- `plugin.onActivate(callback)` — register hooks and routes
- `plugin.onDeactivate(callback)` — unregister
- All plugin lifecycle hooks fired
- Admin UI: install, activate, deactivate, uninstall

---

### Phase 8a — REST API Core Endpoints

**Deliverables:**
- All endpoints from Section 18
- Session middleware on all protected routes
- Consistent error format `{ error, message, code }`
- Input validation via Fastify schemas

---

### Phase 8b — OpenAPI Documentation

**Deliverables:**
- OpenAPI 3.0 spec auto-generated from Fastify schemas
- Swagger UI at `/api/docs`
- All endpoints documented

---

### Phase 9a — AI Session Management

**Deliverables:**
- `POST /api/v1/ai/chat`
- Session stored in `avn_ai_sessions`
- Message history sent with each call
- Session scoped to user

---

### Phase 9b — AI Context Cache Builder

**Deliverables:**
- `buildAIContext()` — reads all plugin manifests and Core schema
- Stored in `avn_ai_context_cache`
- Rebuilt on plugin install/uninstall
- Injected as system prompt prefix

---

### Phase 9c — AI Chat Interface

**Deliverables:**
- Chat UI in admin panel
- Message input and response display
- AI calls Core API using user's session token
- Responses indicate which data was accessed

---

### Phase 10a — Plugin Marketplace UI

**Deliverables:**
- Marketplace browse page
- Plugin detail page: manifest, permissions, author
- Search and filter by category

---

### Phase 10b — Signature Verification

**Deliverables:**
- Public key registry for verified developers
- Signature check before install
- Unsigned plugin warning (explicit confirmation required)
- Integration test: tampered plugin rejected

---

### Phase 10c — Marketplace Install Flow

**Deliverables:**
- Download from marketplace
- Verify signature
- Show consent screen
- Install on approval
- Full Phase 7 lifecycle triggered

---

### Phase 11a — Job Queue (DB-backed)

**Deliverables:**
- `jobs.enqueue(type, payload, runAt?)`
- Worker process polling `avn_jobs` every 5 seconds
- Retry logic: max 3 attempts with exponential backoff
- Failed jobs stored with error
- `AVN:job.before_process` and `AVN:job.after_process` hooks

---

### Phase 11b — Redis Queue (Optional)

**Deliverables:**
- Queue adapter interface (DB and Redis implement same interface)
- Auto-detect Redis from `AVN_REDIS_URL`
- Fall back to DB if Redis unavailable
- Integration tests for both adapters

---

### Phase 12a — Settings Panel

**Deliverables:**
- Settings admin UI
- Settings grouped by module
- `AVN:admin.settings_panels` filter wired
- Plugin settings panels injected automatically

---

### Phase 12b — Audit Log Viewer

**Deliverables:**
- Audit log page: filter by user, entity, action, date range
- Pagination
- Recent activity dashboard widget

---

### Phase 12c — Soft Delete & Soft Edit

**Deliverables:**
- Setting to enable/disable per entity type
- When enabled: `avn_audit_log` records `old_data` before delete/edit
- Admin UI to view deleted records and restore

---

## 22. What We Intentionally Exclude from Core

| Feature | Why It Is a Plugin |
|---|---|
| Payment gateway integrations | Region-specific, compliance requirements |
| Advanced accounting (GL, journal entries) | Specialized |
| HR & Payroll | Complex, jurisdiction-specific |
| CRM (pipelines, deals) | Optional |
| Multi-warehouse management | Not universal |
| Shipping carrier integrations | Region-specific |
| SMS notifications | Third-party dependency |
| Advanced BI / reporting | Business-specific |
| Point of Sale (POS) | Specialized hardware |
| Subscription billing | Complex recurring logic |
| B2B features (price lists, POs) | Not universal |
| Mobile application | Separate system — API covers it |
| Multi-tenancy | SaaS operators build their own layer |
| Customer-facing portal | Not an e-commerce platform |
| Multi-currency | Complex rounding, region-specific |
| Credit notes / debit notes | Plugin defines document type |
| Approval workflows | Business-specific rules |

---

## 23. Comparison Table

| Feature | WordPress + WooCommerce | **avance-now** |
|---|---|---|
| Plugin permission model | ❌ Full access, no consent | ✅ Android-style, explicit consent |
| Authentication system | ❌ Delegated to plugins | ✅ Core, MFA built-in |
| Code signing | ❌ None | ✅ Cryptographic signature |
| Database-level security | ❌ None | ✅ PostgreSQL GRANT + RLS |
| Raw SQL for plugins | ✅ Unlimited | ❌ Query Builder only |
| Abandoned plugin protection | ❌ None | ✅ Health score + warnings |
| Supply chain protection | ❌ None | ✅ Signature verification |
| Database design | ❌ EAV anti-pattern | ✅ Normalized schema |
| Meta storage | ❌ EAV postmeta | ✅ Universal JSONB meta table |
| Tag & category system | ⚠️ Taxonomies (PHP only) | ✅ Universal polymorphic taxonomy |
| Task scheduler | ❌ Fake (WP-Cron) | ✅ Real job queue |
| XML-RPC | ❌ Enabled by default | ✅ Does not exist |
| Update safety | ❌ Direct to production | ✅ Staged + rollback |
| RBAC | ❌ 5 fixed roles | ✅ Fully custom |
| Plugin conflict detection | ❌ None | ✅ Manifest-based |
| Plugin sandboxing | ❌ None | ✅ PostgreSQL role isolation |
| Hook system | ✅ Actions & Filters | ✅ AVN: Actions & Filters (TypeScript) |
| Frontend framework lock-in | ⚠️ React (Gutenberg) | ✅ Any JS library |
| AI integration | ❌ No | ✅ Built into Core |
| Naming conventions | ❌ Inconsistent | ✅ AVN: prefix system |
| Docker support | ⚠️ Community only | ✅ Official docker-compose |
| Test coverage requirement | ❌ None | ✅ 80% minimum per module |
| License | GPL v2 | GPL v3 |

---

## 24. Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Backend language | TypeScript / Node.js | Type safety, largest contributor pool |
| HTTP framework | Fastify | Maximum freedom, high performance |
| Templating engine | EJS | Enables Hook system, PHP-like simplicity |
| CSS framework | DaisyUI + Tailwind | Semantic classes, shared between Core and plugins |
| Database | Database Agnostic | ORM allows support for any DB (PostgreSQL, MySQL, etc.) |
| Cache / Queue | Redis optional | System works without Redis |
| Plugin frontend | Any JS library | DaisyUI CSS is the only shared contract |
| Plugin marketplace | Centralized | Security review and signature verification |
| Multi-tenancy | Not in Core | Keeps schema simple |
| Mobile app | Not in Core | REST API serves all clients |
| License | GPL v3 | Distributed plugins must be open source |
| Document model | Single universal table | Plugins define new types without schema changes |
| Payment model | Standalone, linked via meta | Flexible allocation |
| Soft delete / edit | Optional, in audit_log | Off by default |
| AI access model | User's session token | Cannot exceed user permissions |
| Meta & Cache | Universal polymorphic tables | One table serves all entities and plugins |
| Taxonomy | Universal polymorphic table | One system for any entity |
| DB table prefix | `avn_` | No collision with plugin tables |
| Hook prefix | `AVN:` | No plugin hook naming collisions |
| Env var prefix | `AVN_` | Clear identification |
| TypeScript functions | No prefix — use module imports | TypeScript modules handle scoping |
| Testing framework | Vitest | Fast, TypeScript-native |
| Linter | ESLint + @typescript-eslint | Strict type safety |
| Formatter | Prettier | Automated, no style debates |
| Docker | Official docker-compose | Easy self-hosting |
| Documentation | JSDoc + external MD files | IDE support + human reading |
| Phases | 32 small phases | Small phases enable high-quality human review |

---

*This document is a living specification. All architectural decisions are recorded in Section 24.*
*Author: avance-now Core Team | License: GPL v3*
