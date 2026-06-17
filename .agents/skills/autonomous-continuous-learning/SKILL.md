---
name: autonomous-continuous-learning
description: Autonomously researches new technologies and continuously captures developer coding sessions to generate reusable skills and instincts. Use when the user mentions self-learning, continuous learning, capturing coding behavior, project-scoped instincts, or researching documentation.
---

# Autonomous Continuous Learning

This skill combines active autonomous research with continuous instinct-based session learning to build reusable capabilities, reduce token costs, and optimize agent behavior.

---

## When to use this skill
Use this skill when:
- Resolving unfamiliar libraries, frameworks, or APIs by researching documentation.
- Isolating and extracting developer patterns or preferences into reusable instincts.
- Freezing web research results into a local, self-contained skill (e.g. `SKILL.md`).
- Preventing cross-project context contamination by managing project-scoped versus global behaviors.

---

## Workflow

### 1. Pattern Capture & Instinct Isolation
- **Session Hooks**: Monitor tool executions, command inputs, and workspace edits.
- **Pattern Extraction**: Identify repeating logic, structural preferences, and specific configuration patterns.
- **Confidence Scoring**: Assign a confidence score (from 0.1 to 1.0) based on pattern repetition and success rate. Only promote patterns above 0.7 to "instincts".
- **Project Isolation**: Store local-only patterns (e.g., project-specific components, custom schema styles) separately from global developer settings.

### 2. Autonomous Web Research
- **Topic Discovery**: When encountering an unfamiliar command, error, or library, perform focused web searches.
- **Authoritative Crawling**: Target official documentation, repository READMEs, and reliable reference sites.
- **Code Extraction**: Extract minimal working code examples, key parameters, and architectural conventions.

### 3. Skill & Agent Synthesis
- **Instinct Freezing**: Compile isolated patterns and research results into structured documentation.
- **Global Skill Creation**: Generate a standard `SKILL.md` inside `.agents/skills/<new-skill-name>/` following the `creating-global-agent-skills` format.
- **Feedback Loop**: Continuously evaluate if a generated skill needs refinement based on new session outcomes.

---

## Instructions

### 1. Pattern Capture & Confidence Scoring
For each user session, evaluate patterns using the following scoring criteria:
- **Frequency**: How often does the pattern occur? (Occurs in 3+ steps: +0.3)
- **Tool Success**: Did the tool execution succeed? (Yes: +0.4, No: -0.2)
- **User Alignment**: Did the user approve the plan/action? (Yes: +0.3, Reject/Correction: -0.5)

### 2. Scoping Rules
- **Local Scope**: Place components, project styling systems, and database schemas under local project instincts.
- **Global Scope**: Place generic terminal configurations, Git shortcuts, and universal coding patterns under global instincts.

### 3. Synthesizing Local Skills
When generating a new local skill from research:
1. Define the skill's target folder at `.agents/skills/<skill-name>/`.
2. Write a standardized `SKILL.md` containing a name, description, trigger keywords, and precise workflow steps.
3. Add an example file under `.agents/skills/<skill-name>/examples/` if the tool usage requires complex syntax.

---

## Validation

Verify that your learning output meets these standards:
- [ ] **No Cross-Contamination**: Local project settings are not leaked to global scopes.
- [ ] **High Confidence Only**: Only patterns with confidence > 0.7 are documented.
- [ ] **Actionable Skill**: The resulting `SKILL.md` is structured, clean, and fully executable by another agent.
- [ ] **Proper YAML**: The frontmatter contains lowercase, hyphen-separated names using the gerund form.

---

## Resources
- [Creating Global Agent Skills (creating-global-agent-skills)](file:///D:/UPLIFT20/uplift-web/.agents/skills/global-agent-skills/SKILL.md)
- [Creating Antigravity Agents (creating-antigravity-agents)](file:///D:/UPLIFT20/uplift-web/.agents/skills/creating-antigravity-agents/SKILL.md)
