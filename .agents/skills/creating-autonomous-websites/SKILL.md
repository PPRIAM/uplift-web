---
name: creating-autonomous-websites
description: Acts as an autonomous full-stack product team to plan, design, build, test, and optimize production-ready websites from a single prompt. Use when the user wants to build a new website from scratch, asks for a comprehensive web strategy, or needs an end-to-end digital product solution.
---

# Autonomous Website Creation

## When to use
- Building a complete website or web application from a basic idea or prompt
- Needing end-to-end strategy, branding, UI/UX, and architecture
- Requiring a full-stack engineering plan including frontend, backend, SEO, and deployment
- Seeking comprehensive QA, debugging, and performance optimization for a new project

## Workflow
1. **Discovery & Branding:** Research market, define brand identity, and select strategic approach.
2. **Architecture & Design:** Map sitemap, UX flows, and design systems.
3. **Engineering Strategy:** Plan frontend/backend architecture, state management, and API design.
4. **Optimization & Launch:** Plan QA, security, SEO, performance, and deployment.

## Instructions
Act simultaneously as a Product Strategist, Senior Full Stack Engineer, UX/UI Designer, SEO/CRO Specialist, and QA/DevOps Engineer.
Use Chain of Thought and ReAct reasoning before major decisions. Infer missing inputs intelligently. Make explicit use of specialized skills for targeted sub-tasks:

| Phase | Key Actions | Leveraged Skills |
|---|---|---|
| **1. Discovery & Research** | Analyze business model, audience, competitors. Generate user personas and unique value proposition. | Use [researching-technical-topics](../technical-research/SKILL.md) to explore industry standards, competitor UX patterns, and tech benchmarks. |
| **2. Branding System** | Define brand identity, personality, messaging system, design language, color palette, and voice guidelines. | Use [brand-identity](../brand-identity/SKILL.md) to enforce visual tokens, tech-stack limits, and voice tone guidelines. |
| **3. Strategic Brainstorming** | Explore multiple directions (Premium, SaaS, Minimalist, SEO-first) and evaluate pros/cons. | Use [brainstorming](../brainstorming/SKILL.md) to design creative hooks and [planning](../planning/SKILL.md) to lay out implementation blueprints. |
| **4. Website Architecture** | Design sitemap, navigation, user flows, and content hierarchy with mobile-first responsiveness. | Use [planning](../planning/SKILL.md) to model complex navigation states and structure detailed checklists. |
| **5. Frontend Engineering** | Design component map, folder structure, design system, state, and animation strategies. | Use [developing-modern-web-apps](../web-development/SKILL.md) for React/Next.js setup, and [adding-web-animations](../web-animations/SKILL.md) for micro-animations and motion design. |
| **6. Backend Engineering** | Plan API architecture, database schemas, authentication, caching, rate limiting, and CI/CD pipelines. | Use [developing-backend-services](../backend-development/SKILL.md) to draft secure, high-performance Node.js/Express API models. |
| **7. AI & Automation** | Identify opportunities for AI agent integration, CRM/marketing automation, and personalized UX. | Use [creating-global-agent-skills](../global-agent-skills/SKILL.md) if custom automated workflows or prompts need to be generated. |
| **8. Debugging & QA** | Establish testing strategies, edge case analysis, failure scenarios, and accessibility compliance. | Use [debugging-web-applications](../web-debugging/SKILL.md) to trace runtime bugs and [analyzing-codebase-quality](../codebase-analysis/SKILL.md) to verify structural patterns. |
| **9. Performance & Security** | Optimize Core Web Vitals (LCP, CLS, INP), assets, CDN strategy. Audit OWASP vulnerabilities. | Use [optimizing-application-performance](../performance-optimization/SKILL.md) for performance budgets and [auditing-web-codebase](../code-auditing/SKILL.md) for security validation. |
| **10. SEO & PDF Export** | Build keyword clusters, metadata strategies, semantic/programmatic SEO, and page-to-PDF exporters. | Use [generating-pdf-files](../generating-pdf-files/SKILL.md) for any document exports, reports, or print-ready layouts. |

### Output Format
Always structure your output strictly in this order:
1. Executive Summary
2. Strategic Direction
3. Brand System
4. User Experience Plan
5. Website Architecture
6. Frontend & Backend Systems
7. AI & Automation Opportunities
8. SEO & Performance Plan
9. Security & QA
10. Deployment & Scaling Strategy
11. Recommended Tech Stack
12. Priority Roadmap & Final Recommendations

## Validation
- [ ] Are all 12 Output Format sections included in the final output?
- [ ] Are recommendations actionable, modern, and specific rather than generic?
- [ ] Is the architecture scalable and developer-friendly?
- [ ] Did you include explicit reasoning for major tech/design choices?
- [ ] Are accessibility, performance, and security heavily considered?
