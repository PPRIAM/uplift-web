import { getSupabaseAdmin } from '@/utils/supabase/admin';

interface StreamReservation {
  id: string;
  email: string;
  status: string;
  payment_status: string;
}

interface StreamTicket {
  id: string;
  status: string;
  ticket_code: string;
  event_id: string;
  reservations: StreamReservation | StreamReservation[];
}

interface CloudflareVideo {
  uid: string;
  created: string;
  status?: {
    current: string;
  };
  playback?: {
    hls?: string;
  };
}

// ─── Server-only helpers for stream access control ────────────────────────────
// These functions run exclusively on the server (API routes / Server Components).
// They use the service-role key to bypass RLS for ticket validation.

// ─── Supabase Admin Client ────────────────────────────────────────────────────

// ─── hasValidTicket ───────────────────────────────────────────────────────────
// Checks if a user (by email) has a valid, non-revoked ticket for a given event.
// A ticket is valid when:
//   1. issued_ticket exists for the event, not revoked
//   2. linked reservation is confirmed
//   3. payment is verified or not required (free)

export async function hasValidTicket(
  userEmail: string,
  eventId: string
): Promise<{ valid: boolean; ticketCode?: string }> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: tickets, error } = await supabaseAdmin
    .from('issued_tickets')
    .select(`
      id,
      status,
      ticket_code,
      event_id,
      reservations!inner (
        id,
        email,
        status,
        payment_status
      )
    `)
    .eq('event_id', eventId)
    .eq('reservations.email', userEmail.toLowerCase())
    .neq('status', 'revoked')
    .limit(1);

  if (error) {
    console.error('[streamAccess] hasValidTicket query error:', error);
    throw new Error('Ticket lookup failed.');
  }

  const validTicket = (tickets as unknown as StreamTicket[] | null)?.find((t) => {
    const reservation = Array.isArray(t.reservations)
      ? t.reservations[0]
      : t.reservations;
    return (
      reservation &&
      reservation.status === 'confirmed' &&
      (reservation.payment_status === 'not_required' ||
        reservation.payment_status === 'verified')
    );
  });

  if (!validTicket) {
    return { valid: false };
  }

  return { valid: true, ticketCode: validTicket.ticket_code };
}

// ─── getLatestReplayHlsUrl ───────────────────────────────────────────────────
// Calls Cloudflare Stream API to fetch the latest ready recording
// for a given live input, then returns its HLS playback URL.
//
// API: GET /accounts/{account_id}/stream/live_inputs/{live_input_id}/videos
// Docs: https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/subresources/videos/methods/list/

export async function getLatestReplayHlsUrl(
  liveInputId: string
): Promise<string | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const customerSubdomain = process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN;

  if (!accountId || !apiToken) {
    console.error('[streamAccess] Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
    return null;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs/${liveInputId}/videos`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    // Don't cache — always get fresh list
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('[streamAccess] Cloudflare API error:', res.status, await res.text());
    return null;
  }

  const json = await res.json();
  const videos: CloudflareVideo[] = json.result || [];

  // Filter to only "ready" videos, sort by created desc
  const readyVideos = videos
    .filter((v) => v.status?.current === 'ready')
    .sort((a, b) =>
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );

  if (readyVideos.length === 0) {
    return null;
  }

  const latest = readyVideos[0];

  // Build the HLS URL using customer subdomain if available,
  // otherwise fall back to the playback URL from the API response
  if (customerSubdomain) {
    return `https://${customerSubdomain}.cloudflarestream.com/${latest.uid}/manifest/video.m3u8`;
  }

  // Fallback: use the playback.hls from the API response
  return latest.playback?.hls || null;
}

// ─── getLiveHlsUrl ───────────────────────────────────────────────────────────
// Builds the live HLS URL for a given live input ID using the customer subdomain.

export function getLiveHlsUrl(liveInputId: string): string | null {
  const customerSubdomain = process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN;

  if (!customerSubdomain) {
    console.error('[streamAccess] Missing CLOUDFLARE_CUSTOMER_SUBDOMAIN');
    return null;
  }

  return `https://${customerSubdomain}.cloudflarestream.com/${liveInputId}/manifest/video.m3u8`;
}
