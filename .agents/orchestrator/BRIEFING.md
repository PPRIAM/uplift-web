# BRIEFING — 2026-06-07T11:20:09Z

## Mission
Coordinate the implementation of the Supabase featured/live event schema update, admin control refactoring, dynamic nav gating, and homepage hero showcase.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: D:\UPLIFT20\uplift-web\.agents\orchestrator
- Original parent: main agent
- Original parent conversation ID: 258a3fc1-b437-484d-b632-98fc5e04a4d2

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: D:\UPLIFT20\uplift-web\PROJECT.md
1. **Decompose**: Decompose the user request into milestones (e.g. database schema, admin control, client dynamic navigation, homepage hero showcase) and plan the tracks.
2. **Dispatch & Execute** (pick ONE):
   - **Delegate (sub-orchestrator)**: When an item is too large, spawn a sub-orchestrator for it.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  1. Decompose project milestones [pending]
  2. Implement milestones via tracks [pending]
  3. Verify via reviews and audits [pending]
- **Current phase**: 1
- **Current focus**: Decompose project milestones

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- If a Forensic Auditor reports INTEGRITY VIOLATION, the milestone FAILS UNCONDITIONALLY. Do not advance.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh

## Current Parent
- Conversation ID: 258a3fc1-b437-484d-b632-98fc5e04a4d2
- Updated: not yet

## Key Decisions Made
- [TBD]

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| sub_orch_e2e | teamwork_preview_orchestrator | E2E Testing Track | completed | 50e2f31d-3beb-4678-ad44-1ccfb4ee049e |
| sub_orch_impl | teamwork_preview_orchestrator | Implementation Track | in-progress | 4284a90e-08f4-41fd-a0e8-c4bbce109da3 |

## Succession Status
- Succession required: no
- Spawn count: 2 / 16
- Pending subagents: 4284a90e-08f4-41fd-a0e8-c4bbce109da3
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: d55d2011-da6b-4ee4-9eba-d0a7e045786b/task-37
- Safety timer: d55d2011-da6b-4ee4-9eba-d0a7e045786b/task-149
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- D:\UPLIFT20\uplift-web\.agents\orchestrator\ORIGINAL_REQUEST.md — Original User Request
- D:\UPLIFT20\uplift-web\.agents\orchestrator\progress.md — Progress tracking file
- D:\UPLIFT20\uplift-web\.agents\orchestrator\plan.md — Plan tracking file
