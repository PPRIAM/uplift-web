# Backend Schema Document - Ticket Currency & Automatic Ticket Creation

## 1. Relational Table Schema: `tickets`
The schema of the `tickets` table remains unmodified in PostgreSQL, but the application layer will map the nullable `description` column to handle the ticket's currency.

| Column Name | Database Type | Required | Default Value | Purpose |
| --- | --- | --- | --- | --- |
| `id` | `UUID` | Yes | `uuid_generate_v4()` | Primary Key |
| `event_id` | `UUID` | Yes | - | Foreign Key to `events.id` (on delete cascade) |
| `name` | `TEXT` | Yes | - | Name of the ticket type (e.g. Standard, VIP) |
| `price` | `NUMERIC` | Yes | `0` | Base price |
| `quantity` | `INTEGER` | Yes | `0` | Total tickets allocated |
| `sold` | `INTEGER` | Yes | `0` | Total tickets reserved |
| `available` | `BOOLEAN` | Yes | `true` | Ticket visibility status |
| `benefits` | `TEXT[]` | No | `'{ }'` | Array of features/benefits |
| `allocation_mode` | `TEXT` | No | `'standard'` | Standard, Shared, or Expanded mode |
| `pricing_tiers` | `JSONB` | No | `'[ ]'` | Pricing variants array |
| `description` | `TEXT` | No | `null` | **Repurposed to store currency code (`'USD'` or `'HTG'`)** |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | Audit timestamp |

## 2. Default Currency Resolution
- Since legacy tickets might have `description = null` or empty values, the application must apply a fallback:
  - If `description` is `null` or is not `'HTG'`, it defaults to `'USD'`.
- All prices for standard tickets and pricing tiers are evaluated and formatted according to this value.

## 3. RLS (Row Level Security) Policies
The `tickets` table has RLS enabled with the following logic:
- **Public Read Access**: Anyone (authenticated or guest) is allowed to read tickets.
- **Admin Write Access**: Only authenticated users with admin privileges (`public.is_admin() = true`) are allowed to perform write mutations (`INSERT`, `UPDATE`, `DELETE`).
- Verification check: Both anonymous inserts (using public anon key) and authenticated administrator inserts (using session cookies/headers) succeed against the database API endpoint.
