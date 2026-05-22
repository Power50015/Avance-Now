# avance-now Constitution

## Core Principles

### I. Security-First Architecture
Security is not a plugin — it is the Core. Every aspect of the system must be designed with security as the foundational layer, including role-based access control, plugin permission systems, and database-level security enforcement. Plugins operate under strict permission models and cannot access data beyond their explicitly granted permissions.

### II. Plugin-Based Extensibility
The system follows a plugin-based modular monolith architecture where Core provides essential ERP functionality and plugins extend capabilities. Plugins are guests that must request and receive explicit permission to access system resources. The Hook system (Actions & Filters) enables infinite extensibility without modifying Core code.

### III. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced. Nothing ships without tests, and minimum 80% line coverage per module is required before phase completion.

### IV. Explicit Over Implicit
Explicit is better than magic. All system behaviors should be clear, predictable, and well-documented. Plugin developers must declare their dependencies, permissions, and intentions explicitly through manifests and APIs.

### V. Schema Integrity
The database schema reflects business reality — no EAV (Entity-Attribute-Value) anti-patterns. Every entity has its own normalized structure. JSONB is used only for descriptive metadata, never for core business data.

### VI. Observability & Debuggability
The system prioritizes observability through structured logging, clear error messages, and diagnostic capabilities. Text-based interfaces ensure debuggability, and all significant actions produce audit trails.

### VII. Versioning & Stability
Updates should never break production environments. The system uses semantic versioning (MAJOR.MINOR.BUILD) with clear deprecation policies. Breaking changes require major version increments and explicit migration paths.

### VIII. Simplicity & Pragmatism
Start simple, embrace YAGNI (You Aren't Gonna Need It) principles, and avoid over-engineering. Solutions should address actual problems rather than hypothetical scenarios.

## Technology Stack Constraints

### Language & Runtime
- TypeScript (Node.js 20 LTS) is mandatory for type safety and ecosystem access
- Strict TypeScript mode enabled (@typescript-eslint/strict)

### Framework & Libraries
- Fastify HTTP framework for maximum architectural freedom
- EJS templating engine to enable server-side Hook system
- DaisyUI + Tailwind CSS for consistent, themeable UI
- ORM for database abstraction (PostgreSQL, MySQL, SQLite supported)

### Tooling & Quality
- ESLint + Prettier for code quality and formatting
- Vitest for TypeScript-native testing
- Docker + Docker Compose for reproducible environments
- npm workspaces for monorepo management

### Licensing
- GPL v3 license ensures distributed plugins remain open source
- Commercial support/updates permitted but closed-source distribution prohibited

## Development Workflow & Quality Gates

### Code Review Requirements
All PRs must verify compliance with this Constitution. Complexity must be justified and documented. Code review includes:
- Security implications assessment
- Test coverage validation (minimum 80% per module)
- Dependency and permission declaration verification
- Documentation completeness check

### Testing Gates
- Unit tests for all exported functions with mocked dependencies
- Integration tests for request-response flows against test databases
- Plugin sandbox testing to verify isolation and permission enforcement
- Coverage enforcement: 80% minimum line coverage per module

### Deployment Standards
- Single `docker compose up` command for self-hosting
- Environment variable configuration (`AVN_*` prefix)
- Zero-duty deployment strategy with staging approval
- Immutable infrastructure principles

## Governance

This Constitution supersedes all other development practices and guidelines. Amendments to this Constitution require:
1. Documentation of proposed changes
2. Maintainer approval
3. Migration plan for existing codebases
4. Version increment in constitution header

All developers and contributors are responsible for understanding and adhering to these principles. The Constitution evolves with the project but maintains backward compatibility where possible.

**Version**: 1.0.0 | **Ratified**: 2026-05-22 | **Last Amended**: 2026-05-22