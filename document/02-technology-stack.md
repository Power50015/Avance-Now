# avance-now — Technology Stack & Technical Constraints

> Complete technology decisions, justifications, and technical constraints.

---

## 1. Full Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| **Language** | TypeScript (Node.js 20 LTS) | Type safety end-to-end, largest open source contributor pool, modern ecosystem |
| **HTTP Framework** | Fastify | Maximum architectural freedom, 70K+ req/s, first-party WebSocket, does not compete with plugin system design |
| **Templating Engine** | EJS | Server-side HTML rendering that enables the Hook system, PHP-like simplicity for plugin developers |
| **CSS Framework** | DaisyUI + Tailwind CSS | Semantic component classes, built-in theming, shared between Core and all plugins, no framework lock-in |
| **Database** | Database Agnostic (via ORM) | ORM abstracts database operations, supports PostgreSQL, MySQL, SQLite, and other relational databases |
| **Cache / Queue** | Redis (optional) | System is fully functional without Redis. When configured, Redis backs the job queue and session cache |
| **Linter** | ESLint + @typescript-eslint | Strict type safety, catches errors before runtime |
| **Formatter** | Prettier | Automated formatting, no style debates |
| **Testing** | Vitest | Fast, TypeScript-native, runs alongside the build without extra configuration |
| **Containers** | Docker + Docker Compose | Reproducible dev/test/prod environments, easy self-hosting |
| **Package Manager** | npm workspaces | Monorepo support, universal familiarity |
| **License** | GPL v3 | Distributed plugins must be open source |

---

## 2. Framework Selection Rationale

### Why Fastify Over Other Options

| Framework | Why Rejected |
|---|---|
| **Laravel** | Enforces a "Laravel way" conflicting with our architecture. PHP has weaker WebSocket support. |
| **Next.js** | Requires Vercel hosting in practice. Incompatible with self-hosted open source ERP. |
| **Django** | Smaller plugin developer community for ERP use cases. |
| **TanStack Start** | Immature ecosystem for community-driven open source. |
| **NestJS** | Enforces decorators/DI/controllers that constrain our plugin architecture. |
| **Fastify** | ✅ Handles HTTP and gets out of the way. Everything above it is ours to design. |

### Why EJS Over Template Literals

EJS allows separate `.ejs` files with clean HTML — identical in feel to PHP templates. Template literals embed HTML in JS strings, breaking readability and removing partials/layouts support.

**Key advantage:** Server-side rendering enables the Hook system. The Hook system (`doAction` returning HTML strings) only works when HTML is built on the server in a sequential, hookable pipeline. In a pure SPA model, plugins would need a separate, complex frontend hook system.

### Why Database Agnostic (ORM)

The application uses an ORM which abstracts database operations, allowing it to support any relational database (e.g., PostgreSQL, MySQL, SQLite). Security, tenant isolation, and plugin data scoping are managed through the ORM and application layer, providing maximum flexibility and broader hosting options.

---

## 3. Technical Constraints

### 3.1 Hard Constraints

| Constraint | Motivation |
|---|---|
| **Database Agnostic via ORM** | The application uses an ORM which abstracts database operations, allowing it to support any relational database without problems. |
| **Node.js 20 LTS** | Long-term support guarantees stability for an open source project. npm ecosystem gives the widest plugin developer contributor pool. |
| **TypeScript strict mode** | Type safety is non-negotiable for a plugin system where multiple developers extend the same codebase. |
| **EJS as templating engine** | Server-side HTML rendering is required to enable the Hook system. Plugins must be able to inject HTML at defined action points during page rendering — impossible with a pure SPA. |
| **No raw SQL for plugins** | Plugins interact with the database exclusively through the Core's Query Builder API, which automatically applies RLS context and enforces declared table permissions. |
| **GPL v3 license** | Plugins that are distributed to others must be open source. Keeps the ecosystem permanently open. |

### 3.2 Organizational Constraints

| Constraint | Motivation |
|---|---|
| **Centralized plugin marketplace** | All marketplace plugins undergo security review and must include cryptographic signatures. No self-published plugins on the official marketplace. |
| **No multi-tenancy in Core** | Keeps the schema simple. Organizations running the platform as SaaS implement their own isolation layer. |
| **No mobile app in Core** | The REST API serves all clients. Mobile apps are separate systems built on top of the public API. |

---

## 4. Naming & Prefix Conventions

### 4.1 Database Tables — `avn_` prefix

```sql
-- Core tables
avn_users         avn_roles         avn_permissions
avn_documents     avn_products      avn_parties
avn_plugins       avn_meta          avn_cache
avn_taxonomies    avn_taxonomy_items

-- Plugin-created tables use both prefixes
avn_crm_deals
avn_warranty_details
avn_inventory_warehouses
```

### 4.2 Hooks & Filters — `AVN:` prefix

```typescript
// Core hooks
hooks.doAction('AVN:document.created', data)
hooks.applyFilter('AVN:product.price', price, context)

// Plugin hooks
hooks.doAction('AVN:crm-plugin:deal.closed', deal)
```

### 4.3 Environment Variables — `AVN_` prefix

```
AVN_DATABASE_URL
AVN_PORT
AVN_SECRET_KEY
AVN_REDIS_URL
AVN_AI_PROVIDER_URL
AVN_AI_API_KEY
AVN_NODE_ENV
AVN_LOG_LEVEL
```

### 4.4 TypeScript Modules — No prefix needed

```typescript
import { create, update } from '@avance-now/documents'
import { register } from '@avance-now/hooks'
// TypeScript module imports handle scoping cleanly
```

### 4.5 Files & Folders — kebab-case

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

## 5. Code Quality Standards

### 5.1 ESLint Configuration

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

### 5.2 Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

### 5.3 Git Hooks — Husky + lint-staged

```
pre-commit:
  - lint-staged (ESLint + Prettier on staged files)
  - TypeScript type check (--noEmit)

pre-push:
  - unit tests for changed modules
```

### 5.4 Documentation Standards

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

### 5.5 Testing Standards

```
src/core/documents/
  create.ts
  create.test.ts
  update.ts
  update.test.ts
```

- **Unit tests** — every exported function tested in isolation with mocked dependencies
- **Integration tests** — full request-response against real test database
- **Coverage requirement** — minimum 80% line coverage per module before phase completion

---

## 6. Monorepo Structure

```
packages/
  core/         ← main ERP application
  shared/       ← shared types and utilities
  cli/          ← command-line tools
```

---

*Source: avance-now-arc42.md (Sections 2, 4) and avance-now-analysis-v2.md (Sections 5–7)*
