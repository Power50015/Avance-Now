# avance-now — Project Overview & Vision

> Complete project summary extracted from arc42 architecture documentation and project analysis v2.

**Project:** avance-now
**Version:** 0.3.0-draft
**Status:** Pre-development — Conceptual Phase
**License:** GPL v3
**Last Updated:** 2026-05-22

---

## 1. What is avance-now?

**avance-now** is a lightweight, extensible, open-source ERP (Enterprise Resource Planning) platform built for businesses that need a solid, secure foundation they can grow on top of.

### Core Identity

- **Type:** Internal operations tool (NOT a storefront)
- **Model:** Plugin-based modular monolith
- **Inspiration:** WordPress plugin ecosystem concept — with correct execution
- **Guiding metaphor:** *"WordPress taught us the concept. We are doing the execution right."*

### What It Is

- An internal operations tool for staff
- A document management system (invoices, orders)
- A party management system (customers, suppliers)
- A product catalog (internal, not customer-facing)
- A payment tracking system
- An extensible platform via sandboxed plugins

### What It Is NOT

- Not a storefront or e-commerce platform
- Not a customer-facing checkout or cart
- Not a consumer portal
- Not a mobile app (mobile clients use the REST API)
- Not a multi-tenant SaaS platform (single-tenant by design)

---

## 2. Core Functional Requirements

| # | Requirement | Description |
|---|---|---|
| FR-01 | **Document Management** | Create, track, and manage invoices and orders (incoming and outgoing) |
| FR-02 | **Party Management** | Track customers and suppliers in a single unified table |
| FR-03 | **Product Catalog** | Maintain an internal catalog of products and services |
| FR-04 | **Payment Tracking** | Record and link payments to documents |
| FR-05 | **Plugin System** | Allow third-party developers to safely extend the system |
| FR-06 | **User Access** | Role-based access control with customizable roles and permissions |
| FR-07 | **AI Assistant** | Built-in chat assistant operating under the active user's permissions |
| FR-08 | **Audit Trail** | Immutable log of all state-changing actions |

---

## 3. Quality Goals (Prioritized)

| Priority | Quality Goal | Key Scenario |
|---|---|---|
| 1 | **Security** | A malicious plugin cannot access data outside its declared permissions — not even by knowing table names |
| 2 | **Extensibility** | A plugin developer can add a new document type, new UI sections, and new API endpoints without modifying Core code |
| 3 | **Reliability** | A plugin that crashes does not crash the Core. Background jobs run on schedule regardless of web traffic |
| 4 | **Maintainability** | Any module can be understood, tested, and modified independently. 80% minimum test coverage enforced per module |
| 5 | **Self-Hostability** | The system runs with a single `docker compose up` command on any Linux server |

---

## 4. Stakeholders

| Role | Key Expectations |
|---|---|
| **Business Owner / Admin** | Easy to install and operate. Plugin installation is safe with visible permission consent. Full audit trail. |
| **Staff (end user)** | Fast, reliable admin panel. AI assistant helps with daily tasks. Clear document and payment workflows. |
| **Plugin Developer** | Clear, documented Hook API. Stable Core contracts. Manifest-based permission system. Freedom to use any frontend library. |
| **Open Source Contributor** | Clean codebase. Strict linting and formatting. Documented modules. Test coverage enforced. |
| **System Administrator** | Docker-first deployment. Environment variable configuration. Redis optional. |

---

## 5. Core Philosophy & Design Principles

> *"The core does one thing well. Plugins do the rest — but only with your permission."*

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

## 6. Inspiration Sources

| Inspiration | What We Borrow | What We Reject |
|---|---|---|
| **WordPress** | Plugin ecosystem, Hook system (Actions & Filters), simplicity | EAV database, zero plugin sandboxing, insecure auth, WP-Cron, XML-RPC |
| **WooCommerce** | Commerce-first thinking | Postmeta-based storage |
| **Android** | Per-plugin permission system, explicit consent | N/A |
| **Fastify** | Minimal HTTP layer, maximum freedom | Opinionated MVC |
| **PostgreSQL** | Row Level Security, GRANT system, JSONB | EAV workarounds |

---

## 7. Problems Being Solved

### Security Problems

| ID | WordPress Problem | avance-now Solution |
|---|---|---|
| P-SEC-01 | Authentication delegated to plugins. CVE-2024-10924 allowed login as any user. | Auth is a Core responsibility. Built-in MFA (TOTP), short-lived session tokens, brute-force protection. |
| P-SEC-02 | 96% of vulnerabilities from plugins. 43% require zero auth. Any plugin gets full DB access. | Android-inspired permission model. Plugin declares needs. Admin approves. Unapproved access is invisible. |
| P-SEC-03 | In 2024, attackers compromised a plugin pipeline — hit 2 million sites. | Cryptographic code signing. Core verifies signature before install or update. |
| P-SEC-04 | 1,614 plugins removed in 2024 for unpatched vulnerabilities. | Plugin Health Score showing last update, open CVEs, maintenance status. |

### Architecture Problems

| ID | WordPress Problem | avance-now Solution |
|---|---|---|
| P-ARCH-01 | Everything stored in two tables using EAV. WooCommerce HPOS showed 5x faster orders. | Every entity has its own normalized schema. JSONB only for descriptive metadata. |
| P-ARCH-02 | WP-Cron fires only on page visits. Unreliable and slow. | Real background job queue in `avn_jobs` with dedicated worker processes. |
| P-ARCH-03 | XML-RPC used for brute-force attacks. Heartbeat polls every 15 seconds. | No XML-RPC. Real-time via SSE or WebSockets. |
| P-ARCH-04 | No dependency system. Plugin conflicts discovered after crash. | `plugin.json` manifest with explicit dependencies. Core resolves graph before install. |

### Operations Problems

| ID | WordPress Problem | avance-now Solution |
|---|---|---|
| P-OPS-01 | Updates applied directly to live site cause downtime. | One-click staging. Updates applied to staging first. Admin approves or rolls back. |
| P-OPS-02 | 5 fixed roles — inadequate for ERP. | Full RBAC. Roles fully customizable. Permissions scoped to modules and plugins. |

---

## 8. License Strategy

- **License:** GPL v3
- **Rationale:** Plugins run on the server alongside Core code → derivative works under GPL → distributed plugins must be open source
- **Why not AGPL:** Appears on corporate blacklists, would hurt adoption
- **Commercial plugins:** Developers can sell support/updates but cannot ship closed-source binaries
- **Enterprise use:** Self-host and customize without releasing changes (private use doesn't trigger GPL distribution)

---

*Source: avance-now-arc42.md (Sections 1, 2) and avance-now-analysis-v2.md (Sections 1–4)*
