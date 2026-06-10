---
name: brainstorming
description: Explores user intent, requirements, and design before implementation. Use this before any creative work, building components, adding functionality, or modifying behavior to clarify constraints and propose approaches.
---

# Brainstorming

**HARD GATE:** Do NOT write code, scaffold, or implement anything until a design is presented and the user has approved it.

## Workflow
1. **Explore context** — check files, docs, recent commits
2. **Offer visuals** — if topic is visual, offer to generate mockups
3. **Clarify** — ask questions one at a time (purpose, constraints, success criteria)
4. **Propose 2-3 approaches** — with trade-offs and recommendation
5. **Present design** — section by section, get approval after each
6. **Write specifications** — Automatically use the `generating-software-specifications` skill to create the spec suite under `.agent/specs/`. When generating:
    - For the UI/UX Design Brief (document 04), automatically use the branding skill (`brand-identity`, `brandkit`).
    - For the Backend Schema (document 05), automatically use the backend skill (`backend-development`).
7. **Self-review** — check for TBD/TODO, contradictions, scope creep
8. **User reviews** — ask user to confirm spec before implementation
9. **Hand off** — invoke `planning` skill for implementation plan

## Rules
- Ask questions one at a time, not batched
- Scale each section to its complexity
- Design for isolation: small units, clear interfaces
- No placeholders in final spec (no "TBD", "TODO", "fill in later")
- Terminal state is handoff to `planning` — never jump to code
- Automatically use `generating-software-specifications` to orchestrate file generation, using the branding skill for design briefs, and the backend skill for database schemas.
