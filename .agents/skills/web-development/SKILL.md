---
name: developing-modern-web-apps
description: Build production-ready modern web applications using Next.js App Router, React, Tailwind CSS, and full-stack best practices including component architecture, state management, and API integration. Use when the user wants to build a web app, create React components, set up Next.js, implement state management, design a Tailwind-based UI, or scaffold a full-stack web project.
---

# Modern Web Development

## Tech Defaults
| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS v3 |
| Server state | React Query |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| Auth | NextAuth.js or Clerk |
| Database | Prisma + PostgreSQL |
| Testing | Vitest + Testing Library + Playwright |

## Scaffold
```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install zod react-hook-form @tanstack/react-query zustand
```

## Folder Structure
```
src/
  app/            → routes, layouts, API handlers
  components/ui/  → design system (Button, Input, Modal)
  components/features/ → domain components by feature
  hooks/          → custom React hooks
  lib/            → db, auth, utils
  types/          → shared TypeScript types
```

## Key Patterns

**Server Component** — async data fetching with Suspense:
```tsx
export default async function Page() {
  const session = await auth();
  if (!session) redirect('/login');
  const data = await prisma.post.findMany();
  return <Suspense fallback={<Spinner />}><List data={data} /></Suspense>;
}
```

**Client Form** — validated with Zod:
```tsx
'use client';
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });
```

**API Route** — auth + validation:
```ts
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const item = await prisma.item.create({ data: parsed.data });
  return NextResponse.json({ data: item }, { status: 201 });
}
```

**React Query** — server state with cache invalidation:
```ts
const { data } = useQuery({ queryKey: ['items'], queryFn: fetchItems, staleTime: 5 * 60_000 });
```

**Zustand** — client state:
```ts
export const useUI = create(persist((set) => ({ sidebar: true, toggle: () => set(s => ({ sidebar: !s.sidebar })) }), { name: 'ui' }));
```

## Checklist
- [ ] TypeScript strict — no `any`
- [ ] All forms Zod-validated
- [ ] API routes auth-protected
- [ ] Error boundaries on async components
- [ ] Loading + error states implemented
- [ ] Responsive: tested 375px and 1440px
- [ ] Accessibility: keyboard nav, ARIA, contrast
