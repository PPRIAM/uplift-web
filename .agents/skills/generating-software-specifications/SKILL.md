---
name: generating-software-specifications
description: Generates structured, high-fidelity software specification documents (PRD, TRD, App Flow, UI/UX Design Brief, Backend Schema, and Implementation Plans) optimized for AI coding agents and vibecoding workflows. Use when scoping a new application or feature, mapping UX flows, designing database schemas, or building roadmap specs.
---

# Generating Software Specifications

This skill enables the systematic generation of highly detailed, structured software specification documents designed to guide AI coding agents and subagents through robust, failure-resistant development cycles. It acts as an orchestrator, delegating specific documents to dedicated domain skills within the library.

---

## When to use this skill
Use this skill when you need to:
- Establish the product vision and features before touching code (PRD).
- Lock down tech stacks, architecture, and libraries (TRD).
- Map user journeys, navigation loops, and edge cases (App Flow).
- Enforce styling rules, color palettes, and component design rules (UI/UX Brief).
- Define entity relations, schemas, keys, and row-level security policies (Backend Schema).
- Author atomic, sequential checklists for AI subagents to execute (Implementation Plan).

---

## Workflow

> [!TIP] **The Vibecoding Rule of Order**
> Generate and refine these documents **one at a time, sequentially**. Never try to generate all documents in a single prompt. Let each document fully inform the next to maintain maximum precision and technical depth.

### Step 1: Draft the Product Requirements Document (PRD)
- **Mandatory Skill**: **`brainstorming`**
- Use the brainstorming workflow to clarify constraints and define objectives, then format into `01_prd.md`.

### Step 2: Formulate the Technical Requirements Document (TRD)
- **Mandatory Skill**: **`technical-research`** (`researching-technical-topics`)
- Use structured technical research to evaluate packages, frameworks, and APIs, then format into `02_trd.md`.

### Step 3: Define the App Flow
- **Mandatory Skill**: **`ui-ux`** (`designing-ui-ux`)
- Apply UX guidelines, user journey trees, and state routing, then format into `03_app_flow.md`.

### Step 4: Define the UI/UX Design Brief
- **Mandatory Skill**: **branding** (`brand-identity`, `brandkit`)
- Apply design system rules, HSL visual tokens, and component visual states, then format into `04_design_brief.md`.

### Step 5: Draft the Backend Schema
- **Mandatory Skill**: **backend** (`backend-development`)
- Define SQL/database schemas, primary/foreign keys, and Row-Level Security (RLS) policies, then format into `05_backend_schema.md`.

### Step 6: Compose the Implementation Plan
- **Mandatory Skill**: **`planning`**
- Apply strict task granularity, file mapping, and test-driven verification steps, then format into `06_implementation_plan.md`.

---

## Instructions

### 1. Product Requirements Document (PRD) [01_prd.md]
*Enforced by the `brainstorming` skill:*
- **Objectives & Scoping**: Align on the core purpose. Roadmaps must clearly isolate Must-Haves, Should-Haves, and Nice-to-Haves.
- **User Stories**: Functional requirements written in user-benefit syntax.

### 2. Technical Requirements Document (TRD) [02_trd.md]
*Enforced by the `technical-research` skill:*
- **Criteria Matrix**: If architectural choices are ambiguous, compile a weighed comparison matrix.
- **Architecture**: Fix exact framework versions, libraries, and compiler requirements.

### 3. App Flow Mapping [03_app_flow.md]
*Enforced by the `ui-ux` skill:*
- **Journey Mapping**: Document visual or text-based logic trees (Mermaid preferred).
- **Navigation Safety**: Document clear routes for user statuses (authentication, guest, loading, error).

### 4. UI/UX Design Brief [04_design_brief.md]
*Enforced by the branding skills (`brand-identity`, `brandkit`):*
- **Design Tokens**: Standardize colors (HSL/hex), spacing (4pt/8dp rules), typography scales, and glassmorphism styling.
- **Micro-interactions**: Mandate smooth transition speeds (150-300ms) and click compressions (`transform: scale`).

### 5. Backend Schema Formatting [05_backend_schema.md]
*Enforced by the `backend-development` skill:*
- **Data Models**: Relational schemas with strict types.
- **RLS & Security Policies**: Standardized Supabase/PostgreSQL Row-Level Security rules detailing select/insert/update access policies.

### 6. Implementation Plan Execution [06_implementation_plan.md]
*Enforced by the `planning` skill:*
- **Task Granularity**: Bite-sized tasks, TDD style (Write failing test -> verify -> implement -> verify -> commit).
- **Checks**: Strict, executable validation terminal commands per task.

---

## Validation

Verify that your specification documents conform to these quality checks:
- [ ] **Orchestration**: The `brainstorming`, `technical-research`, `ui-ux`, `brand-identity`/`brandkit`, `backend-development`, and `planning` skills were actively invoked to formulate each respective document.
- [ ] **No Placeholders**: Zero TBDs, TODOs, or empty placeholders.
- [ ] **TDD Checklists**: The implementation plan contains specific verification commands/actions for every single step.

---

## Resources
- **Reference Specification Suite**:
  - `01_prd.md` (via `brainstorming` skill)
  - `02_trd.md` (via `technical-research` skill)
  - `03_app_flow.md` (via `ui-ux` skill)
  - `04_design_brief.md` (via branding skills)
  - `05_backend_schema.md` (via `backend-development` skill)
  - `06_implementation_plan.md` (via `planning` skill)
