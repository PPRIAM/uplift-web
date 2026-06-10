# Synthesis: Milestone M1 Database Schema Update

## Consensus
- The target database has a `public.events` table.
- A new migration file `supabase_add_featured_live_events.sql` should be created at the root of the project to add the columns `is_featured` and `is_live`.
- Both columns must be `BOOLEAN NOT NULL DEFAULT false` to prevent tri-state null logic and maintain consistency with existing boolean fields (`featured`, `published`).
- Prisma schema `prisma/schema.prisma` should be updated to include the new columns to maintain type alignment, even though Prisma is not used for query execution.
- Supabase client is initialized client-side in `utils/supabase/client.ts` and server-side in `utils/supabase/server.ts` and `utils/supabase/public.ts`. It queries the database directly.

## Actions to Execute in M1 Implementation:
1. Create `supabase_add_featured_live_events.sql` at root.
2. Run database migration on the Supabase instance using credentials.
3. Update `prisma/schema.prisma` Event model.
4. Verify schema validity by running Prisma validate and check columns.
