---
name: developing-backend-services
description: Build production-ready backend services with Node.js/Express, API design, database modeling, authentication, and deployment. Use when the user mentions backend, API, server, database, REST, GraphQL, middleware, auth, or microservices.
---

# Backend Development

## When to use
- Building REST or GraphQL APIs
- Designing database schemas (SQL/NoSQL)
- Implementing auth (JWT, OAuth, sessions)
- Setting up middleware pipelines
- Configuring Docker, CI/CD, deployment
- Background jobs, queues, cron tasks
- Real-time features (WebSockets, SSE)

## Tech Defaults

| Layer | Default |
|-------|---------|
| Runtime | Node.js 20+ |
| Framework | Express / Fastify / Next.js Route Handlers |
| ORM | Prisma |
| DB | PostgreSQL |
| Cache | Redis |
| Auth | JWT (access+refresh) or NextAuth |
| Validation | Zod |
| Testing | Vitest + Supertest |
| Container | Docker + docker-compose |

## API Design Rules
- Resources are **nouns** — `GET /users`, not `GET /getUsers`
- Use correct HTTP methods: GET=read, POST=create, PATCH=update, DELETE=remove
- Return consistent envelopes: `{ data }` for success, `{ error: { message, code } }` for errors
- Status codes: 200 OK, 201 Created, 400 Bad Input, 401 Unauth, 403 Forbidden, 404 Not Found, 422 Validation, 500 Server Error
- Paginate lists: cursor-based preferred, include `meta: { total, cursor }`
- Version via URL prefix: `/api/v1/`

## Route Handler Pattern
```typescript
// app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const schema = z.object({ name: z.string().min(1), value: z.number() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { message: 'Validation failed', details: parsed.error.flatten().fieldErrors } }, { status: 422 });

  const item = await prisma.item.create({ data: { ...parsed.data, userId: session.user.id } });
  return NextResponse.json({ data: item }, { status: 201 });
}
```

## Database Schema Patterns
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([email])
}

enum Role { USER ADMIN }
```

## Auth Pattern (JWT)
```typescript
// Sign: jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '15m' })
// Verify middleware: extract from Authorization header, verify, attach req.user
// Refresh: long-lived token (7d) stored httpOnly cookie, rotated on use
// Hash passwords: bcrypt.hash(password, 12)
```

## Middleware Pipeline
```
Request → Rate Limiter → Auth → Validation → Handler → Error Handler → Response
```

## Error Handling
```typescript
class AppError extends Error {
  constructor(public message: string, public statusCode: number, public code: string) { super(message); }
}

// Global handler
app.use((err, req, res, next) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  res.status(status).json({ error: { message: status === 500 ? 'Internal error' : err.message, code: err.code || 'UNKNOWN' } });
});
```

## Docker Setup
```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [db, redis]
  db:
    image: postgres:16-alpine
    environment: { POSTGRES_DB: app, POSTGRES_USER: app, POSTGRES_PASSWORD: secret }
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
volumes:
  pgdata:
```

## Checklist
- [ ] All inputs validated with Zod before processing
- [ ] Auth on every protected route
- [ ] Passwords hashed (bcrypt/argon2), never stored plain
- [ ] No secrets in code — use env vars
- [ ] Error handler catches all unhandled errors
- [ ] DB migrations committed and reproducible
- [ ] Rate limiting on public endpoints
- [ ] Logging structured (Pino/Winston), no `console.log` in prod
- [ ] Health check endpoint exists (`GET /health`)
