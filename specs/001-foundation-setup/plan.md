# Implementation Plan: Foundation Setup

**Branch**: `001-foundation-setup` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-foundation-setup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Set up the foundational development infrastructure for the avance-now project including standardized repository structure, developer tooling, and basic application structure. This foundation enables all subsequent development phases by providing consistent environments, automated code quality checks, and a structured codebase ready for feature implementation.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS)

**Primary Dependencies**: TypeScript compiler, ESLint (linting), Prettier (formatting), Husky (git hooks), Docker (containerization for environment consistency)

**Storage**: No database required at this stage (to be implemented in later phases per user request)

**Testing**: Vitest (testing framework)

**Target Platform**: Linux server (development environment)

**Project Type**: web-service (foundation for future web application)

**Performance Goals**: Development environment setup under 10 minutes, linting/formatting execution under 30 seconds

**Constraints**:

- File and directory names must use kebab-case
- Must use TypeScript with strict mode and JSDoc
- Minimum 80% test coverage required (for future implementation)
- Environment variables will use `AVN_` prefix (when implemented in later phases)
- AVN_NODE_ENV variable will be properly set for environment (when implemented in later phases)
- Database will use SQL with ORM (specific type to be chosen later per user freedom)
- Database tables will use `avn_` prefix (when implemented in later phases per user request: "NO TABLES AT THIS STAGE")

**Scale/Scope**: Designed for a development team of 2-10 engineers working on the avance-now platform

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] File and directory names use kebab-case
- [ ] All hooks use `AVN:` prefix (to be implemented in later phases)
- [ ] All environment variables use `AVN_` prefix (to be implemented in later phases)
- [ ] AVN_NODE_ENV variable properly set for environment (to be implemented in later phases)
- [ ] All database tables use `avn_` prefix (to be implemented in later phases - PER USER REQUEST: NO TABLES AT THIS STAGE)

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-setup/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── config/
├── components/
├── services/
├── api/
├── router/
└── views/

plugins/
├── pluginA/
├── pluginB/
└── pluginC/

tests/
├── contract/
├── integration/
└── unit/

```

**Structure Decision**: Selected Option 1: Single project. The foundation setup establishes the basic structure for both backend and frontend components, preparing for future implementation following the avance-now constitution. At this stage, only the folder structure and configuration files are created per user request (no database tables).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Some constitution checks are not yet applicable at this foundation stage (hooks, environment variables, database tables) as they will be implemented in later phases. The foundation focuses on project structure and tooling setup as requested, with deliberate postponement of database-related requirements per user feedback. The user specifically requested no database tables at this stage, focusing only on libraries (dependencies), index (configuration files), and folders (project structure).
