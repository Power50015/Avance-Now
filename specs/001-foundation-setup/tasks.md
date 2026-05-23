---

description: "Task list for Foundation Setup (Phase 0)"
---

# Tasks: Foundation Setup

**Input**: Design documents from `/specs/001-foundation-setup/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Not requested in specification. No test file generation tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown follow the single-project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure per plan.md (src/models/, src/config/, src/components/, src/services/, src/api/, src/router/, src/views/, plugins/, tests/unit/, tests/integration/, tests/contract/)
- [ ] T002 Initialize npm project with package.json including scripts: build, dev, start, test, lint, format
- [ ] T003 [P] Create .gitignore for Node.js project (node_modules, dist, .env, coverage)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Configure TypeScript with strict mode in tsconfig.json (target ES2022, strict true, include src/)
- [ ] T005 [P] Configure ESLint strict in eslint.config.js with TypeScript and Prettier integration
- [ ] T006 [P] Configure Prettier in .prettierrc (consistent formatting rules)
- [ ] T007 Set up Husky with pre-commit hooks in .husky/pre-commit (run lint-staged on commit)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Repository & Developer Tooling (Priority: P1) 🎯 MVP

**Goal**: Standardized project structure and consistent development tooling so developers can collaborate effectively without configuration conflicts.

**Independent Test**: A new developer can clone the repository, run the setup commands, and have linting/formatting work consistently on any machine.

### Implementation for User Story 1

- [ ] T008 [US1] Create comprehensive README.md with project overview, setup instructions, API overview, architecture diagrams, and FAQ

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. A developer can clone, install, and have consistent tooling.

---

## Phase 4: User Story 2 - Containerized Development Environment (Priority: P2)

**Goal**: Reproducible development environment so code runs consistently regardless of host OS or local configuration.

**Independent Test**: A developer can start the full development stack with a single command and all services (application, database, web server) become available from known addresses.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Create Dockerfile for the application (Node.js 20 LTS, TypeScript build)
- [ ] T010 [P] [US2] Create docker-compose.yml with application (Fastify), PostgreSQL, and Nginx services
- [ ] T011 [US2] Create Nginx development configuration in .docker/nginx/default.conf (reverse proxy to Fastify)
- [ ] T012 [US2] Create .env.example with documented environment variables for all services

**Checkpoint**: At this point, User Story 2 should be fully functional. Developer can run `npm run dev` and have the full stack available.

---

## Phase 5: User Story 3 - Bootstrap Application Server (Priority: P3)

**Goal**: Minimal running application so developers can verify the entire development pipeline works end-to-end.

**Independent Test**: A developer can start the application server, confirm it is running and responding to health checks, and observe proper error handling for invalid requests.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Implement configuration validation in src/config/index.ts (load and validate AVN_* env vars, fail with clear messages showing expected format)
- [ ] T014 [P] [US3] Implement error handling middleware in src/middleware/error-handler.ts (catch all errors, return user-friendly JSON responses)
- [ ] T015 [P] [US3] Implement health check endpoint at GET /health in src/api/health.ts (return JSON status indicating server is operational)
- [ ] T016 [P] [US3] Implement API index handler at GET /api in src/api/index.ts (return basic welcome/info JSON)
- [ ] T017 [P] [US3] Set up EJS view engine with @fastify/view and create front page template in src/views/index.ejs (DaisyUI-styled landing page)
- [ ] T018 [US3] Create Fastify server entry point in src/server.ts that integrates config validation, error handler, all routes, and view engine
- [ ] T019 [US3] Add graceful shutdown handling in src/server.ts (SIGTERM/SIGINT cleanup, close connections)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T020 [P] Verify quickstart.md steps are valid by running through the full setup flow
- [ ] T021 Final documentation review across all created files for consistency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - no cross-story dependencies
- **User Story 2 (Phase 4)**: Depends on Foundational completion - independent of US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion - independent of US1 and US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1 and US2

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel
- All Phase 2 tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models/services within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: Phase 5 (US3)

```bash
# Launch all parallel tasks for US3 together:
Task: "Implement configuration validation in src/config/index.ts"
Task: "Implement error handling middleware in src/middleware/error-handler.ts"
Task: "Implement health check endpoint in src/api/health.ts"
Task: "Implement API index handler in src/api/index.ts"
Task: "Set up EJS view engine and front page in src/views/index.ejs"
```

Then once all three complete:
```bash
Task: "Create Fastify server entry point in src/server.ts"
Task: "Add graceful shutdown handling in src/server.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (README)
4. **STOP and VALIDATE**: Test User Story 1 independently (clone, lint, format)
5. Foundation tooling is ready

### Incremental Delivery

1. Complete Setup + Foundational → Tooling foundation ready
2. Add User Story 1 (README) → Project documented and standardized (MVP!)
3. Add User Story 2 (Docker) → Containerized environment ready
4. Add User Story 3 (Fastify) → Application server running
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (README)
   - Developer B: User Story 2 (Docker)
   - Developer C: User Story 3 (Fastify server)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No database tables at this stage (per user request)
- All configuration files at repository root (not in src/)
