---
name: creating-global-agent-skills
description: Creates reusable global agent skills and standardized SKILL.md outputs for all Antigravity projects. Use when the user mentions skill generation, reusable agent capabilities, workflow automation, prompt engineering, image generation prompts, or creating shared project instructions.
---

# Global Agent Skills Creator

## When to use this skill
- Creating reusable skills shared across multiple projects
- Building standardized `.agent/skills/` structures
- Generating new `SKILL.md` files automatically
- Designing AI prompts for text, image, video, code, or automation tasks
- Creating modular Antigravity-compatible skills
- Producing consistent prompt engineering workflows
- Building creative generation prompts for design tasks

## Core Objective
This skill generates production-ready Antigravity skills that:
- Always output a complete `SKILL.md`
- Follow strict folder conventions
- Use reusable modular instructions
- Include validation workflows
- Support prompt engineering best practices
- Maintain consistent formatting across projects

---

# Required Folder Structure

Every generated skill MUST follow this structure:

```text
<skill-name>/
├── SKILL.md
├── scripts/
├── examples/
└── resources/
```

Minimum requirement:

* `SKILL.md` is mandatory
* Other folders are optional

---

# SKILL.md Generation Rules

## YAML Frontmatter Rules

Every generated `SKILL.md` MUST begin with:

```yaml
---
name: <gerund-form-name>
description: <third-person description with trigger keywords>
---
```

### Validation Rules

* Lowercase only
* Hyphen-separated
* Maximum 64 characters
* Must use gerund form
* No spaces
* No "claude" or "anthropic"

Example:

```yaml
---
name: generating-holiday-flyers
description: Creates patriotic Independence Day flyer prompts and structured design workflows. Use when the user mentions flyers, posters, banners, patriotic graphics, Haiti Independence Day, or promotional visual content.
---
```

---

# Prompt Engineering Standards

Apply these prompting techniques during skill generation:

* System prompting
* Role prompting
* Contextual prompting
* Few-shot prompting
* Step-back reasoning
* Structured output prompting

Reference best practices from Google's Prompt Engineering whitepaper:

* Be explicit about outputs
* Use structured formatting
* Provide examples
* Reduce ambiguity
* Prefer instructions over restrictions
* Use validation loops
* Maintain concise prompts
* Optimize for predictable outputs
* Use modular reusable sections

Reference source:



---

# Global Skill Workflow

## Plan → Validate → Execute

### 1. Plan

* Identify skill objective
* Determine modality:

  * Text
  * Image
  * Video
  * Audio
  * Code
  * Automation
* Determine reusable components
* Identify required outputs

### 2. Validate

Checklist:

* [ ] Folder structure correct
* [ ] YAML valid
* [ ] SKILL.md included
* [ ] Instructions concise
* [ ] Output predictable
* [ ] Examples included if needed
* [ ] Paths use `/`
* [ ] Trigger keywords present
* [ ] Output format enforced

### 3. Execute

Generate:

* Final `SKILL.md`
* Supporting examples
* Optional templates/resources
* Reusable workflow sections

---

# Skill Output Enforcement

When this skill creates another skill:

* ALWAYS generate a `SKILL.md`
* ALWAYS include YAML frontmatter
* ALWAYS define usage triggers
* ALWAYS define workflow
* ALWAYS define validation steps
* ALWAYS define expected output structure

If the generated skill does not include `SKILL.md`, regenerate automatically.

---

# Output Formatting Template

Use this exact structure:

````markdown
### [Folder Name]
Path: `.agent/skills/[skill-name]/`

### SKILL.md
```markdown
---
name: [gerund-name]
description: [third-person description]
---

# [Skill Title]

## When to use this skill
- Trigger
- Trigger

## Workflow
Checklist or process

## Instructions
Detailed execution logic

## Validation
Verification steps

## Resources
Optional references
```
````

---

# Prompt Construction Framework

For every generated prompt include:

## Goal
What the AI must accomplish

## Context
Background information and constraints

## Style
Visual, tonal, or structural direction

## Output Requirements
Expected formatting and structure

## Negative Prompt
Prevent:
- Low-quality results
- Clutter
- Distorted anatomy
- Bad typography
- Weak composition
- Incorrect colors
- Generic layouts

---

# Example Embedded Prompt

## Haiti Independence Day Flyer Prompt

```text
Create a modern and visually striking Independence Day flyer for Haiti using a clean white textured background. Place the Haitian flag prominently in the upper center, waving naturally on a flagpole. Use a patriotic color palette of royal blue, bright red, and white.

Include elegant lighting effects, subtle shadows, and modern typography. Add festive Haitian cultural accents and premium graphic design composition suitable for social media and print.

Style:
- Modern editorial poster
- Premium patriotic branding
- Sharp details
- Balanced spacing
- Luxurious but celebratory

Composition:
- Centered flag focus
- Dynamic visual hierarchy
- Clean whitespace
- Elegant layered textures
- Sophisticated patriotic atmosphere

Output:
- Ultra high resolution
- Professional flyer layout
- Print-ready composition
- Social media optimized

Negative Prompt:
blurry, low quality, distorted flag, bad anatomy, messy typography, cluttered layout, watermark, oversaturated colors, stretched elements, low resolution, amateur design
```

---

# Heuristics

## Use Bullets For

* Flexible creative guidance
* Design heuristics
* Tone suggestions

## Use Code Blocks For

* Templates
* Structured outputs
* JSON schemas
* Prompt patterns

## Use Commands For

* Fragile operations
* Scripts
* Validation tools

---

# Error Handling

If uncertain:

* Regenerate the YAML
* Re-validate folder structure
* Simplify prompt instructions
* Ask for missing modality only if essential

If scripts are included:

* Treat scripts as black boxes
* Use `--help` before execution

---

# Resource Recommendations

Optional supporting files:

* `examples/example-output.md`
* `resources/prompt-template.txt`
* `scripts/validate-skill.sh`

---

# Final Enforcement Rules

NEVER:

* Output incomplete skills
* Omit `SKILL.md`
* Use invalid YAML
* Generate vague prompts
* Exceed concise instruction boundaries unnecessarily

ALWAYS:

* Produce reusable outputs
* Generate modular instructions
* Include validation workflows
* Optimize prompts for production usage
* Ensure generated skills can recursively generate additional `SKILL.md` files
