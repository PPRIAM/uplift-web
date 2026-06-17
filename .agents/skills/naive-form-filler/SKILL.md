---
name: naive-form-filling
description: Fills form fields with naive inputs and boundary cases. Use when the user requests typing data into textareas, inputs, or selections, testing validation errors, or checking form usability.
---

# Naive Form Filling Skill

## When to use this skill
- When form interactions are detected during user testing.
- When injecting mock inputs (emails, passwords, names, numbers) into input elements.
- When intentionally testing form validation rules with naive/incorrect data formats.

## Workflow
1. Identify all visible input fields on the screen.
2. Determine each field's expected type (e.g. Email, Password, Search, Date).
3. If testing validation: generate naive or incorrect inputs (e.g. "not-an-email" for an email field).
4. If performing normal path: generate realistic mock data.
5. Use Playwright's `type_text` or keyboard emulation to input characters.
6. Emulate delays between key presses based on the `click_speed` setting ('slow', 'normal', 'fast').

## Instructions
- Ensure you do not hardcode selectors; use surrounding label text or aria-labels to identify fields.
- Make typing speed match the persona: slow speed should introduce 100ms-150ms delay per key.
