---
name: generating-diagnostic-reports
description: Compiles visual storyboards, console errors, network latency, frustration progress, and video links into a hybrid test report. Use when the user requests generating test summaries, dashboard reports, or exporting storyboard runs.
---

# Generating Diagnostic Reports Skill

## When to use this skill
- At the end of a testing session (whether SUCCESS or ABANDONED).
- When compile-time summaries of steps, screenshots, and logs are needed.
- When generating visual annotations on screenshots.

## Workflow
1. Collect all step logs, screenshots, and frustration history from the run state.
2. Annotate the screenshots (e.g. draw a red circle at the coordinates of the click).
3. Retrieve the Playwright session video link.
4. If the session was aborted, compile the "Autopsie de la Frustration" detailing the sequential frictions that triggered the abandonment.
5. Format the markdown report using the Hybrid Dashboard structure, listing:
   - Run Metadata (Persona configs, status, date)
   - Storyboard (Card list of steps with annotated screenshots and thoughts)
   - Technical Audits (Console exceptions and network latencies)
   - Autopsie de la Frustration (if applicable)

## Instructions
- Use clean table formatting for technical logs.
- Embed screenshots using absolute paths or relative links valid in the artifact directory.
