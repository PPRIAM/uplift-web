# Technical Requirements Document (TRD) - Ticket Currency & Automatic Ticket Creation

## 1. Technical Stack & Environment
- **Framework**: Next.js (React components with 'use client' directives).
- **Database Client**: Supabase Client SDK (PostgREST API).
- **Database Schema Storage**: Column `description` (type `text`) in table `tickets` will be repurposed to hold the currency code (e.g., `'USD'` or `'HTG'`). If empty or null, it falls back to `'USD'`.

## 2. Utility Helper Functions
A new helper function `formatPrice` will be added to `lib/ticketUtils.ts`:

```typescript
/**
 * Formats a ticket price based on its currency.
 */
export function formatPrice(price: number, currency: string | null | undefined): string {
  if (price === 0) return 'Gratuit';
  const curr = currency === 'HTG' ? 'HTG' : 'USD';
  if (curr === 'HTG') {
    return `${price.toLocaleString('fr-HT')} HTG`;
  }
  return `$${price}`;
}
```

This helper will be used on both the administration page and public event detail client pages.

## 3. Admin Ticket Forms Changes (`app/admin/tickets/page.tsx`)
- **State Integration**: Add `description: 'USD'` to the initial form state representing the currency choice.
- **Form Controls**: Add a toggle button or dropdown option for selecting the currency. When the selection changes, set `form.description` to the new currency code.
- **Price Input Adaptations**: Display the currency symbol (`$` or `HTG`) next to price inputs for clarity.
- **CRUD Operations**: Pass `description: form.description` into the `ticketData` payload for both `insert` and `update` queries.

## 4. Automatic Ticket Creation Changes (`app/admin/events/page.tsx`)
- **After Event Insert**: Inside `handleSave` in the event creation page, detect if it's a new event (`!editEvent`) and if the event is successfully inserted into the database.
- **Insert Default Ticket**: Execute a Supabase insert query to create a default "Standard" ticket:
  ```typescript
  const defaultTicket = {
    event_id: savedEventId,
    name: 'Standard',
    price: 0,
    quantity: eventData.capacity || 500,
    benefits: ['Accès général à l\'événement'],
    available: true,
    allocation_mode: 'standard',
    description: 'USD', // default currency
    pricing_tiers: []
  };
  await supabase.from('tickets').insert([defaultTicket]);
  ```
- **Error Handling**: Log any ticket creation errors and show an alert if it fails, without rolling back the event creation (which is already done).
