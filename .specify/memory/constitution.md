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

> Complete step-by-step roadmap for building the avance-now platform.

### Implementation Strategy

The development of avance-now is broken down into **32 distinct, small phases**.

**Rules of Execution:**

1. Each phase produces specific, testable deliverables.
2. A phase is not complete until all its unit and integration tests pass (minimum 80% coverage).
3. No phase starts until the previous phase is verified and reviewed by a human.
4. This ensures steady, high-quality progress without accumulating technical debt.

### Technical Constraints

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

**Version**: 1.0.0 | **Ratified**: 2026-05-22 | **Last Amended**: 2026-05-22
