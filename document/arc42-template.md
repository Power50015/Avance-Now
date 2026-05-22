# arc42 Template — Software Architecture Documentation

> arc42, the Template for documentation of software and system architecture.
> By Dr. Gernot Starke, Dr. Peter Hruschka and contributors.
> Template Revision: 7.0 EN — © arc42.de

---

## Table of Contents

1. [Introduction and Goals](#1-introduction-and-goals)
2. [Architecture Constraints](#2-architecture-constraints)
3. [System Scope and Context](#3-system-scope-and-context)
4. [Solution Strategy](#4-solution-strategy)
5. [Building Block View](#5-building-block-view)
6. [Runtime View](#6-runtime-view)
7. [Deployment View](#7-deployment-view)
8. [Cross-Cutting Concepts](#8-cross-cutting-concepts)
9. [Design Decisions](#9-design-decisions)
10. [Quality Requirements](#10-quality-requirements)
11. [Risks and Technical Debt](#11-risks-and-technical-debt)
12. [Glossary](#12-glossary)

---

## 1. Introduction and Goals

Describes the relevant requirements and the driving forces that software architects and the development team must consider. These include underlying business goals, essential features and functional requirements, quality goals for the architecture, and relevant stakeholders and their expectations.

### 1.1 Requirements Overview

Short description of the functional requirements and driving forces. Link to requirements documents if they exist.

*< Insert short description of functional requirements here >*

### 1.2 Quality Goals

The top three to five quality goals for the architecture whose fulfillment is of highest importance to the major stakeholders.

| Priority | Quality Goal | Motivation |
|---|---|---|
| 1 | *< Quality Goal 1 >* | *< Motivation >* |
| 2 | *< Quality Goal 2 >* | *< Motivation >* |
| 3 | *< Quality Goal 3 >* | *< Motivation >* |

### 1.3 Stakeholders

Explicit overview of all persons, roles, or organizations that should know the architecture, have to be convinced of it, or work with it.

| Role / Name | Contact | Expectations |
|---|---|---|
| *< Role 1 >* | *< Contact >* | *< Expectation >* |
| *< Role 2 >* | *< Contact >* | *< Expectation >* |

---

## 2. Architecture Constraints

Any requirement that constrains software architects in their freedom of design and implementation decisions. These constraints sometimes go beyond individual systems and are valid for whole organizations.

### 2.1 Technical Constraints

| Constraint | Background / Motivation |
|---|---|
| *< Technical Constraint 1 >* | *< Explanation >* |
| *< Technical Constraint 2 >* | *< Explanation >* |

### 2.2 Organizational Constraints

| Constraint | Background / Motivation |
|---|---|
| *< Organizational Constraint 1 >* | *< Explanation >* |

### 2.3 Conventions

| Convention | Background / Motivation |
|---|---|
| *< Convention 1 >* | *< Explanation >* |

---

## 3. System Scope and Context

Delimits the system from all its communication partners (neighboring systems and users). Specifies the external interfaces.

### 3.1 Business Context

Specification of all communication partners with explanations of domain-specific inputs and outputs.

*< Insert context diagram or table here >*

| Communication Partner | Input | Output |
|---|---|---|
| *< Partner 1 >* | *< Input >* | *< Output >* |
| *< Partner 2 >* | *< Input >* | *< Output >* |

*< Optional: Explanation of external domain interfaces >*

### 3.2 Technical Context

Technical interfaces (channels and transmission media) linking the system to its environment.

*< Insert deployment diagram or table here >*

| Channel | Input / Output | Technology |
|---|---|---|
| *< Channel 1 >* | *< I/O >* | *< Protocol / Tech >* |

*< Optional: Mapping of Input/Output to Channels >*

---

## 4. Solution Strategy

A short summary of the fundamental decisions and solution strategies that shape the system's architecture.

### 4.1 Technology Decisions

*< Describe technology choices and their motivation >*

### 4.2 Top-Level Decomposition

*< Describe the top-level decomposition — e.g. layered architecture, microservices, plugin-based, etc. >*

### 4.3 Decisions to Achieve Quality Goals

| Quality Goal | Approach |
|---|---|
| *< Quality Goal 1 >* | *< How it is achieved >* |
| *< Quality Goal 2 >* | *< How it is achieved >* |

### 4.4 Relevant Organizational Decisions

*< e.g. development process, outsourcing, third-party components >*

---

## 5. Building Block View

The static decomposition of the system into building blocks and their dependencies.

### 5.1 Whitebox Overall System

*< Insert overview diagram here >*

**Motivation:** *< Why is the system decomposed this way? >*

**Contained Building Blocks:**

| Name | Responsibility |
|---|---|
| *< Building Block 1 >* | *< Responsibility >* |
| *< Building Block 2 >* | *< Responsibility >* |
| *< Building Block 3 >* | *< Responsibility >* |

**Important Interfaces:**

*< Description of important interfaces between building blocks >*

---

### 5.2 Level 2 — Internal Structure of Building Blocks

#### 5.2.1 *< Building Block 1 >*

*< Purpose and responsibility >*

*< Interfaces >*

*< Quality / Performance characteristics >*

#### 5.2.2 *< Building Block 2 >*

*< Purpose and responsibility >*

*< Interfaces >*

---

### 5.3 Level 3 — Deeper Decomposition (if needed)

*< Describe inner structure of selected Level 2 building blocks when needed >*

---

## 6. Runtime View

Describes concrete behavior and interactions of the building blocks in the form of scenarios.

### 6.1 *< Runtime Scenario 1 >*

*< Description of the scenario — e.g. sequence diagram, numbered steps, or flowchart >*

*< Notable aspects of the interaction >*

### 6.2 *< Runtime Scenario 2 >*

*< Description >*

### 6.3 *< Runtime Scenario n >*

*< Description >*

---

## 7. Deployment View

Describes the technical infrastructure and the mapping of software building blocks to infrastructure elements.

### 7.1 Infrastructure Level 1

*< Insert overview deployment diagram here >*

**Motivation:** *< Why is the system deployed this way? >*

**Quality / Performance Features:**

*< Description >*

**Mapping of Building Blocks to Infrastructure:**

| Building Block | Infrastructure Element |
|---|---|
| *< Block 1 >* | *< Server / Container / Service >* |
| *< Block 2 >* | *< Server / Container / Service >* |

### 7.2 Infrastructure Level 2

#### *< Infrastructure Element 1 >*

*< Diagram and explanation >*

#### *< Infrastructure Element 2 >*

*< Diagram and explanation >*

---

## 8. Cross-Cutting Concepts

Overall, principal regulations and solution ideas relevant in multiple parts of the system.

### 8.1 Domain Concepts

*< Description of domain model, domain language, core domain objects >*

### 8.2 User Experience (UX)

*< UI patterns, design system, accessibility rules >*

### 8.3 Security

*< Authentication, authorization, encryption, input validation, audit logging >*

### 8.4 Architecture and Design Patterns

*< Patterns used consistently across the system — e.g. Repository pattern, Event-driven, Plugin system >*

### 8.5 Under-the-Hood

*< Persistence, transactions, session management, caching, concurrency >*

### 8.6 Development Concepts

*< Build process, testing strategy, code organization, dependency management >*

### 8.7 Operational Concepts

*< Logging, monitoring, deployment, configuration management >*

---

## 9. Design Decisions

Important, expensive, large-scale, or risky architecture decisions including rationale. Organized as ADRs (Architecture Decision Records).

### ADR-001 — *< Decision Title >*

**Status:** *< Proposed / Accepted / Deprecated / Superseded >*

**Context:**
*< What is the issue that motivated this decision? >*

**Decision:**
*< What was decided? >*

**Rationale:**
*< Why was this decision made? What alternatives were considered? >*

**Consequences:**
*< What are the positive and negative consequences of this decision? >*

---

### ADR-002 — *< Decision Title >*

**Status:** *< Status >*

**Context:** *< Context >*

**Decision:** *< Decision >*

**Rationale:** *< Rationale >*

**Consequences:** *< Consequences >*

---

## 10. Quality Requirements

All quality requirements as a quality tree with scenarios.

### 10.1 Quality Tree

```
Quality
├── Reliability
│   ├── Availability
│   └── Fault Tolerance
├── Security
│   ├── Authentication
│   ├── Authorization
│   └── Data Integrity
├── Maintainability
│   ├── Modularity
│   └── Testability
├── Performance
│   ├── Response Time
│   └── Throughput
└── Extensibility
    ├── Plugin System
    └── API Stability
```

*< Customize the tree for your system >*

### 10.2 Quality Scenarios

| ID | Quality Attribute | Scenario | Priority |
|---|---|---|---|
| QS-01 | *< Attribute >* | *< When X happens, the system responds with Y within Z >* | High |
| QS-02 | *< Attribute >* | *< Scenario description >* | Medium |
| QS-03 | *< Attribute >* | *< Scenario description >* | Low |

---

## 11. Risks and Technical Debt

A list of identified technical risks and technical debts, ordered by priority.

### 11.1 Technical Risks

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | *< Risk description >* | High / Med / Low | High / Med / Low | *< Mitigation strategy >* |
| R-02 | *< Risk description >* | High / Med / Low | High / Med / Low | *< Mitigation strategy >* |

### 11.2 Technical Debt

| ID | Debt | Where | Effort to Fix | Priority |
|---|---|---|---|---|
| TD-01 | *< Description >* | *< Module / Component >* | High / Med / Low | High / Med / Low |
| TD-02 | *< Description >* | *< Module / Component >* | High / Med / Low | High / Med / Low |

---

## 12. Glossary

The most important domain and technical terms used by stakeholders when discussing the system.

| Term | Definition |
|---|---|
| *< Term 1 >* | *< Clear definition >* |
| *< Term 2 >* | *< Clear definition >* |
| *< Term 3 >* | *< Clear definition >* |

---

*Template based on arc42 — http://arc42.de*
*Created by Dr. Peter Hruschka & Dr. Gernot Starke*
*License: Creative Commons Attribution 4.0*
