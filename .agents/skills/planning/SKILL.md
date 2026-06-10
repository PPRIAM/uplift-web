---
name: planning
description: Creates comprehensive implementation plans assuming the engineer has zero context for the codebase. Use when you have a spec or requirements for a multi-step task, before touching code.
---

# Writing Plans

## Workflow
1. **Scope check** — ensure spec covers a single logical subsystem; split if too large
2. **File mapping** — list every file to create/modify with its responsibility
3. **Task breakdown** — bite-sized tasks (2-5 min each), TDD style
4. **Draft plan** — Automatically use the `generating-software-specifications` skill (Phase 6: Implementation Plan) to generate the plan and save it as `06_implementation_plan.md` under `.agent/specs/`.
5. **Self-review** — verify coverage, no placeholders, type consistency
6. **Handoff** — present plan, offer to execute

## Plan Header (Required)
```markdown
# [Feature] Implementation Plan
**Goal:** [One sentence]
**Architecture:** [2-3 sentences]
**Tech Stack:** [Key libraries]
```

## Task Granularity
Each step = one action:
- Write the failing test
- Run it to confirm failure
- Implement minimal code to pass
- Run tests to confirm pass
- Commit

## Task Structure
```markdown
### Task N: [Name]
**Files:** Create: `path` | Modify: `path:lines` | Test: `path`
- [ ] Step 1: Write failing test
- [ ] Step 2: Verify failure
- [ ] Step 3: Implement
- [ ] Step 4: Verify pass
- [ ] Step 5: Commit
```

## Rules
- NEVER use "TBD", "TODO", "similar to Task N", or "add appropriate handling"
- Every step must have actual code/commands, not vague instructions
- Every type/function referenced must be defined in some task
- Final action: offer execution choice to user
- Automatically use the `generating-software-specifications` skill to format, manage, and create the implementation plan file under the unified specification suite.
