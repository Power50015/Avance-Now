# Research: Foundation Setup

## Decisions Made

### Project Structure and Tooling
**Decision**: Use a monorepo structure with separate backend and frontend directories, TypeScript for backend, and standard web development tooling.
**Rationale**: The advance-now constitution specifies TypeScript, Fastify, and a web application structure. The foundation setup phase focuses on setting up the repository structure, linting, formatting, and containerization for consistency.
**Alternatives considered**:
- Single frontend/backend mixed structure - Rejected due to scalability concerns
- Separate repositories for backend and frontend - Rejected due to increased complexity in versioning and deployment
- No containerization - Rejected due to "works on my machine" issues and constitution's Docker requirement

### Language and Runtime
**Decision**: TypeScript with Node.js 20 LTS
**Rationale**: Explicitly specified in the advance-now constitution under Technical Constraints. Provides static typing for better developer experience and catches errors at compile time. Node.js 20 LTS ensures long-term support and stability.
**Alternatives considered**: 
- JavaScript (ES6+) - Rejected due to lack of type safety which would violate constitution's strict TypeScript requirement
- Python - Rejected despite popularity for backend services due to constitution mandate
- Go - Rejected despite performance benefits due to constitution mandate
- Deno - Rejected due to constitution specifying Node.js specifically

### HTTP Framework (for future implementation)
**Decision**: Fastify
**Rationale**: Explicitly specified in the advance-now constitution under Technical Constraints. Known for high performance, low overhead, and excellent plugin system that aligns well with advance-now's plugin architecture.
**Alternatives considered**:
- Express.js - Rejected despite popularity due to constitution mandate and Fastify's superior performance
- Koa.js - Rejected due to constitution mandate
- NestJS - Rejected as it adds abstraction layer that may conflict with constitution's minimal core principle
- Hapi.js - Rejected due to constitution mandate

### Templating Engine (for future implementation)
**Decision**: EJS (Embedded JavaScript templates)
**Rationale**: Explicitly specified in the advance-now constitution under Technical Constraints. Required to enable the Hook system (`hooks.doAction`, `hooks.applyFilter`) as stated in Principle IV.
**Alternatives considered**:
- Pug/Jade - Rejected despite popularity due to constitution mandate
- Handlebars - Rejected due to constitution mandate
- Mustache - Rejected due to constitution mandate
- JSX (via React) - Rejected despite popularity due to constitution mandate requiring EJS specifically

### Styling Framework (for future implementation)
**Decision**: DaisyUI with Tailwind CSS
**Rationale**: Explicitly specified in the advance-now constitution under Technical Constraints. Provides semantic class names that align with the constitution's requirement for plugin frontend alignment.
**Alternatives considered**:
- Bootstrap - Rejected despite popularity due to constitution mandate
- Bulma - Rejected due to constitution mandate
- Plain CSS - Rejected despite flexibility due to constitution mandate
- Material UI - Rejected due to constitution mandate
- Ant Design - Rejected due to constitution mandate

### Containerization
**Decision**: Docker + Docker Compose
**Rationale**: Explicitly specified in the advance-now constitution under Technical Constraints. Ensures consistent development environments and matches the specification's requirement for reproducible environments.
**Alternatives considered**:
- Podman - Rejected despite Docker alternative due to constitution specifying Docker specifically
- Kubernetes - Rejected as overkill for local development despite production orchestration benefits
- Vagrant - Rejected due to constitution mandate and Docker's superior performance
- Local installation - Rejected despite simplicity due to specification requirement for containerized environments

### Testing Framework (for future implementation)
**Decision**: Vitest
**Rationale**: Explicitly specified in the advance-now constitution under Technical Constraints (Vitest is mentioned as the testing framework for achieving 80%+ test coverage).
**Alternatives considered**:
- Jest - Rejected despite popularity due to constitution mandate
- Mocha/Chai - Rejected due to constitution mandate
- Jasmine - Rejected due to constitution mandate
- Ava - Rejected despite performance benefits due to constitution mandate

### Code Quality and Formatting
**Decision**: ESLint strict + Prettier + Husky pre-commit hooks
**Rationale**: Explicitly specified in Phase 0a Repository & Tooling Setup deliverables. Ensures consistent code quality and prevents formatting conflicts in collaborative development.
**Alternatives considered**:
- ESLint alone - Rejected due to need for automatic formatting which Prettier provides
- Prettier alone - Rejected due to need for linting rules which ESLint provides
- StandardJS - Rejected due to need for configurable rules that ESLint+Prettier provides
- Deno fmt - Rejected due to constitution specifying Node.js environment

## Dependencies and Integration Points

### Primary Dependencies (for foundation setup)
1. **TypeScript** - Language and compiler
2. **Node.js 20 LTS** - Runtime environment
3. **ESLint** - Code linting
4. **Prettier** - Code formatting
5. **Husky** - Git hook management
6. **Docker** - Containerization platform
7. **Docker Compose** - Multi-container orchestration

### Future Dependencies (to be implemented in later phases)
1. **Fastify** - HTTP framework with plugin system
2. **PostgreSQL** - Primary database (per constitution, but user requested no tables at this stage)
3. **EJS** - Server-side templating for hook system
4. **Tailwind CSS** - Utility-first CSS framework
5. **DaisyUI** - Component library for Tailwind
6. **Vitest** - Testing framework

### Integration Points (for future implementation)
1. **Database ORM** - Will need to integrate PostgreSQL with TypeScript (likely via Prisma or TypeORM)
2. **Hook System** - EJS templating must integrate with Fastify to enable `hooks.doAction`/`hooks.applyFilter`
3. **Authentication System** - JWT token generation/validation must integrate with Fastify request lifecycle
4. **Audit Logging** - Must integrate with all core functions to log security-relevant events
5. **Plugin System** - Must integrate with Fastify's plugin architecture for extensibility

## Best Practices and Patterns

### Project Structure
- Follow hexagonal/clean architecture principles to maintain separation of concerns
- Keep core business logic independent of frameworks (adapters for Fastify, PostgreSQL, etc.)
- Use dependency injection for testability and flexibility
- Group related functionality by domain rather than technical layer where beneficial

### Code Organization
- Place framework-specific code in thin adapter layers
- Keep business logic pure and framework-agnostic
- Use interfaces/contracts to define boundaries between layers
- Implement error handling at boundaries with consistent error types

### Development Workflow
- Commit early and often with descriptive messages
- Use feature branches for isolated work
- Run full test suite before merging to main branch
- Validate Docker builds in CI/CD pipeline (to be implemented in later phases)
- Document decisions in ADRs (Architecture Decision Records) for significant choices

### Security Considerations (for future implementation)
- Hash passwords using bcrypt or argon2 (never store plaintext)
- Implement proper session management with secure cookie flags
- Validate and sanitize all inputs to prevent injection attacks
- Implement rate limiting to prevent abuse
- Use HTTPS in production (HTTP acceptable for development per assumptions)
- Regularly update dependencies to address security vulnerabilities

### Performance Considerations (for future implementation)
- Use connection pooling for database connections
- Implement caching strategies for frequently accessed data
- Optimize database queries with proper indexing
- Use gzip compression for HTTP responses
- Implement pagination for large dataset endpoints
- Use CDN for static assets in production (to be implemented in later phases)

## Risks and Mitigations

### Risk: Constitution Drift
**Mitigation**: Implement automated checks in CI/CD (Phase 11+) to verify constitution compliance (naming conventions, prefixes, etc.)

### Risk: Environment Inconsistency
**Mitigation**: Use Docker Compose with version-pinned images and document exact versions in setup guide

### Risk: Performance Bottlenecks
**Mitigation**: Establish performance baselines early and monitor throughout development

### Risk: Security Vulnerabilities
**Mitigation**: Regular dependency updates, security scanning in CI/CD, penetration testing before major releases

### Risk: Plugin System Complexity
**Mitigation**: Start with simple plugin architecture and iteratively improve based on real-world usage feedback