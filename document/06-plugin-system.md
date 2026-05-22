# avance-now — Plugin System & Extensibility

> Complete design and implementation of the plugin ecosystem, including manifest requirements, permissions, and the hook engine.

---

## 1. Plugin System Philosophy

The plugin system is inspired by WordPress but built with modern security principles similar to mobile operating systems (Android/iOS). 

**Core Principles:**
1. Plugins are untrusted by default.
2. Plugins must explicitly declare all required permissions.
3. The Admin must explicitly grant these permissions before installation.
4. If a permission is not granted, the feature is disabled (or the plugin is blocked).
5. The database enforces data isolation (via ORM layer).
6. Plugins cannot modify Core files or execute raw SQL.

---

## 2. The Plugin Manifest (`plugin.json`)

Every plugin must include a `plugin.json` manifest at its root. The Core uses this file to determine what the plugin is, what it needs, and how to verify its integrity.

### 2.1 Manifest Schema

```json
{
  "id": "acme-warranty-manager",
  "name": "Warranty Manager",
  "version": "1.0.0",
  "author": "Acme Corp",
  "description": "Adds warranty tracking to products and documents.",
  "signature": "sha256:abc123def456...",
  "requires_core": ">=0.3.0",
  "dependencies": [
    "acme-core-utils"
  ],
  "permissions": {
    "database": {
      "avn_warranty_details": ["read", "write"],
      "avn_products": ["read"]
    },
    "hooks": [
      "AVN:document.after_header",
      "AVN:product.detail_html"
    ],
    "api_routes": [
      "/warranty", 
      "/warranty/:id"
    ],
    "http_outbound": [
      "api.acmecorp.com"
    ]
  }
}
```

### 2.2 Permissions Explained

| Permission Type | Description |
|---|---|
| `database` | Declares exactly which tables the plugin needs to read or write. Access is granted at the ORM/DB level. Trying to access an undeclared table will result in a "table does not exist" error. |
| `hooks` | Declares which Actions and Filters the plugin will attach to. |
| `api_routes` | Declares the API routes the plugin will expose. |
| `http_outbound` | (Optional future feature) Declares external domains the plugin will contact, preventing data exfiltration to unauthorized servers. |

---

## 3. The Hook Engine (Actions & Filters)

The Hook Engine is the primary mechanism for plugins to extend Core behavior without modifying Core code. It is entirely written in TypeScript.

### 3.1 Actions

Actions allow plugins to execute code or inject HTML at specific points in the application lifecycle or page rendering process.

**Core Definition:**
```typescript
/**
 * Executes all handlers attached to an action.
 * If the action is used in a template, it concatenates and returns HTML strings.
 */
hooks.doAction('AVN:document.after_header', { documentId: '123' })
```

**Plugin Registration:**
```typescript
hooks.addAction('AVN:document.after_header', async (context) => {
  const warranty = await getWarranty(context.documentId)
  return `<div class="alert alert-info">Warranty: ${warranty.status}</div>`
}, 10) // 10 is the priority (lower runs first)
```

### 3.2 Filters

Filters allow plugins to intercept and modify data before it is saved to the database or displayed to the user.

**Core Definition:**
```typescript
/**
 * Passes a value through all registered filter handlers sequentially.
 * Each handler receives the output of the previous handler.
 */
const finalPrice = await hooks.applyFilter('AVN:product.price', basePrice, { product })
```

**Plugin Registration:**
```typescript
hooks.addFilter('AVN:product.price', async (price, context) => {
  if (context.product.category === 'sale') {
    return price * 0.9 // 10% discount
  }
  return price
}, 10)
```

### 3.3 Hook Naming Convention

All Core hooks **must** be prefixed with `AVN:`.
Format: `AVN:<entity>.<event>`

Examples:
- `AVN:document.created` (Action)
- `AVN:auth.login_failed` (Action)
- `AVN:product.price` (Filter)
- `AVN:admin.sidebar_menu` (Action - HTML injection)

Plugin-defined hooks should use their own prefix to avoid collisions (e.g., `ACME:warranty.expired`).

---

## 4. Plugin Lifecycle

Plugins go through a defined lifecycle managed by the Core.

### 4.1 Installation & Consent

1. Admin uploads/selects a plugin from the marketplace.
2. Core extracts `plugin.json` and verifies the `signature`.
3. Core presents the **Consent UI** showing requested permissions.
4. Admin approves.
5. Core records permissions in `avn_plugin_permissions`.
6. Core triggers the `onInstall` callback (plugin runs migrations/seeds).

### 4.2 Activation

1. Admin clicks "Activate".
2. Core triggers the `onActivate` callback.
3. Plugin registers its hooks and routes.
4. Core marks plugin as active in `avn_plugins`.

### 4.3 Runtime (Bootstrapping)

On server startup, the `fs-loader` component:
1. Reads all active plugins from `avn_plugins`.
2. Loads each plugin module.
3. Calls the plugin's bootstrap function to register hooks and routes.

**Error Isolation:** If a plugin crashes during bootstrap, the Core catches the exception, disables the plugin, logs the error, and continues loading the rest of the system.

### 4.4 Deactivation & Uninstallation

- `onDeactivate`: Plugin unregisters hooks/routes (temporary disable).
- `onUninstall`: Plugin drops its tables and cleans up data (permanent removal).

---

## 5. Security Context (Query Builder)

To enforce database isolation without raw SQL, plugins must use the Core Query Builder.

```typescript
// Good: Uses Query Builder, which automatically applies the plugin's DB role
const db = getDatabaseClient(pluginContext)
const details = await db.table('avn_warranty_details').select('*').where('id', 1)

// Bad: Raw SQL is blocked/unsupported
// db.raw('SELECT * FROM avn_users') // Blocked by architecture and ORM constraints
```

---

*Source: avance-now-arc42.md (Section 3, 8.3) and avance-now-analysis-v2.md (Section 2, 7, 10)*
