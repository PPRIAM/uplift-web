---
name: applying-nextjs-best-practices
description: Applies production-grade Next.js App Router, React performance, and Supabase auth patterns sourced from vercel-react-best-practices and next-best-practices. Use when the user mentions Next.js, App Router, RSC, server components, data fetching, caching, route handlers, Supabase auth, React performance, bundle size, waterfalls, or TypeScript patterns in a Next.js project.
---

# Next.js Best Practices

> Consolidated from `vercel-labs/agent-skills@vercel-react-best-practices` and `vercel-labs/next-skills@next-best-practices`.  
> Covers **69 React/Next.js performance rules** + **App Router file conventions, RSC boundaries, data patterns, async APIs, and metadata**.

---

## When to Use This Skill

- Writing or reviewing Next.js App Router pages, layouts, and route handlers
- Setting up or auditing Supabase authentication with Next.js SSR
- Diagnosing data-fetching waterfalls, bundle bloat, or re-render problems
- Choosing between Server Components and Client Components
- Implementing caching strategies (`use cache`, `cacheTag`, `revalidateTag`)
- Writing TypeScript types for Next.js APIs
- Structuring large Next.js projects with clear folder conventions

---

## Workflow

### 1. Identify Context
- Is this a **new feature** or a **code review / refactor**?
- Identify the affected layer: routing, data-fetching, rendering, auth, or performance
- Check if the file is a Server Component or Client Component (`'use client'` directive present?)

### 2. Apply the Correct Rule Set
Use the sections below based on the task type.

### 3. Validate Output
- [ ] No `'use client'` on components that don't need interactivity
- [ ] No async operations inside Client Components that should be in Server Components
- [ ] No data-fetching waterfalls (sequential awaits that could be parallel)
- [ ] No unguarded `!` non-null assertions on optional user fields (e.g. `user.email!`)
- [ ] Error boundaries present for async server component trees
- [ ] `catch (err: unknown)` used — never `catch (err: any)`
- [ ] No raw error messages exposed to the client in API responses
- [ ] TypeScript strict mode compatible (no implicit `any`)

---

## Instructions

### A. File Conventions & Project Structure

```
app/
├── layout.tsx          # Root layout — minimal, no data fetching
├── page.tsx            # Server Component by default
├── error.tsx           # Error boundary for this segment
├── loading.tsx         # Suspense fallback
├── not-found.tsx       # 404 handler
├── api/
│   └── [resource]/
│       └── route.ts    # Route Handler — POST/GET/PATCH/DELETE
components/
├── ui/                 # Reusable, dumb UI components (no data fetching)
├── [feature]/          # Feature-scoped components
lib/
├── [domain].ts         # Pure business logic, no Next.js imports
utils/
└── supabase/
    ├── client.ts       # Browser Supabase client
    ├── server.ts       # Server Supabase client (SSR)
    └── middleware.ts   # Session refresh middleware
```

**Rules:**
- Keep `app/layout.tsx` lean — no DB calls, no heavy imports
- Co-locate feature components with their route segment when used in only one place
- Barrel exports (`index.ts`) are acceptable only in `components/ui/` — avoid them in `app/` to prevent bundle bloat

---

### B. Server vs Client Components

**Default to Server Components.** Only add `'use client'` when you need:
- `useState`, `useEffect`, `useRef`, event handlers
- Browser APIs (`window`, `localStorage`)
- Third-party libraries that require the DOM

```tsx
// ✅ Server Component — no directive needed
export default async function EventPage({ params }) {
  const event = await getEvent(params.id); // runs on server
  return <EventDetails event={event} />;
}

// ✅ Client Component — only when interactive
'use client';
export function ReservationForm({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

**Anti-pattern — avoid:**
```tsx
// ❌ Whole page as client component just for one button
'use client';
export default async function Page() { /* ... */ }
```

---

### C. Data Fetching — Eliminate Waterfalls

```tsx
// ❌ Waterfall — sequential fetches
const event = await getEvent(id);
const speakers = await getSpeakers(event.id);

// ✅ Parallel — use Promise.all
const [event, speakers] = await Promise.all([
  getEvent(id),
  getSpeakers(id),
]);
```

**Rules:**
- Fetch data as close to where it is used as possible (in the Server Component that renders it)
- Never prop-drill fetched data through many component layers — fetch it where it's needed
- Use `Suspense` boundaries to stream independent data

```tsx
// ✅ Streaming with Suspense
export default function Page() {
  return (
    <>
      <Suspense fallback={<EventSkeleton />}>
        <EventDetails id={id} />
      </Suspense>
      <Suspense fallback={<SpeakersSkeleton />}>
        <SpeakerList id={id} />
      </Suspense>
    </>
  );
}
```

---

### D. Route Handlers (API Routes)

```ts
// ✅ Correct route handler pattern
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  event_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  // 1. Parse body safely
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 2. Validate with Zod
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 3. Business logic in try/catch with unknown error type
  try {
    // ... your logic
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[route] POST /api/resource failed:', message);
    // ❌ Never expose: return NextResponse.json({ error: message })
    // ✅ Always use a safe user message:
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
```

**Rules:**
- Always validate request bodies with **Zod** — no ad-hoc `typeof x !== 'string'` chains
- Never expose raw error messages or DB error details in 4xx/5xx responses
- Use `catch (err: unknown)` + `err instanceof Error` narrowing — never `catch (err: any)`
- Return consistent error envelopes: `{ error: string }` for simple errors, `{ error, issues }` for validation

---

### E. Supabase Auth with Next.js SSR

```ts
// utils/supabase/server.ts — Server Component client
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Server Component — ignored */ }
        },
      },
    }
  );
}
```

```ts
// middleware.ts — Session refresh on every request
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(/* ... */, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
  await supabase.auth.getUser(); // refreshes session
  return response;
}
```

**Critical rules:**
- Always use `supabase.auth.getUser()` on the server — **never** `getSession()` for server-side auth checks (sessions can be spoofed)
- Guard `user.email` before use — OAuth users may not have an email:
  ```ts
  // ❌
  hasValidTicket(user.email!, eventId)
  
  // ✅
  if (!user.email) return NextResponse.json({ error: 'Email required' }, { status: 403 });
  hasValidTicket(user.email, eventId)
  ```
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only — never import in client components or expose to the browser
- Use `NEXT_PUBLIC_` prefix only for values safe to expose publicly

---

### F. TypeScript Strictness Rules

```ts
// ❌ Avoid
const [items, setItems] = useState<any[]>([]);
const handleEdit = (item: any) => { /* */ };
catch (err: any) { /* */ }

// ✅ Prefer
interface Reservation { id: string; email: string; quantity: number; }
const [items, setItems] = useState<Reservation[]>([]);
const handleEdit = (item: Reservation) => { /* */ };
catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
}
```

**Rules:**
- `"strict": true` in `tsconfig.json` — already set in this project ✅
- No `any` in catch clauses — use `unknown`
- No `any` in state generics — define an interface
- No `!` non-null assertions unless you've already narrowed the type

---

### G. Performance — Bundle Size

- **Avoid barrel exports** from large modules — they force the bundler to include the whole barrel
- Use `next/dynamic` for heavy client-only libraries (e.g. chart libraries, video players):
  ```ts
  const StreamPlayer = dynamic(() => import('@/components/StreamPlayer'), { ssr: false });
  ```
- Use `next/image` for all images — never raw `<img>` tags
- Use `next/font` for fonts — eliminates layout shift and avoids external font round-trips

---

### H. Caching (Next.js 15+)

```ts
// Route-level cache
export const revalidate = 3600; // revalidate every hour

// On-demand revalidation
import { revalidateTag } from 'next/cache';
revalidateTag('events');

// use cache directive (Next.js 15 PPR)
async function getEvents() {
  'use cache';
  cacheTag('events');
  cacheLife('hours');
  return supabase.from('events').select('*');
}
```

---

## Validation Checklist

Before completing any Next.js task, verify:

- [ ] Server Components used for data fetching (no `'use client'` for data-only components)
- [ ] Parallel data fetching with `Promise.all` where possible
- [ ] All API bodies validated with Zod schemas
- [ ] No raw error messages returned to clients in 500 responses
- [ ] `catch (err: unknown)` everywhere — no `any`
- [ ] `user.email` null-guarded before use
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` exposed to client
- [ ] `supabase.auth.getUser()` used (not `getSession()`) for server auth
- [ ] Heavy components lazy-loaded with `next/dynamic`
- [ ] All images use `next/image`

---

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase SSR Auth Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [skills.sh: vercel-react-best-practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices)
- [skills.sh: next-best-practices](https://skills.sh/vercel-labs/next-skills/next-best-practices)
- [skills.sh: nextjs-supabase-auth](https://skills.sh/sickn33/antigravity-awesome-skills/nextjs-supabase-auth)
