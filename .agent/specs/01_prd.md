# Product Requirements Document (PRD) - User Bro Global Agent

## 1. Objectives & Scoping

### 1.1 Purpose
"User Bro" is an autonomous global agent that simulates a naive end-user interacting with and testing a target platform. Instead of performing standard QA checks, User Bro navigates using visual and accessibility cues, documents its internal cognitive process (monologue, confusion, frustrations), and evaluates UX quality based on a dynamic frustration state. It outputs a comprehensive technical and visual diagnostic dashboard.

### 1.2 Scope of Features
* **Must-Haves**:
  - Naive cognitive walkthrough simulation using LLM-based navigation decision-making.
  - Dynamic **Frustration Gauge (0-100)** modeled using specific weights for UX frictions.
  - Customizable persona parameters at launch: `patience`, `tech_savviness`, and `click_speed`.
  - Strict blacklist-based guardrails to prevent executing destructive or sensitive actions (e.g., Delete, Pay, Command).
  - Hybrid Diagnostic Dashboard (Markdown report with annotated step-by-step screenshots, monologues, console/network error highlights, and Playwright video playback link).
* **Should-Haves**:
  - HTML or interactive Markdown output for easy local browsing of test storyboards.
  - Intelligent form filler that inputs naive and boundary-test values based on field context.
* **Nice-to-Haves**:
  - Simulated chat assistance interaction (simulating a user asking a support widget for help when frustrated).
  - Automated Slack/Discord notification with a link to the dashboard when a run fails due to frustration peak.

---

## 2. User Stories

1. **Persona Injection**: As a developer/QA designer, I want to configure the agent's patience, tech-savviness, and click speed at launch so that I can simulate different demographics (e.g., an impatient professional vs. a confused novice).
2. **Exploration & Navigation**: As a product manager, I want the agent to try to complete a user goal (e.g., "Change my profile name") without hardcoded selectors so that I can verify if the UI is intuitive to a real user.
3. **Frustration Autopsy**: As a UX engineer, I want the agent to abort the test and provide a detailed report when its frustration reaches 100% so that I know exactly where the user journey broke down and why.
4. **Hybrid Diagnosis**: As a frontend developer, I want the test report to include step-by-step screenshots with highlighted clicks, console exceptions, and network logs so that I can immediately debug layout anomalies or API failures.

---

## 3. Core Functionality & Specifications

### 3.1 Customizable Personas
The agent accepts the following configurations at launch:
- `patience` (`0.0` to `1.0`): Frustration rate multiplier = `1.0 / patience` (capped at `5x`). Low patience (e.g., `0.2`) speeds up frustration accumulation.
- `tech_savviness` (`0.0` to `1.0`): Controls icon recognition and navigation accuracy. Low tech-savviness ignores standard abstract icons (gear, trash) unless they have accompanying text labels.
- `click_speed` (`'slow' | 'normal' | 'fast'`): Sets delays between steps and typing rates.

### 3.2 Frustration Gauge
The frustration score starts at `0` and increases/decreases based on page feedback:
- Form validation error: `+15` to `+25`
- No visual change after action: `+20`
- Slow loading spinner (>2s): `+10` per second
- Console / JavaScript error: `+30`
- Failed network call (5xx): `+40`
- Unexpected popups / modals blocking the view: `+15`
- Successful page navigation or validation resolution: `-15`

If frustration reaches `100`, the test is marked as `ABANDONED` and triggers an autopsy report.

### 3.3 Security Guardrails
If the target element to click contains any phrase in the blacklist (e.g., `["supprimer", "delete", "payer", "commander", "buy", "purge"]`):
- The agent halts execution immediately.
- It logs a safety warning.
- It prompts the user for manual confirmation or skips the element to continue the walkthrough.
