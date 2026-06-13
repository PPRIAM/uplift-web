# User Bro Implementation Plan

**Goal:** Create the autonomous "User Bro" global testing agent with customizable personas, dynamic frustration tracking, blacklist safety guardrails, and hybrid dashboard reporting.

**Architecture:** A modular agent structure driven by a main coordinator state machine. It leverages Playwright (`chrome-devtools` protocol) for visual browsing and text inputs, an LLM for cognitive action decision-making, and an event-driven logger to audit console warnings/network latency.

**Tech Stack:** Node.js, TypeScript, Playwright (Chromium), Gemini 1.5 Pro (via Google Generative AI SDK), Sharp (for visual annotations), Vitest (for tests).

---

## 1. File Mapping

| File Path | Responsibility |
|---|---|
| `src/agents/user-bro/types.ts` | Shared type definitions for state, runs, steps, and persona parameters. |
| `src/agents/user-bro/guardrails.ts` | Scans visual text labels against the blocklist and handles CLI prompt/skip flow. |
| `src/agents/user-bro/frustration-tracker.ts` | Computes step-by-step frustration changes based on console/network logs and page state stability. |
| `src/agents/user-bro/browser-controller.ts` | Wraps Playwright context, page initialization, screenshot capture, DOM tree dumps, and actions. |
| `src/agents/user-bro/decision-maker.ts` | Orchestrates LLM prompt construction, cognitive walkthrough monologue output, and element selection. |
| `src/agents/user-bro/reporter.ts` | Performs image circle drawing via Sharp and formats the Hybrid Markdown storyboard. |
| `src/agents/user-bro/run.ts` | Main execution entry point tying the state machine together. |
| `tests/agents/user-bro/user-bro.test.ts` | E2E and unit test suites confirming state updates, guardrails, and reporting. |

---

## 2. Task Breakdown

### Task 1: Type Definitions Setup
**Files:** Create: `src/agents/user-bro/types.ts` | Test: `tests/agents/user-bro/user-bro.test.ts`
- [ ] Step 1: Write a unit test verifying that the launch configurations and state schemas conform to the PRD constraints.
- [ ] Step 2: Run test using `npx vitest run tests/agents/user-bro/user-bro.test.ts` and verify it fails due to missing type imports.
- [ ] Step 3: Implement `types.ts` defining `UserBroPersona`, `UserBroState`, `UserBroStep`, and `UserBroRun`.
- [ ] Step 4: Run the test to confirm it compiles and passes.
- [ ] Step 5: Commit changes.

### Task 2: Security Guardrails
**Files:** Create: `src/agents/user-bro/guardrails.ts` | Test: `tests/agents/user-bro/user-bro.test.ts`
- [ ] Step 1: Add a test asserting that strings containing "delete", "supprimer", and "payer" trigger a security violation, whereas "save" and "submit" do not.
- [ ] Step 2: Verify test fails.
- [ ] Step 3: Implement `guardrails.ts` with a regex-based `isDestructiveAction(label: string)` function and a prompt handler function.
- [ ] Step 4: Verify test passes.
- [ ] Step 5: Commit changes.

### Task 3: Frustration State Tracker
**Files:** Create: `src/agents/user-bro/frustration-tracker.ts` | Test: `tests/agents/user-bro/user-bro.test.ts`
- [ ] Step 1: Add a unit test verifying the math: when patience is `0.5`, an input validation error (`+20`) results in `+40` frustration.
- [ ] Step 2: Verify test fails.
- [ ] Step 3: Implement `frustration-tracker.ts` containing the weights table, multiplier calculation, and `calculateStepFrustration(logs: TechnicalLogs, didPageChange: boolean, patience: number)` function.
- [ ] Step 4: Verify test passes.
- [ ] Step 5: Commit changes.

### Task 4: Browser Controller & Playwright
**Files:** Create: `src/agents/user-bro/browser-controller.ts` | Test: `tests/agents/user-bro/user-bro.test.ts`
- [ ] Step 1: Add integration tests verifying Playwright launches a browser, navigates, and correctly attaches console/network message listeners.
- [ ] Step 2: Verify test fails.
- [ ] Step 3: Implement `browser-controller.ts` encapsulating browser launch, video recording configuration, page navigation, click/type coordinate conversions, and screenshot captures.
- [ ] Step 4: Verify test passes.
- [ ] Step 5: Commit changes.

### Task 5: Cognitive Decision Maker (LLM Integration)
**Files:** Create: `src/agents/user-bro/decision-maker.ts` | Test: `tests/agents/user-bro/user-bro.test.ts`
- [ ] Step 1: Add a test that mocks the LLM API call, ensuring that when given a page screenshot and DOM tree, it returns a structured JSON containing a monologue and next coordinates.
- [ ] Step 2: Verify test fails.
- [ ] Step 3: Implement `decision-maker.ts` building the system prompt (injecting tech-savviness instructions) and parsing the generative model JSON output.
- [ ] Step 4: Verify test passes.
- [ ] Step 5: Commit changes.

### Task 6: Diagnostic Reporter
**Files:** Create: `src/agents/user-bro/reporter.ts` | Test: `tests/agents/user-bro/user-bro.test.ts`
- [ ] Step 1: Add a test verifying that markdown generator creates the summary, lists all steps, formats frustration progress bars correctly, and references the video file path.
- [ ] Step 2: Verify test fails.
- [ ] Step 3: Implement `reporter.ts` using Sharp to annotate clicked targets and a template function to compile the Markdown storyboard.
- [ ] Step 4: Verify test passes.
- [ ] Step 5: Commit changes.

### Task 7: Main Coordinator & CLI Execution
**Files:** Create: `src/agents/user-bro/run.ts` | Test: `tests/agents/user-bro/user-bro.test.ts`
- [ ] Step 1: Add an E2E test verifying that executing the run method walks through the browser lifecycle, performs 2 steps, and compiles the final report.
- [ ] Step 2: Verify test fails.
- [ ] Step 3: Implement `run.ts` implementing the state machine loop, managing the step count, updating the frustration tracker, executing actions, saving files, and catching final outcomes (SUCCESS vs ABANDONED).
- [ ] Step 4: Verify test passes.
- [ ] Step 5: Commit changes.
