# Codebase Quality & Architecture Analysis — UPLIFT 2.0

This document presents a comprehensive analysis of the **UPLIFT 2.0 (uplift-web)** digital media and ticketing platform codebase. 

---

## 1. Technology Stack & Component Structure

### Core Framework & Runtime
* **Framework**: [Next.js](file:///D:/UPLIFT20/uplift-web/package.json#L23) `v16.2.2` (React `19.2.4` / React DOM `19.2.4`) utilizing the **App Router** pattern.
* **Database & Auth Integration**: [Supabase SSR](file:///D:/UPLIFT20/uplift-web/package.json#L14) (`@supabase/ssr` `0.10.0`, `@supabase/supabase-js` `2.101.1`) handling edge cookies, user session persistence, and server/public clients.
* **Database & ORM**: PostgreSQL database managed via SQL migrations and [Prisma](file:///D:/UPLIFT20/uplift-web/prisma/schema.prisma) (`v6.19.3`) schema. Note that Prisma client is defined as a dev dependency, indicating PostgreSQL queries are mostly routed directly or through Supabase's generated clients.
* **State Management**: [Zustand](file:///D:/UPLIFT20/uplift-web/package.json#L30) `v5.0.12`.
* **Forms & Validation**: [React Hook Form](file:///D:/UPLIFT20/uplift-web/package.json#L27) (`7.72.0`) combined with [Zod](file:///D:/UPLIFT20/uplift-web/package.json#L29) (`4.3.6`) and `@hookform/resolvers`.
* **Animations**: [GSAP (GreenSock)](file:///D:/UPLIFT20/uplift-web/package.json#L20) (`3.15.0`) & `@gsap/react` for rich transitions and scroll-triggered animations.

### Styling & CSS Approach
* **Primary CSS**: [PostCSS](file:///D:/UPLIFT20/uplift-web/postcss.config.mjs) + [TailwindCSS v4](file:///D:/UPLIFT20/uplift-web/package.json#L42).
* **Global Styles**: Defined inside [app/globals.css](file:///D:/UPLIFT20/uplift-web/app/globals.css) which acts as the source of truth for both Utility Class mappings and custom CSS class modifiers (e.g. `.btn-primary`, `.card`, `.glass`).

### Component Structure
The project divides codebase responsibility into three main zones:
1. **Server-Side Pages / Route Handlers**: Found in the `app/` folder (e.g., [app/page.tsx](file:///D:/UPLIFT20/uplift-web/app/page.tsx)) executing remote DB fetches on the server.
2. **Client Components**: Reusable client components housing UI logic and GSAP triggers located in the root `components/` directory (e.g. [HomePageClient.tsx](file:///D:/UPLIFT20/uplift-web/components/HomePageClient.tsx)).
3. **Database & Utility Layer**: Housed in `lib/` (constants, helpers) and `utils/supabase/` (authenticated clients).

---

## 2. Design System & Aesthetics Audit

The visual identity is defined by the **"Élan Violet"** design system (documented in [DESIGN.md](file:///D:/UPLIFT20/uplift-web/DESIGN.md)), featuring a modern bento grid visual rhythm:

### Color Palette
* **Brand Accent (Primary)**: Cobalt / Violet (`#2563eb` -> `#0e1ad4` in updated CSS overrides / `--brand-primary`).
* **Secondary / Active**: Deep Royal Blue (`#1d4ed8` / `--brand-secondary`).
* **Highlights / Grafts**: Glowing Accent Cyan & Violet gradients (`--gradient-brand`, `--gradient-blue-glow`).
* **Backgrounds**: Soft Off-White (`#f8fafc` / `--bg-base`), pure white container surfaces (`#ffffff`), and rich dark slate overlays (`#05060fcc` / `--bg-dark-hero`) for theater environments.
* **Typography Contrast**: Strictly slate-grays (`#334155`, `#64748B`) are mapped to text-secondary and text-muted to remain WCAG AA compliant.

### Spacing & Grid Systems
* **Grid Layouts**: Layouts leverage flexible CSS Grid systems with custom standard `gap-4` to `gap-8` (`16px` to `32px` gaps) mimicking Bento-style block offsets.
* **Component Padding**: Card padding follows structured rules (generally `p-6` or `p-8` for desktop containers, reverting to `p-4` on mobile).
* **Sections**: Page sections feature dynamic breathing room, separated by `py-20` on desktop.

### Typography
* **Primary / Headers**: `Outfit`, `Satoshi` or `The Bold Font` loaded as local and Google fonts.
* **Body / UI Elements**: `Outfit` or `Geist` combined with a default `1.6` line-height for readability.

### Layout Modifiers & Transitions
* **Container Corners**: Cards are styled with `border-radius: 16px` (`rounded-2xl`). Parent section sheets wrap inside `24px` to `32px` rounded boundaries.
* **Interaction Physics**: Upgraded buttons use shine sweeps and scale transforms (`scale(1.015)`) with ease-out cubic-bezier curves (`cubic-bezier(0.34, 1.56, 0.64, 1)`).

---

## 3. Code Quality & Technical Debt Assessment

A deep inspection of the repository (including ESLint run validation) reveals the following issues:

### ⚠️ ESLint Linting & Compile Errors (2,059 Problems Total)
A full system linting run identified **129 compile errors** and **1,930 warnings** across the project:
* **Unescaped Quotes (`react/no-unescaped-entities`)**: Multiple pages (e.g. `app/about/page.tsx`, `app/speakers/page.tsx`, `app/terms/page.tsx`) have raw single quotes (`'`) inside markup instead of using HTML entities like `&apos;` or `&#39;`.
* **State Updates in Effects (`react-hooks/set-state-in-effect`)**: [StreamPlayer.tsx](file:///D:/UPLIFT20/uplift-web/components/StreamPlayer.tsx#L77) triggers a synchronous state set (`setError`) directly within a `useEffect` loop when HLS is unsupported, causing cascading renders.
* **Unused Variables**: `HomePageClient.tsx` has unused components parameters (e.g. `totalSpeakers` and `heroBgStyle`).
* **Supabase Explicit `any` Types**: `lib/streamAccess.ts` and `lib/ticketUtils.ts` contain standard raw `any` types violating strict TypeScript configurations.

### ⚠️ React Hook Dependency Warnings (9 Total)
React's compiler and ESLint warn that several asynchronous data loader hooks are missing dependency declarations inside `useEffect` arrays:
* **Admin Controls**: [LiveControlClient.tsx](file:///D:/UPLIFT20/uplift-web/app/admin/live-control/LiveControlClient.tsx) (missing `updateLiveStatus`), [SpeakersAdminClient.tsx](file:///D:/UPLIFT20/uplift-web/app/admin/speakers/SpeakersAdminClient.tsx) (missing `fetchApplications`), and [TicketsAdminClient.tsx](file:///D:/UPLIFT20/uplift-web/app/admin/tickets/TicketsAdminClient.tsx) (missing `fetchTickets`).
* **Core Feeds**: [events/page.tsx](file:///D:/UPLIFT20/uplift-web/app/events/page.tsx) (missing `supabase`), [live/page.tsx](file:///D:/UPLIFT20/uplift-web/app/live/page.tsx) (missing `checkAccess` and `loadStreamData`), and [MyReservationsClient.tsx](file:///D:/UPLIFT20/uplift-web/app/my-reservations/MyReservationsClient.tsx) (missing `fetchReservations`).
* **Home Module**: [components/HomePageClient.tsx](file:///D:/UPLIFT20/uplift-web/components/HomePageClient.tsx#L71) (missing `fetchLiveStatus`).

### 🛠️ Code Duplication & Dead Code
* **Unused Dependencies**: Running `npx depcheck` identified multiple installed packages that are never imported in the current app build:
  * `@hookform/resolvers`, `@vercel/analytics`, `@vercel/speed-insights`, `date-fns`, and `pg`.
  * DevDependencies: `@prisma/client`, `prisma`, `puppeteer`, `@types/node`, `@types/react`, and `@types/react-dom`.
* **Prisma vs. Supabase Schemas**: The project maintains both `prisma/schema.prisma` and raw Supabase SQL migrations (`supabase_schema.sql`). Direct client calls use Supabase Client SDK, making Prisma client a redundant data schema mapping layer in its current state.

### 🧪 Observability & Fallbacks
* **Static Fallbacks**: [HomePageClient.tsx](file:///D:/UPLIFT20/uplift-web/components/HomePageClient.tsx#L92) heavily embeds static defaults (`fallbackEventId`, `activeSessions`, `activeSpeakers`) to prevent blank UI blocks if database hooks return null. While resilient, these should be moved to central JSON fixtures.


---

## 4. Security & Dependency Audit

A vulnerability scan via `npm audit` flagged **9 vulnerabilities (7 moderate, 2 high)** in the project's dependencies:

### Critical Security Findings
| Package | Severity | Issue | Link / Impact |
|---------|----------|-------|---------------|
| `axios` | **High** | Prototype Pollution & SSRF Bypasses | Multiple vulnerabilities (CVE-2025-62718 / `NO_PROXY` bypass) allowing Server-Side Request Forgery. |
| `next` | **High** | Server Component DoS / XSS | Denial of service triggers in RSC, Middleware/Proxy bypasses via pre-fetch routes, and CSP nonce-based XSS. |
| `postcss` | Moderate | Unescaped `</style>` XSS | Vulnerable to Cross-Site Scripting via stylesheet markup tampering. |
| `uuid` | Moderate | Buffer Bounds Checks | Affects `resend` -> `svix` dependencies; potential crash vectors under malformed UUID v3/v5 queries. |

### Security Architecture & Gatekeeping
* **Edge Routing**: [middleware.ts](file:///D:/UPLIFT20/uplift-web/utils/supabase/middleware.ts#L43) implements edge cookie validation via `supabase.auth.getUser()` to gate `/live` and `/replay` routes, preventing unauthorized clients from accessing live feeds.
* **RLS Policies**: The SQL schemas implement Row-Level Security (RLS) on reservation tables, but many of the SQL patch files (e.g. `supabase_email_rls_fix.sql`, `supabase_fix_reservation_rls.sql`) suggest the RLS was previously broken or misconfigured.

---

## 5. File Map

The following map defines file ownership across the project:

```
uplift-web/
├── app/
│   ├── globals.css                # Global styles, variables, typography mapping
│   ├── layout.tsx                 # Root layout, HTML skeleton, Font declarations, SEO metadata
│   ├── page.tsx                   # Server-side event fetching and fallback resolving
│   ├── live/                      # Real-time streaming interface
│   ├── admin/                     # Dashboard & Control panels for speaker/ticket management
│   └── api/                       # REST endpoint route handlers (webhooks, confirmations, reservations)
├── components/
│   ├── HomePageClient.tsx         # Main landing presentation client wrapper (animations/GSAP triggers)
│   ├── Navbar.tsx                 # Navigation bar component
│   ├── Footer.tsx                 # Footer component
│   └── StreamPlayer.tsx           # HLS live video renderer
├── lib/
│   ├── constants/defaults.ts      # Core mock databases & fallbacks
│   └── dateUtils.ts               # Date formating utilities
├── prisma/
│   └── schema.prisma              # Local schema mapper (redundant)
└── utils/
    └── supabase/                  # Server, middleware & client initializers
```

---

## 6. Prioritized Recommendations

1. **Update Dependencies (Priority: Critical)**:
   Run `npm install next@latest axios@latest` and `npm audit fix --force` to upgrade `next` and `axios` to patched versions.
2. **Resolve React Hook Warnings (Priority: High)**:
   Add functional dependencies or wrap calls in `useCallback` to clear ESLint hook dependency alerts.
3. **Prune Dead Packages (Priority: Medium)**:
   Uninstall unused dependencies (`pg`, `prisma`, `@prisma/client`, `puppeteer`) to clean up node modules and reduce bundle sizes.
4. **Unify Configuration (Priority: Low)**:
   Move all fallback data variables out of page components and into static JSON configs.
