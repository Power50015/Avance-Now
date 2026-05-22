# avance-now — Security Model

> Complete security architecture covering authentication, authorization, plugin security, AI security, and API security.

---

## 1. Security Overview

Security is the **#1 quality goal** for avance-now. The system implements defense-in-depth with multiple independent security layers:

```
┌─────────────────────────────────────────┐
│  Layer 1: API Security                  │
│  Session tokens, CSRF, rate limiting    │
├─────────────────────────────────────────┤
│  Layer 2: Application Security (RBAC)   │
│  requirePermission() on every route     │
├─────────────────────────────────────────┤
│  Layer 3: Database Security             │
│  ORM-level isolation, plugin scoping    │
├─────────────────────────────────────────┤
│  Layer 4: Plugin Security               │
│  Signatures, consent, Query Builder     │
├─────────────────────────────────────────┤
│  Layer 5: Audit & Compliance            │
│  Immutable audit log, IP tracking       │
└─────────────────────────────────────────┘
```

---

## 2. Authentication Layer (Core-Owned)

Authentication is a **Core responsibility** — never delegated to plugins.

### 2.1 Password Security
- **bcrypt/argon2** password hashing
- No plaintext storage at any point

### 2.2 Multi-Factor Authentication (MFA)
- **TOTP-based** (Time-based One-Time Password)
- QR code setup for authenticator apps
- `mfa_secret` encrypted at rest
- Enforcement middleware for protected operations

### 2.3 Session Management
- Short-lived session tokens stored in `avn_user_sessions`
- Tokens include: user_id, IP address, user agent, expiry timestamp
- `validateSession(token)` middleware used by **all** protected routes
- Session context set before each query for security scoping

### 2.4 Brute-Force Protection
- **5 failed login attempts** → 15-minute lockout
- **Rate limiting:** 10 auth requests/min per IP
- `AVN:auth.login_failed` hook fired on each failure (for monitoring plugins)

### 2.5 Auth-Related Hooks

| Hook | Type | Fired When |
|---|---|---|
| `AVN:auth.before_login` | Action | Before login attempt |
| `AVN:auth.after_login` | Action | Successful login |
| `AVN:auth.login_failed` | Action | Failed attempt |
| `AVN:auth.before_logout` | Action | Before logout |
| `AVN:auth.after_logout` | Action | After logout |
| `AVN:auth.credentials` | Filter | Validates credentials |
| `AVN:auth.session_data` | Filter | Session payload before save |

---

## 3. Authorization Layer (RBAC)

### 3.1 Role-Based Access Control

- **Fully customizable roles** (not fixed like WordPress's 5 roles)
- **Granular permissions** scoped to modules and plugins
- Permission format: `action:resource` (e.g., `read:documents`, `write:products`)

### 3.2 RBAC Tables

```
avn_users ←→ avn_user_roles ←→ avn_roles
                                    ↓
                            avn_role_permissions
                                    ↓
                            avn_permissions
```

### 3.3 Default Roles

| Role | Description |
|---|---|
| Admin | Full access to all Core features and plugin management |
| Manager | Manage documents, parties, products, payments. Cannot manage plugins or users. |
| Staff | Create and view documents, parties. Limited editing. |
| Read-Only | View-only access to all entities |

### 3.4 Permission Enforcement

```typescript
// Every protected route uses this middleware
requirePermission('read:documents')
requirePermission('write:products')
requirePermission('manage:plugins')
```

- 403 on permission denied with clear message
- `AVN:user.permission_check` filter fires on **every** check — plugins can extend permission logic

---

## 4. Plugin Security

### 4.1 Cryptographic Code Signing

- All marketplace plugins require cryptographic signatures
- Core verifies signature before install or update
- Unsigned plugins trigger explicit warning + manual confirmation
- Public key registry for verified developers

### 4.2 Android-Style Consent Screen

Before any plugin installation, the admin sees exactly what the plugin requests:

```
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
```

### 4.3 Database-Level Isolation

```sql
-- On install: Create isolated role with ONLY declared permissions
CREATE ROLE warranty_plugin_role;
GRANT SELECT, INSERT, UPDATE ON avn_warranty_details TO warranty_plugin_role;
GRANT SELECT ON avn_products TO warranty_plugin_role;

-- Plugin tries to access undeclared table
SELECT * FROM avn_documents
-- ERROR: relation "avn_documents" does not exist
-- Not "permission denied" — "does not exist"
```

**Key principle:** Undeclared tables are **invisible**, not just blocked. A plugin cannot even confirm whether a table exists.

### 4.4 Query Builder Only

- **No raw SQL** for plugins
- Plugins interact with the database exclusively through the Core's Query Builder API
- Query Builder automatically applies security context and enforces declared table permissions

### 4.5 Sensitive Table Protection

Plugin DB roles have **no access** to:
- `avn_users`
- `avn_user_sessions`
- `avn_audit_log`

### 4.6 Plugin Manifest (plugin.json)

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

### 4.7 Plugin Health Score

- Tracks: last update date, open CVEs, maintenance status
- Warning displayed for plugins with known vulnerabilities
- Plugin removal for abandoned/unpatched plugins (mirrors WordPress's 1,614 removals in 2024)

---

## 5. AI Security

The AI assistant operates under strict security constraints:

| Rule | Implementation |
|---|---|
| **User-scoped access** | AI operates exclusively through the user's own session token |
| **No privilege escalation** | AI cannot see or modify data outside the user's permissions |
| **User attribution** | All AI-triggered actions logged in `avn_audit_log` under the user's `user_id` — not an AI system account |
| **API-only access** | AI calls Core REST API using user's session token → RBAC and security enforce what data is visible |

### AI Request Flow

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

---

## 6. API Security

| Protection | Implementation |
|---|---|
| **Authentication** | Every endpoint requires valid session token (except `/health` and `/api/v1/auth/login`) |
| **CSRF** | CSRF protection on all state-changing requests |
| **Input Validation** | Fastify JSON Schema validation on every route |
| **Rate Limiting** | Rate limiting at Fastify layer (10 req/min per IP on auth endpoints) |
| **Error Format** | Consistent `{ error, message, code }` — no internal details leaked |

---

## 7. Audit & Compliance

### 7.1 Audit Log

- **Immutable, permanent** — cannot be edited or deleted
- Logs every state-changing action
- Records: user_id, action, entity, entity_id, old_data, new_data, ip_address, timestamp

### 7.2 Soft Delete & Edit History (Optional)

- When enabled: `avn_audit_log` records `old_data` before delete/edit
- Admin UI to view deleted records and restore
- Off by default — configurable per entity type

### 7.3 Device Tracking

- IP address and user agent stored with every session
- Available in audit log for forensic analysis

---

## 8. Security Comparison: avance-now vs WordPress

| Feature | WordPress | avance-now |
|---|---|---|
| Plugin permission model | ❌ Full access, no consent | ✅ Android-style, explicit consent |
| Authentication system | ❌ Delegated to plugins | ✅ Core, MFA built-in |
| Code signing | ❌ None | ✅ Cryptographic signature |
| Database-level security | ❌ None | ✅ DB role isolation |
| Raw SQL for plugins | ✅ Unlimited | ❌ Query Builder only |
| Abandoned plugin protection | ❌ None | ✅ Health score + warnings |
| Supply chain protection | ❌ None | ✅ Signature verification |
| Plugin sandboxing | ❌ None | ✅ DB role isolation |

---

*Source: avance-now-arc42.md (Section 8.3, ADR-004) and avance-now-analysis-v2.md (Sections 3, 11, 19)*
