# Handoff Report — DB Schema Investigation for Events Table

## 1. Observation
- **Original Schema Definition**:
  - Inside `D:\UPLIFT20\uplift-web\supabase_schema.sql` (lines 5-21), the `public.events` table is created:
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
- **Schema Alterations**:
  - `D:\UPLIFT20\uplift-web\supabase_cover_image.sql` (lines 7-8) alters the table to add `cover_image`:
    ```sql
    ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS cover_image TEXT;
    ```
  - `D:\UPLIFT20\uplift-web\supabase_stream_access.sql` (lines 5-7) alters the table to add `cloudflare_live_input_id`:
    ```sql
    ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS cloudflare_live_input_id TEXT;
    ```
- **Prisma Schema Definition**:
  - Inside `D:\UPLIFT20\uplift-web\prisma\schema.prisma` (lines 10-24), the `Event` model is defined as:
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
- **Database Client Initializations**:
  - **Client-side**: In `D:\UPLIFT20\uplift-web\utils\supabase\client.ts` (lines 6-10):
    ```typescript
    export const createClient = () =>
      createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
      );
    ```
  - **Server-side (Server Components/Actions)**: In `D:\UPLIFT20\uplift-web\utils\supabase\server.ts` (lines 7-28):
    ```typescript
    export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
      return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
              } catch (error) { ... }
            },
          },
        },
      );
    };
    ```
  - **Server-side (API Routes/Utilities)**: In `D:\UPLIFT20\uplift-web\utils\supabase\public.ts` (lines 8-10):
    ```typescript
    export const createPublicClient = () => {
      return createClient(supabaseUrl!, supabaseKey!);
    };
    ```
  - **Server-side (Middleware)**: In `D:\UPLIFT20\uplift-web\utils\supabase\middleware.ts` (lines 10-38):
    ```typescript
    export const createClient = async (request: NextRequest) => { ... }
    ```
- **Prisma Usage Search**:
  - A recursive search in `app/`, `components/`, `lib/`, and `utils/` directories returned zero occurrences of the `prisma` keyword. The application communicates with the database exclusively via the `@supabase/supabase-js` and `@supabase/ssr` clients.

---

## 2. Logic Chain
- **Nullability Analysis**:
  - *Observation*: The database contains existing boolean columns (e.g. `featured` and `published`) defined as `BOOLEAN NOT NULL DEFAULT false/true`.
  - *Deduction*: Boolean columns in TypeScript map to `boolean` values (`true` | `false`). If columns are nullable (`BOOLEAN DEFAULT false` without `NOT NULL`), PostgreSQL allows `NULL` values. This introduces tri-state logic (`true`, `false`, `null`) which requires extra checks in the code (e.g. `val ?? false` or `val === true`). Enforcing `NOT NULL DEFAULT false` ensures all records always have a strict boolean value, matching TypeScript expectations and simplifying queries.
- **Migration Location**:
  - *Observation*: All schema alterations and additions in this project are tracked as independent `.sql` migration files located directly in the workspace root directory (e.g., `supabase_cover_image.sql`, `supabase_stream_access.sql`, etc.), which are then manually executed in the Supabase SQL Editor.
  - *Deduction*: To maintain this established project structure, the addition of `is_featured` and `is_live` must be defined in a new `.sql` script at the root directory, such as `supabase_add_featured_live_events.sql`.
  - *Deduction*: While the application doesn't actively invoke Prisma client to query the database, a declarative schema is maintained in `prisma/schema.prisma`. To prevent the Prisma schema from drifting, the `Event` model must be updated accordingly.

---

## 3. Caveats
- Although Prisma is present in the `devDependencies` and has a schema file, it is not used for queries or database migrations. If the development workflow plans to transition to Prisma migrations in the future, database-level changes made in Supabase will need to be pulled using `prisma db pull`.

---

## 4. Conclusion
To add `is_featured` and `is_live` columns to the `events` table (defaulting both to false):
1. **Nullability**: Both columns should be **non-nullable** (`BOOLEAN NOT NULL DEFAULT false`). This prevents tri-state logic and aligns with the database's existing boolean patterns.
2. **Database Migration Location**:
   - Write a new migration SQL script named `supabase_add_featured_live_events.sql` in the project root:
     ```sql
     -- Add is_featured and is_live columns to public.events table
     ALTER TABLE public.events 
     ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
     ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT false;
     ```
   - Execute this script in the Supabase SQL Editor.
3. **Prisma Sync**:
   - Update `prisma/schema.prisma` to include:
     ```prisma
     model Event {
       ...
       is_featured      Boolean  @default(false)
       is_live          Boolean  @default(false)
       ...
     }
     ```
4. **Code Queries / Updates**:
   - Querying:
     ```typescript
     const { data, error } = await supabase
       .from('events')
       .select('id, name, is_featured, is_live')
       .eq('is_live', true);
     ```
   - Updating:
     ```typescript
     const { error } = await supabase
       .from('events')
       .update({ is_featured: true, is_live: false })
       .eq('id', eventId);
     ```

---

## 5. Verification Method
1. **Verification of Schema Change**:
   - After running the SQL migration, verify the table columns by checking the database schema in Supabase (or running a description query like `\d public.events` / querying `information_schema.columns`).
2. **Verification of Prisma Sync**:
   - Run `npx prisma validate` to ensure that the updated `prisma/schema.prisma` is syntactically valid and has no structure conflicts.
