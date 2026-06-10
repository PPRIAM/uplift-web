# DB Schema and Event Flags Investigation Report

## 1. Observation
Below are the exact direct observations from the codebase investigation.

### 1.1 Existing Database Schema for `events`
In `supabase_schema.sql` (lines 5-21), the `events` table is defined as:
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

In `prisma/schema.prisma` (lines 10-24), the `Event` model is defined as:
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

### 1.2 Database Client Initialization
The project utilizes `@supabase/ssr` and `@supabase/supabase-js` to initialize Supabase clients for different contexts, stored in `utils/supabase/`:

*   **Client-Side (Browser)**: Defined in `utils/supabase/client.ts` (lines 6-10):
    ```typescript
    export const createClient = () =>
      createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
      );
    ```
*   **Server-Side (Next.js Server Components)**: Defined in `utils/supabase/server.ts` (lines 7-28), passing context cookies:
    ```typescript
    export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
      return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
          cookies: {
            getAll() { return cookieStore.getAll() },
            setAll(cookiesToSet) { ... }
          }
        }
      );
    };
    ```
*   **Public Client**: Defined in `utils/supabase/public.ts` (lines 8-10):
    ```typescript
    export const createPublicClient = () => {
      return createClient(supabaseUrl!, supabaseKey!);
    };
    ```
*   **Middleware Client**: Defined in `utils/supabase/middleware.ts` (lines 10-60) to inspect request cookies and enforce authentication checks.
*   **Admin Client (Server-side API routes)**: Defined inline in certain API routes (e.g. `app/api/stream/access/route.ts` lines 21-31) using the `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security (RLS) policies:
    ```typescript
    function getSupabaseAdmin() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      ...
      return createClient(url, key);
    }
    ```

### 1.3 Database Querying and Updating in Codebase
*   **Public Event Queries**: Events are retrieved using `supabase.from('events').select(...)` with filters.
    *   In `app/events/page.tsx` (lines 15-18):
        ```typescript
        const { data: events } = await supabase
          .from('events')
          .select('id, name, tagline, description, date_time, location_name, city, registered_count, capacity, cover_image, tags, published')
          .eq('published', true);
        ```
    *   In `app/page.tsx` (lines 10-16):
        ```typescript
        const { data: upcomingEvents } = await supabase
          .from('events')
          .select('id, name, tagline, description, date_time, location_name, city, registered_count, capacity, cover_image')
          .eq('published', true)
          .gt('date_time', new Date().toISOString())
          .order('date_time', { ascending: true })
          .limit(3);
        ```
*   **Admin Event Queries & Updates**:
    *   In `app/admin/events/page.tsx` (lines 58-61) to fetch all events:
        ```typescript
        const { data } = await supabase
          .from('events')
          .select('*')
          .order('date_time', { ascending: false });
        ```
    *   In `app/admin/events/page.tsx` (lines 76) to update event published status:
        ```typescript
        const { error } = await supabase.from('events').update({ published: !currentStatus }).eq('id', id).select();
        ```
    *   In `app/admin/events/page.tsx` (lines 193-197) to insert or update full event objects:
        ```typescript
        if (editEvent) {
          const { error: updateError } = await supabase.from('events').update(eventData).eq('id', editEvent.id).select();
          error = updateError;
        } else {
          const { data: insertData, error: insertError } = await supabase.from('events').insert([eventData]).select().single();
          error = insertError;
          if (insertData) savedEventId = insertData.id;
        }
        ```

### 1.4 Database Migrations definition location
All database schema modifications are defined as `.sql` scripts in the root directory (e.g. `supabase_schema.sql`, `supabase_update_schema.sql`, `supabase_update_schema_v2.sql`, `supabase_visibility.sql`, `supabase_alter.sql`). These are executed manually via the Supabase SQL Editor. There is no automated framework migration system configured (like Prisma Migrate or Supabase CLI migrations).

### 1.5 Row Level Security (RLS) Policies on Events
In `supabase_rls.sql` (lines 12-13), the only security policy for `events` is:
```sql
DROP POLICY IF EXISTS "Activer la lecture publique pour les events" ON public.events;
CREATE POLICY "Activer la lecture publique pour les events" ON public.events FOR SELECT USING (true);
```
No UPDATE, INSERT, or DELETE policies are declared for `public.events` in any of the codebase SQL files.

---

## 2. Logic Chain

### 2.1 Nullability Analysis
*   **Observation**: The request is to add `is_featured` and `is_live` columns to the `events` table, both defaulting to `false`.
*   **Observation**: In `supabase_schema.sql`, the existing columns `featured` and `published` are defined as `BOOLEAN NOT NULL DEFAULT false` and `BOOLEAN NOT NULL DEFAULT true` respectively.
*   **Reasoning**: Defining these boolean flags as `NOT NULL` prevents `NULL` values. If they were nullable, SQL queries would have to handle three-valued logic (true, false, null), which is error-prone.
*   **Conclusion**: The new columns must be defined as `NOT NULL` (i.e. `is_featured BOOLEAN NOT NULL DEFAULT false` and `is_live BOOLEAN NOT NULL DEFAULT false`).

### 2.2 Client-Side Querying/Updating Mechanism
*   **Observation**: The client-side application queries `events` using the `@supabase/supabase-js` syntax `.from('events').select(...)` and updates them using `.update(...)`.
*   **Reasoning**: Adding new columns does not disrupt existing select queries if they specify columns explicitly (e.g., in `app/events/page.tsx`). However, components that use `.select('*')` (like the admin panel) will automatically retrieve the new columns.
*   **Conclusion**: Querying the new flags can be done using `.select('..., is_featured, is_live')` or `.eq('is_live', true)`. Updating can be done by passing `{ is_featured: boolean, is_live: boolean }` within the payload of `.update()`.

### 2.3 Migration Execution Location
*   **Observation**: The project contains manual `.sql` files in the root folder rather than automated migrations.
*   **Reasoning**: To keep in line with this codebase's architectural pattern, the new columns should be created via an SQL script executed in the Supabase SQL Editor.
*   **Conclusion**: The migration should be structured as a new SQL file (e.g. `supabase_add_event_flags.sql`) in the root directory and run in Supabase.

---

## 3. Caveats
1.  **Prisma Schema Desynchronization**: The file `prisma/schema.prisma` is out of sync with the live Supabase schema (it lacks database columns like `capacity`, `registered_count`, `featured`, `tags`, and `published`). While updating it is good for documentation, Prisma Migrate is not being used to alter the database schema.
2.  **Missing RLS policies for writes**: Since `public.events` RLS is enabled, and there are no UPDATE or INSERT policies defined in the codebase SQL scripts, client-side actions in `app/admin/events/page.tsx` that write to `events` (using the client-side anon key client) might fail due to RLS unless admin-specific write policies were manually defined directly in Supabase. A proper write policy for admin should be suggested in the migration.
3.  **Duplicate featured columns**: An existing `featured` column already exists in the table. The addition of `is_featured` might duplicate this data. A data migration step should be included to copy values from `featured` to `is_featured` if needed.

---

## 4. Conclusion
To add `is_featured` and `is_live` columns to the `events` table:

1.  **Database Migration**:
    Create a new file `supabase_add_event_flags.sql` in the root directory with the following content:
    ```sql
    -- Add is_featured and is_live columns to events table
    ALTER TABLE public.events 
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT false;

    -- Optional: Sync existing data from 'featured' to 'is_featured'
    UPDATE public.events SET is_featured = featured;

    -- Ensure Admins have policies to insert/update/delete events if RLS is enforced
    DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
    CREATE POLICY "Admins can manage events" ON public.events
        FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    ```
    This script must be executed manually in the **Supabase SQL Editor**.

2.  **Prisma Schema Update**:
    Add the fields to the `Event` model in `prisma/schema.prisma`:
    ```prisma
    model Event {
      ...
      is_featured Boolean @default(false)
      is_live     Boolean @default(false)
      ...
    }
    ```

3.  **Querying/Updating in TypeScript**:
    *   **Select**:
        ```typescript
        const { data, error } = await supabase
          .from('events')
          .select('id, name, is_featured, is_live')
          .eq('is_live', true);
        ```
    *   **Update**:
        ```typescript
        const { error } = await supabase
          .from('events')
          .update({ is_live: true })
          .eq('id', eventId);
        ```

---

## 5. Verification Method
To independently verify the schema updates without modifying the source application:

1.  **Expose Database State**:
    Run a diagnostic SQL select query in the Supabase SQL Editor:
    ```sql
    SELECT id, name, featured, is_featured, is_live FROM public.events LIMIT 5;
    ```
    Verify that `is_featured` and `is_live` exist, are non-null, and default to `false`.

2.  **Execute Connection Test**:
    Run the connection test script to ensure database communication is functioning correctly:
    ```bash
    node test-supabase.mjs
    ```
    Verify it returns `SUCCÈS TOTAL : Connecté à Supabase ET la table 'events' a été trouvée !`.

3.  **Validate RLS Access**:
    Run the security test script:
    ```bash
    node test-security.mjs
    ```
    Verify that public access to events is not blocked by the schema modifications.
