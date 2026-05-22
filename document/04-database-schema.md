# avance-now — Database Architecture & Schema

> Complete database design including all tables, relationships, universal patterns, and data examples.

---

## 1. Database Design Principles

| Principle | Description |
|---|---|
| **Database Agnostic** | ORM abstracts all operations — supports PostgreSQL, MySQL, SQLite, etc. |
| **Normalized Schema** | Every entity has typed columns, FK constraints, and indexes — no EAV |
| **Universal Meta Table** | One `avn_meta` serves all entities via polymorphic association |
| **Universal Cache Table** | One `avn_cache` stores computed values for fast reads |
| **Universal Taxonomy** | One `avn_taxonomies` + `avn_taxonomy_items` handles tags/categories for any entity |
| **Security at ORM Layer** | Plugin isolation and data scoping managed through ORM and application logic |
| **Plugin DB Roles** | Each plugin gets its own isolated database permissions |

---

## 2. Complete Database Schema

### Section 1 — Users & Access (5 tables)

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

### Section 2 — Plugin System (2 tables)

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

### Section 3 — Core Entities (2 tables)

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

### Section 4 — Documents (2 tables)

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

> Note: Meta and cache for `avn_document_items` use the universal tables with `reference_table = 'avn_document_items'`. This allows plugins to attach per-line data (e.g. discount reason, tax breakdown, serial number) without schema changes.

### Section 5 — Payments (1 table)

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

> Payments link to documents through `avn_meta`: `reference_table = 'avn_payments'`, `data = { "document_id": "uuid", "allocated_amount": 1000 }`. One payment can span multiple documents.

### Section 6 — Universal Tables (4 tables)

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

### Section 7 — Shared Utilities (2 tables)

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

### Section 8 — System (3 tables)

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

### Section 9 — AI (2 tables)

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

## 3. Table Summary

| Section | Tables | Count |
|---|---|---|
| Users & Access | `avn_users`, `avn_user_sessions`, `avn_roles`, `avn_permissions`, `avn_role_permissions`, `avn_user_roles` | 6 |
| Plugin System | `avn_plugins`, `avn_plugin_permissions` | 2 |
| Core Entities | `avn_parties`, `avn_products` | 2 |
| Documents | `avn_documents`, `avn_document_items` | 2 |
| Payments | `avn_payments` | 1 |
| Universal Tables | `avn_meta`, `avn_cache`, `avn_taxonomies`, `avn_taxonomy_items` | 4 |
| Shared Utilities | `avn_media`, `avn_notes` | 2 |
| System | `avn_audit_log`, `avn_jobs`, `avn_settings` | 3 |
| AI | `avn_ai_sessions`, `avn_ai_context_cache` | 2 |
| **Total** | | **24** |

---

## 4. Universal Pattern Details

### 4.1 Universal Meta Pattern

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

**Rule:** JSONB used only for descriptive metadata — never for queryable numeric/date values.

### 4.2 Universal Cache Pattern

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

**Rule:** Queryable values go here as typed key-value rows — not in JSONB.

### 4.3 Universal Taxonomy Pattern

```
avn_taxonomies — defines tags and categories
avn_taxonomy_items — links any entity to any taxonomy
```

Any entity — Core or plugin — can be tagged or categorized with no schema changes.

---

## 5. Real-World Data Examples

### Example 1 — Incoming Invoice: 10% Discount + 14% Tax + Note + Image

**Scenario:** Company received a supplier invoice. 10% bulk discount negotiated. 14% VAT applies.

| Table | Data |
|---|---|
| `avn_documents` | `type: "invoice"`, `direction: "incoming"`, `status: "confirmed"`, `number: "SINV-2024-0042"` |
| `avn_document_items` | 2 items: 5× Office Chair @ 200 = 1000; 1× Delivery @ 150 = 150 |
| `avn_meta` (discount) | `discount_type: "percentage"`, `discount_value: 10`, `discount_reason: "Bulk order negotiated rate"` |
| `avn_cache` | `subtotal: 1150`, `discount_amount: 115`, `taxable_amount: 1035`, `tax_amount: 144.90`, `total: 1179.90` |
| `avn_media` | Invoice scan (JPEG, 245KB) |
| `avn_notes` | "Original paper invoice filed in folder A-2024. Approved by manager Nov 3rd." |

### Example 2 — Outgoing Invoice Paid in Two Installments

**Scenario:** Invoice of 3000 EGP. Customer paid 1000 first, then 2000.

| Table | Data |
|---|---|
| `avn_payments` (1st) | `amount: 1000`, `method: "transfer"`, `reference: "TRF-20241105-001"` |
| `avn_meta` (1st link) | `document_id: "doc-002"`, `allocated_amount: 1000` |
| `avn_payments` (2nd) | `amount: 2000`, `method: "transfer"` |
| `avn_meta` (2nd link) | `document_id: "doc-002"`, `allocated_amount: 2000` |
| `avn_cache` (after) | `total: 3000`, `paid_amount: 3000`, `remaining: 0` |

### Example 3 — Product with Tags and Nested Category

**Scenario:** "Industrial Steel Shelf" tagged as "Heavy Duty" and "Sale", under category "Storage > Shelving".

| Table | Data |
|---|---|
| `avn_taxonomies` | category: "Storage" (parent: null) → "Shelving" (parent: Storage); tags: "Heavy Duty", "Sale" |
| `avn_taxonomy_items` | 3 links: product → Shelving, product → Heavy Duty, product → Sale |

### Example 4 — Party with Cache Stats

**Scenario:** Supplier "Al-Nile Trading" — computed stats for dashboard.

| Cache Key | Value |
|---|---|
| `total_billed` | 85,000.00 |
| `total_paid` | 72,000.00 |
| `outstanding` | 13,000.00 |
| `last_invoice_at` | 2024-11-20 |
| `risk_level` | "medium" |

---

## 6. Under-the-Hood Details

### Persistence
- Every entity table has proper typed columns, FK constraints, and indexes
- JSONB used only for descriptive metadata — never for queryable numeric/date values
- Queryable values go in `avn_cache` as typed key-value rows
- Polymorphic associations via `(reference_id, reference_table)` compound keys

### Transactions
- All writes to multiple tables wrapped in database transactions
- Migration runner applies migrations in order, with rollback support

### Session Management
- Sessions stored in `avn_user_sessions` with expiry
- Session context set before each query for security scoping

### Caching
- `avn_cache` stores computed values (totals, counts, dates) updated asynchronously
- Redis cache layer (when configured) for session data and job queue

### Background Jobs
- DB-backed by default: `avn_jobs` polled every 5 seconds by worker process
- Redis-backed when `AVN_REDIS_URL` is set
- Retry logic: max 3 attempts with exponential backoff
- Dead letter: failed jobs stored with full error for manual inspection

---

*Source: avance-now-arc42.md (Sections 5.3, 8.5) and avance-now-analysis-v2.md (Sections 12–14)*
