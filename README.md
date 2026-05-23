# avance-now

A modular, extensible platform built with TypeScript, Fastify, and PostgreSQL. Core features include secure authentication, RBAC, and base commerce functionality, with all additional features delivered through a sandboxed plugin system.

## Overview

avance-now follows a **minimal core, maximum extensibility** philosophy. The core provides essential services: authentication, authorization, audit logging, and foundational commerce. Everything else is delivered via plugins.

### Architecture

```
┌─────────────────────────────────────────────────┐
│                  Plugins                         │
│  ┌─────────┐ ┌─────────┐ ┌───────────────────┐  │
│  │ Plugin A│ │ Plugin B│ │     ...            │  │
│  └────┬────┘ └────┬────┘ └───────────────────┘  │
├───────┴──────────┴───────────────────────────┤
│               Hook Engine                     │
│         (Actions & Filters)                   │
├────────────────────────────────────────────────┤
│                   Core                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌─────────────┐   │
│  │ Auth │ │ RBAC │ │ Audit│ │  Commerce    │   │
│  └──────┘ └──────┘ └──────┘ └─────────────┘   │
├────────────────────────────────────────────────┤
│               Fastify HTTP Layer                │
├────────────────────────────────────────────────┤
│           PostgreSQL + Redis (optional)         │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Component        | Technology                  |
| ---------------- | --------------------------- |
| Language         | TypeScript (Node.js 20 LTS) |
| HTTP Framework   | Fastify                     |
| Templating       | EJS                         |
| CSS Framework    | DaisyUI + Tailwind CSS      |
| Database         | PostgreSQL (via ORM)        |
| Cache/Queue      | Redis (optional)            |
| Containerization | Docker + Docker Compose     |
| Testing          | Vitest                      |

## Project Structure

```
.
├── src/                    # Application source
│   ├── api/               # Route handlers
│   ├── config/            # Configuration validation
│   ├── components/        # UI components
│   ├── middleware/        # Express-style middleware
│   ├── models/            # Data models/types
│   ├── router/            # Route definitions
│   ├── services/          # Business logic
│   └── views/             # EJS templates
├── plugins/               # Plugin packages
├── tests/                 # Test suites
│   ├── unit/
│   ├── integration/
│   └── contract/
├── .docker/               # Docker configuration
│   └── nginx/
├── specs/                 # Feature specifications
└── .specify/              # Project governance
```

## Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Node.js](https://nodejs.org/) (20 LTS)
- [Git](https://git-scm.com/)

### Quick Start

```bash
# Clone the repository
git clone <repository-url> avance-now
cd avance-now

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start the development stack
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

| Script           | Description                         |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Start development stack with Docker |
| `npm run build`  | Build for production                |
| `npm start`      | Start production server             |
| `npm test`       | Run test suite (Vitest)             |
| `npm run lint`   | Run ESLint                          |
| `npm run format` | Run Prettier                        |

## API Overview

### Health Check

```
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### API Index

```
GET /api
Response: { "name": "avance-now", "version": "0.1.0", ... }
```

## Constitution

The project follows the avance-now constitution, which mandates:

- **kebab-case** for all file and directory names
- **`avn_`** prefix for all database tables
- **`AVN:`** prefix for all hooks
- **`AVN_`** prefix for all environment variables
- Server-first rendering with EJS
- Strict TypeScript with JSDoc on all exports
- Minimum 80% test coverage per module

## FAQ

**Q: Why Fastify over Express?**
A: Fastify provides superior performance, a built-in plugin system aligned with our architecture, and better TypeScript support.

**Q: Is PostgreSQL required?**
A: Yes — the constitution mandates PostgreSQL via ORM. Redis is optional for caching and queues.

**Q: Can I use a different CSS framework?**
A: Plugins may use any JS framework on the frontend, but must align with DaisyUI CSS for consistency.

**Q: How do I create a plugin?**
A: Plugins are defined via a `plugin.json` manifest and placed in the `plugins/` directory. See the plugin documentation for details.

## License

Proprietary — All rights reserved.
