/**
 * lib/dateUtils.ts
 *
 * Timezone-aware date formatting for UPLIFT 2.0.
 *
 * ROOT CAUSE OF THE BUG
 * ──────────────────────
 * `date-fns` format() always renders in the JavaScript runtime's **local**
 * timezone.  On Vercel / Node.js servers that timezone is UTC.  So an event at
 * 09:00 Haiti time stored as "13:00Z" in Supabase was displayed as "13:00"
 * instead of "09:00".
 *
 * FIX
 * ───
 * Use the browser/Node built-in `Intl.DateTimeFormat` which accepts a
 * `timeZone` option, so we always render in "America/Port-au-Prince"
 * regardless of where the server is running.
 *
 * No extra npm packages required.
 */

const HAITI_TZ = 'America/Port-au-Prince';

/**
 * Internal helper to ensure date parsing is robust and handles Postgres strings
 * consistently across server and client environments.
 */
function toDate(dateInput: string | Date): Date {
  if (!dateInput) return new Date(NaN);
  if (typeof dateInput !== 'string') return dateInput;
  
  let normalized = dateInput.trim();
  // Standardize: Replace all spaces with T (handles "YYYY-MM-DD HH:mm:ss")
  if (normalized.includes(' ') && !normalized.includes('T')) {
    normalized = normalized.replace(' ', 'T');
  }
  
  // Fix for Postgres short offsets like "-04" or "+00" which JS doesn't always like
  // Matches "-XX" or "+XX" at the end of the string.
  // We only run this if we know it's a datetime (contains 'T') to avoid matching YYYY-MM-DD.
  if (normalized.includes('T')) {
    const offsetMatch = normalized.match(/[+-](\d{2})$/);
    if (offsetMatch) {
      normalized += ':00';
    }
  }
  
  const d = new Date(normalized);
  
  // Fallback: If parsing failed and there's no offset, try appending Z
  // This helps when dates are stored without TZ info but we know they should be treated as UTC
  if (isNaN(d.getTime()) && !normalized.includes('+') && !normalized.includes('-') && !normalized.endsWith('Z')) {
    const fallback = new Date(normalized + 'Z');
    if (!isNaN(fallback.getTime())) return fallback;
  }
  
  return d;
}

/**
 * Format a date/datetime string as a full date (no time).
 * e.g. "25 avril 2026"
 */
export function formatDate(
  dateInput: string | Date,
  locale: string = 'fr-HT',
): string {
  const d = toDate(dateInput);
  if (isNaN(d.getTime())) return 'Date invalide';
  
  return new Intl.DateTimeFormat(locale, {
    timeZone: HAITI_TZ,
    day:      'numeric',
    month:    'long',
    year:     'numeric',
  }).format(d);
}

/**
 * Format only the time portion, in Haiti local time.
 * e.g. "09:00"
 */
export function formatTime(dateInput: string | Date): string {
  const d = toDate(dateInput);
  if (isNaN(d.getTime())) return '--:--';

  return new Intl.DateTimeFormat('fr-HT', {
    timeZone: HAITI_TZ,
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   false,
  }).format(d);
}

/**
 * Format a full datetime: "vendredi 25 avril 2026, 09:00"
 */
export function formatDateTime(dateInput: string | Date): string {
  const d = toDate(dateInput);
  if (isNaN(d.getTime())) return 'Date invalide';

  return new Intl.DateTimeFormat('fr-HT', {
    timeZone: HAITI_TZ,
    weekday:  'long',
    day:      'numeric',
    month:    'long',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   false,
  }).format(d);
}

/**
 * Compact date for lists/tables: "25 avr. 2026"
 */
export function formatDateShort(
  dateInput: string | Date,
  locale: string = 'fr-HT',
): string {
  const d = toDate(dateInput);
  if (isNaN(d.getTime())) return 'Date invalide';

  return new Intl.DateTimeFormat(locale, {
    timeZone: HAITI_TZ,
    day:      'numeric',
    month:    'short',
    year:     'numeric',
  }).format(d);
}

/**
 * Compact date + time for admin tables: "25/04/2026 09:00"
 */
export function formatDateTimeCompact(dateInput: string | Date): string {
  const d = toDate(dateInput);
  if (isNaN(d.getTime())) return 'Date invalide';

  const date = new Intl.DateTimeFormat('fr-HT', {
    timeZone: HAITI_TZ,
    day:      '2-digit',
    month:    '2-digit',
    year:     'numeric',
  }).format(d);
  const time = formatTime(d);
  return `${date} ${time}`;
}

/**
 * Day-only number, useful for headers: "25"
 */
export function formatDayMonth(dateInput: string | Date): string {
  const d = toDate(dateInput);
  if (isNaN(d.getTime())) return '--';

  return new Intl.DateTimeFormat('fr-HT', {
    timeZone: HAITI_TZ,
    day:      'numeric',
    month:    'long',
  }).format(d);
}
