# Handoff Report: Investigation of database schema and Supabase configuration for adding `is_featured` and `is_live` columns to the `events` table

This report details the findings and plans for adding the `is_featured` and `is_live` columns to the `events` table in the UPLIFT 2.0 application.

---

## 1. Observation

During the read-only investigation, the following files, schemas, and patterns were observed in the project:

### A. Existing Database Schema Definition
The database schema and migrations are currently defined as a series of `.sql` files located in the project's root folder (`D:\UPLIFT20\uplift-web`).
- **Initial Setup**: `supabase_schema.sql` creates the `public.events` table (lines 5-21):
  ```sql
  CREATE TABLE public.events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      date_time TIMESTAMP WITH TIME ZONE NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'America/Port-au-Prince',
      location_name TEXT NOT NULL,
      location_details TEXT,
      city TEXT,
      capacity INTEGER NOT NULL DEFAULT 500,
      registered_count INTEGER NOT NULL DEFAULT 0,
      featured BOOLEAN NOT NULL DEFAULT false,
      tags TEXT[] DEFAULT '{}',
      published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **Incremental Migrations**: Subsequent updates are managed manually through files like `supabase_update_schema.sql`, `supabase_update_schema_v2.sql`, `supabase_cover_image.sql`, and `supabase_stream_access.sql`. For instance, `supabase_cover_image.sql` adds the `cover_image` column:
  ```sql
  ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS cover_image TEXT;
  ```
- **ORM Schema**: A Prisma schema file exists at `D:\UPLIFT20\uplift-web\prisma\schema.prisma` (lines 10-24):
  ```prisma
  model Event {
    id               String   @id @default(uuid())
    name             String
    tagline          String?
    description      String
    date_time        DateTime
    timezone         String
    location_name    String
    location_details String?
    city             String?
    created_at       DateTime @default(now())

    sessions         Session[]
    reservations     Reservation[]
  }
  ```
  However, search results for the string `PrismaClient` outside `node_modules` and `.next` return no active imports or usages in the codebase.

### B. Supabase Client Initialization and Usage
The codebase interacts with the database exclusively using the `@supabase/supabase-js` or `@supabase/ssr` libraries. Initialization is handled differently based on the execution context:
1. **Client-Side (Browser)**:
   Initialized in `utils/supabase/client.ts` using `@supabase/ssr`'s `createBrowserClient` with public env keys (lines 6-10):
   ```typescript
   export const createClient = () =>
     createBrowserClient(
       supabaseUrl!,
       supabaseKey!,
     );
   ```
   *Usage*: Used inside client components such as `app/admin/events/page.tsx` for state mutation and fetching.
2. **Server-Side (Components and Actions)**:
   Initialized in `utils/supabase/server.ts` using `@supabase/ssr`'s `createServerClient` and dynamically passing `cookieStore` (lines 7-28):
   ```typescript
   export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
     return createServerClient(
       supabaseUrl!,
       supabaseKey!,
       {
         cookies: { ... }
       }
     );
   };
   ```
   *Usage*: Used in Server Actions and page routers (e.g., `app/speakers/page.tsx`).
3. **Server-Side API Routes**:
   Initialized directly inside route files (e.g., `app/api/reservations/route.ts`) using two helper functions:
   - `getSupabase()`: Authenticates using the client-side public anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - `getSupabaseAdmin()`: Authenticates using the secret Service Role key (`SUPABASE_SERVICE_ROLE_KEY`), bypassing Row Level Security (RLS) policies for background operations (e.g., ticket generation, email logging).

### C. Row Level Security (RLS) Policies on the `events` Table
We observed that `supabase_rls.sql` contains the security policies for the `events` table (lines 5, 12-13):
```sql
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activer la lecture publique pour les events" ON public.events;
CREATE POLICY "Activer la lecture publique pour les events" ON public.events FOR SELECT USING (true);
```
No other policies (INSERT, UPDATE, DELETE) are declared on `public.events` in any `.sql` file in the project.

---

## 2. Logic Chain

1. **Addition of Columns**:
   - The user requested adding `is_featured` and `is_live` columns to the `events` table (defaulting both to false).
   - Analysis of nullability: The columns represent strict boolean states (`true`/`false`). Introducing `null` (representing an unknown state) would require complex SQL and JS checks (e.g., handling `is_featured IS NOT TRUE` instead of simple `!is_featured`). Therefore, the columns must be **non-nullable** (`NOT NULL`) with a default value of `false`.
   - Proposing SQL change:
     ```sql
     ALTER TABLE public.events
     ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
     ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT false;
     ```

2. **Schema & Migration Location**:
   - Because the database is managed by manual `.sql` files in the root folder, the migration should be structured as a new migration script, e.g. `supabase_featured_live.sql`.
   - The Prisma schema (`prisma/schema.prisma`) should also be updated to ensure local schemas do not drift, despite `@prisma/client` not being directly imported in the active codebase.

3. **Performance Optimization (Indexing)**:
   - Queries to retrieve the featured event (e.g. `eq('is_featured', true)`) and live events (e.g. `eq('is_live', true)`) will occur frequently on page loads.
   - To prevent table scans as the `events` table grows, indices must be created on these columns:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);
     CREATE INDEX IF NOT EXISTS idx_events_is_live ON public.events(is_live);
     ```

4. **RLS Policy Gap Resolution**:
   - Observations show that `public.events` has RLS enabled but only has a public `SELECT` policy. No write policies exist.
   - The client-side admin event manager (`app/admin/events/page.tsx`) uses the client-side `createClient()` with the `anon` key to insert, update, and delete events.
   - With RLS enabled and no write policies, client-side mutations will fail with RLS authorization errors.
   - To resolve this gap, we must propose adding INSERT, UPDATE, and DELETE policies matching the pattern in `speakers` table, checking if the authenticated user is an admin (`public.is_admin()`).

5. **Client-Side/Server-Side Querying & Updates**:
   - **Querying Featured Event** (Homepage / Server):
     We fetch the event where `is_featured = true` and fallback to the nearest upcoming event if none is found:
     ```typescript
     let featuredEvent = null;
     const { data: featuredData } = await supabase
       .from('events')
       .select('id, name, tagline, description, date_time, location_name, city, registered_count, capacity, cover_image')
       .eq('published', true)
       .eq('is_featured', true)
       .order('date_time', { ascending: false })
       .limit(1)
       .maybeSingle();

     if (featuredData) {
       featuredEvent = featuredData;
     } else if (upcomingEvents && upcomingEvents.length > 0) {
       featuredEvent = upcomingEvents[0];
     }
     ```
   - **Querying Live Status in Navbar** (Client):
     `components/Navbar.tsx` is a client component. It can use a `useEffect` hook to fetch live events and subscribe to real-time updates for changes:
     ```typescript
     const [hasLiveEvent, setHasLiveEvent] = useState(false);

     useEffect(() => {
       const checkLive = async () => {
         const { data } = await supabase
           .from('events')
           .select('id')
           .eq('published', true)
           .eq('is_live', true)
           .limit(1);
         setHasLiveEvent(data && data.length > 0);
       };
       checkLive();

       const channel = supabase
         .channel('public:events')
         .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => { checkLive(); })
         .subscribe();

       return () => { supabase.removeChannel(channel); };
     }, []);
     ```

---

## 3. Caveats

- **Singularity of Featured Event**: The database schema itself does not enforce that only *one* event can be featured at any time. If administrators mark multiple events as featured, the homepage query will return the newest one (`order('date_time', { ascending: false })`). If strict singularity is desired, we could define a partial unique index:
  ```sql
  CREATE UNIQUE INDEX idx_events_single_featured ON public.events (is_featured) WHERE (is_featured = true);
  ```
  However, this forces the administrator to manually turn off `is_featured` on the old event before setting the new one. Alternatively, a PostgreSQL trigger could be written to automatically reset `is_featured = false` for all other events when a new one is set to `true`.
- **Database Connection**: We assume the environment variables in `.env.local` are correctly configured with valid Supabase credentials to perform testing.

---

## 4. Conclusion

To implement `is_featured` and `is_live` on the `events` table, the following actionable items should be executed:

1. **Database Migration**: Run a SQL migration script to add columns, create indexes, and establish RLS write policies for authenticated admin users.
2. **Prisma Schema Sync**: Add fields `is_featured Boolean @default(false)` and `is_live Boolean @default(false)` to the `Event` model in `prisma/schema.prisma`.
3. **Admin Page**: Bind inputs (checkboxes) to `is_featured` and `is_live` and map them into the `eventData` payload in `app/admin/events/page.tsx`.
4. **Navbar Component**: Add active check for live status in `components/Navbar.tsx` and dynamically render the live event navigation link.
5. **Homepage Routing**: Query for the featured event in `app/page.tsx` and pass it down as props.

### Propose Migration Patch (SQL)
Create `supabase_featured_live.sql` with:
```sql
-- 1. Add columns
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT false;

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_is_live ON public.events(is_live);

-- 3. Create RLS Write Policies
DROP POLICY IF EXISTS "Allow admin to insert events" ON public.events;
CREATE POLICY "Allow admin to insert events" ON public.events
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin to update events" ON public.events;
CREATE POLICY "Allow admin to update events" ON public.events
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin to delete events" ON public.events;
CREATE POLICY "Allow admin to delete events" ON public.events
    FOR DELETE TO authenticated USING (public.is_admin());
```

---

## 5. Verification Method

To independently verify these database and codebase changes after they are implemented:

1. **Verify Database Columns and Policies**:
   Use the Supabase SQL Editor to query the schema details of the `events` table:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'events' AND column_name IN ('is_featured', 'is_live');
   ```
   Expect two columns: `is_featured` and `is_live`, both type `boolean`, `is_nullable = 'NO'`, `column_default = 'false'`.

2. **Verify Application Build**:
   Verify that TypeScript types compiles successfully:
   ```cmd
   npm run build
   ```

3. **Verify Layout & UI integration**:
   Run the E2E verification test suite to check for crashes or console log issues on the page:
   ```cmd
   node verify-layout.mjs
   ```

4. **Invalidation conditions**:
   If the database migration script is not executed prior to starting the Next.js application, queries targeting the `events` table on the Homepage or Navbar will crash with PostgreSQL error `42703 (column "is_featured" does not exist)`.
