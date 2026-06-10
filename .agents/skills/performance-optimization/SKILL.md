---
name: optimizing-application-performance
description: Orchestrate end-to-end application performance optimization — from profiling and Core Web Vitals analysis to database tuning, CDN setup, and continuous monitoring. Use when the user mentions slow pages, high latency, performance budgets, Core Web Vitals, Lighthouse scores, load testing, or wants to optimize frontend/backend performance.
---

# Application Performance Optimization

## Targets
| Metric | Goal |
|--------|------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| API P50/P95 | < 200ms / < 1s |
| DB Query P95 | < 100ms |

## Workflow: Profile → Optimize → Test → Monitor

### Phase 1 — Profile First
- `npx lighthouse URL --output=html` for frontend
- `web-vitals` library for real-user metrics
- `npx clinic doctor -- node server.js` for backend
- Bundle analyzer: `ANALYZE=true npm run build`

### Phase 2 — Frontend
- **Code split**: `React.lazy()` + dynamic `import()`
- **Tree shake**: named imports only, no `import *`
- **Images**: `<Image>` component, WebP/AVIF, `loading="lazy"`
- **Critical path**: `<link rel="preconnect">`, `<link rel="preload">`, defer non-critical JS
- **React**: `React.memo`, `useMemo`, `useCallback` where measured; `react-window` for long lists

### Phase 3 — Backend
- **Cache**: Redis with TTL for repeated queries; `Cache-Control` headers for HTTP
- **N+1 fix**: use `include` relations or DataLoader batching
- **Pagination**: cursor-based preferred
- **Compression**: Brotli/gzip via middleware (threshold 1KB)

### Phase 4 — Database
- `EXPLAIN ANALYZE` on slow queries
- Composite indexes on common filter combos
- Select only needed columns, not `SELECT *`
- Connection pooling configured

### Phase 5 — CDN & Edge
- Static assets: `Cache-Control: public, max-age=31536000, immutable`
- Enable Brotli compression at edge
- Responsive images with `srcset`/`sizes`

### Phase 6 — Load Test & Regress
- k6: ramp to 2x peak, assert `p(95)<1000ms`, error rate `<1%`
- Lighthouse CI in GitHub Actions for regression
- Performance budgets enforced in CI

## Checklist
- [ ] Lighthouse > 90 all pages
- [ ] No unexpected large chunks in bundle
- [ ] API P50 < 200ms under load
- [ ] DB queries indexed (EXPLAIN ANALYZE clean)
- [ ] Monitoring + alerts configured
