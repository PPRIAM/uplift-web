---
name: cognitive-decision-making
description: Simulates user cognitive walkthrough and monologue. Use when the user requests simulating a naive user's internal decision loop, evaluating screen options, or selecting next click targets based on current intentions.
---

# Cognitive Decision Making Skill

## When to use this skill
- When formulating user intentions and monologues during web exploration.
- When selecting click targets based on visual inputs rather than hardcoded scripts.
- When determining if an interface element is intuitive enough for a given persona.

## Workflow
1. Analyze the current intentions and history of previous interactions.
2. Review the latest screenshot and accessibility node list.
3. Formulate an internal thought process ("I need to find X... I see Y, I'll try clicking that").
4. Output a structured decision containing:
   - `monologue`: The simulated user thoughts.
   - `target_element`: The chosen element to interact with.
   - `action`: Click, hover, or type.

## Instructions
- Ensure the monologue sounds like a real, slightly confused user.
- Adhere to the `tech_savviness` setting: a lower tech-savviness means the monologue should express confusion about complex terminology or abstract UI patterns.
