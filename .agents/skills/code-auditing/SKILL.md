---
name: auditing-web-codebase
description: Conduct comprehensive multi-perspective code audits covering security vulnerabilities, dependency health, architecture quality, and OWASP risks. Use when the user mentions code review, security audit, dependency audit, tech debt, OWASP, XSS, CSRF, vulnerability scanning, or wants a structured review of their codebase.
---

# Web Codebase Auditing

## 3-Perspective Model
| Lens | Focus |
|------|-------|
| Architect | Coupling, SOLID, separation of concerns |
| Security | OWASP Top 10, auth, XSS/CSRF/SQLi |
| Reviewer | Readability, naming, duplication, complexity |

## Phase 1 — Security
**OWASP quick check:**
- [ ] Broken access control — unauthorized routes/data?
- [ ] Injection — unsanitized inputs in SQL/NoSQL/commands?
- [ ] Auth failures — weak sessions, no rate limiting, no MFA?
- [ ] Vulnerable components — `npm audit` CVEs?
- [ ] Misconfiguration — debug mode, verbose errors in prod?
- [ ] Secrets — hardcoded in code or git history?

**Rules:** Use `textContent` not `innerHTML`; parameterized queries not string interpolation; bcrypt/argon2 for passwords; CSP headers set.

## Phase 2 — Dependencies
```bash
npm audit --audit-level=moderate
npm outdated
npx depcheck  # unused deps
```
Flag: unmaintained packages, deprecated APIs, license violations.

## Phase 3 — Architecture
- [ ] Single responsibility per module
- [ ] No circular imports (`npx madge --circular src/`)
- [ ] Code smells: functions > 50 lines, nesting > 3, magic numbers, god objects

## Phase 4 — Frontend
- [ ] Immutable state updates (no `.push()` on state)
- [ ] `useEffect` cleanup functions present
- [ ] Stable `key` props (not array index)
- [ ] Accessibility: alt text, contrast ≥ 4.5:1, keyboard nav, labels on forms

## Report Format
```
# Audit Report — [Project]
## Summary: X critical, Y high, Z medium
## Critical Findings (file:line, risk, fix)
## Dependency Health (CVE count, deprecated count)
## Recommendations (priority order)
```

## Checklist
- [ ] 0 critical/high CVEs in npm audit
- [ ] No hardcoded secrets
- [ ] XSS/CSRF mitigations confirmed
- [ ] Auth best practices followed
- [ ] Report delivered with prioritized findings
