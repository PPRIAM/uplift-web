---
name: researching-technical-topics
description: Conduct structured technical research on libraries, APIs, architectures, and best practices. Use when the user mentions research, compare, evaluate, investigate, explore options, choose between, pros and cons, or needs a technical recommendation.
---

# Technical Research

## When to use
- Evaluating libraries, frameworks, or tools
- Comparing architectural approaches
- Investigating unfamiliar APIs or services
- Making build-vs-buy decisions
- Researching best practices for a domain
- Assessing migration paths or upgrade strategies
- Due diligence before adopting a dependency

## Research Framework

### Step 1 — Define the Question
State clearly: what decision needs to be made, what constraints exist (budget, timeline, team skill, scale).

### Step 2 — Gather Candidates
- Search web for current options (prioritize official docs, GitHub, and recent blog posts)
- Check npm trends, GitHub stars/activity, StackOverflow tags
- Filter by: actively maintained, TypeScript support, MIT/Apache license

### Step 3 — Evaluate on Criteria Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|--------|----------|----------|----------|
| Performance | High | | | |
| Bundle size | Med | | | |
| DX / API quality | High | | | |
| Community / ecosystem | Med | | | |
| Maintenance activity | High | | | |
| Learning curve | Med | | | |
| License | Low | | | |
| TypeScript support | High | | | |

Score each 1-5, multiply by weight, sum for total.

### Step 4 — Prototype
Build a minimal proof-of-concept with the top 1-2 candidates. Test against the actual use case, not generic benchmarks.

### Step 5 — Recommend
Write a concise recommendation with:
- **Pick:** [Winner] because [1-2 sentence rationale]
- **Runner-up:** [Alternative] if [condition changes]
- **Avoid:** [Rejected option] because [reason]

## Research Report Template
```markdown
# Research: [Topic]
Date: [Date] | Context: [Why this research is needed]

## Question
[What decision needs to be made?]

## Constraints
- [Budget, timeline, team, scale constraints]

## Options Evaluated
### Option A: [Name]
- Pros: ...
- Cons: ...
- Evidence: [link, benchmark, or code sample]

### Option B: [Name]
- Pros: ...
- Cons: ...

## Comparison Matrix
[Table from Step 3]

## Recommendation
**Pick [X]** because [rationale]. Revisit if [condition].

## Sources
- [Links to docs, articles, benchmarks consulted]
```

## Quick Evaluation Signals
- **Red flags:** No commits in 6+ months, open CVEs, no TypeScript types, < 100 GitHub stars, bus-factor = 1
- **Green flags:** Regular releases, responsive issues, good docs, used by known projects, corporate backing

## Checklist
- [ ] Question and constraints clearly defined
- [ ] At least 3 options evaluated
- [ ] Criteria weighted by project priorities
- [ ] Evidence-based (not opinion-based) scoring
- [ ] Prototype tested for top candidate
- [ ] Report saved with sources cited
