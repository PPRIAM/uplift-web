import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  hasValidTicket,
  getLatestReplayHlsUrl,
  getLiveHlsUrl,
} from '@/lib/streamAccess';
import { getSupabaseAdmin } from '@/utils/supabase/admin';

// ─── Server-side stream access check ──────────────────────────────────────────
// This endpoint NEVER exposes the HLS URL in the client bundle.
// It validates the user's session + ticket status before returning the URL.
// Flow: auth check → event lookup → ticket validation → dynamic URL generation.
//
// Root cause of "Le flux en direct n'est pas encore disponible":
//   1. events.cloudflare_live_input_id is NULL (migration not run, or not set)
//   2. CLOUDFLARE_CUSTOMER_SUBDOMAIN env var is missing
//   → Fix: fall back to CLOUDFLARE_LIVE_INPUT_ID env var when DB column is empty.

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json().catch(() => ({}));
    const type: string = body.type ?? 'live';
    const eventId: string | undefined = body.eventId;

    // 2. Get authenticated user from session cookies
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* Read-only in API routes */ },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: 'Email de l\'utilisateur introuvable.' },
        { status: 400 }
      );
    }

    // 3. Resolve the event — either by explicit eventId or latest published event
    const supabaseAdmin = getSupabaseAdmin();
    let event: any = null;

    if (eventId) {
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('id, name, cloudflare_live_input_id, date_time, location_name, city')
        .eq('id', eventId)
        .single();

      if (error || !data) {
        console.error('[Stream Access] Event lookup failed:', eventId, error?.message);
        return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
      }
      event = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('id, name, cloudflare_live_input_id, date_time, location_name, city')
        .eq('published', true)
        .order('date_time', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.error('[Stream Access] No published events found:', error?.message);
        return NextResponse.json({ error: 'Aucun événement disponible.' }, { status: 404 });
      }
      event = data;
    }

    // 4. Resolve live input ID — DB column first, then env var fallback
    //    The DB column is set via the supabase_stream_access.sql migration.
    //    Until that migration is run (or the value is manually set), the env
    //    var CLOUDFLARE_LIVE_INPUT_ID acts as a safe fallback.
    const liveInputId: string | null =
      event.cloudflare_live_input_id?.trim() ||
      process.env.CLOUDFLARE_LIVE_INPUT_ID?.trim() ||
      null;

    if (!liveInputId) {
      console.error(
        '[Stream Access] No live input ID available.',
        'event.cloudflare_live_input_id:', event.cloudflare_live_input_id,
        'CLOUDFLARE_LIVE_INPUT_ID env:', process.env.CLOUDFLARE_LIVE_INPUT_ID
      );
      return NextResponse.json(
        { error: 'Le flux n\'est pas encore configuré pour cet événement.' },
        { status: 503 }
      );
    }

    // 5. Validate ticket access
    const ticketResult = await hasValidTicket(user.email, event.id);

    if (!ticketResult.valid) {
      return NextResponse.json(
        { error: 'Aucun billet valide trouvé. Veuillez réserver votre place.' },
        { status: 403 }
      );
    }

    // 6. Generate the appropriate HLS URL dynamically
    let streamUrl: string | null = null;

    if (type === 'replay') {
      // Dynamic: call Cloudflare API to get the latest ready recording
      streamUrl = await getLatestReplayHlsUrl(liveInputId);
      if (!streamUrl) {
        console.warn('[Stream Access] No ready replay found for liveInputId:', liveInputId);
        return NextResponse.json(
          { error: 'Aucune rediffusion disponible pour le moment.' },
          { status: 404 }
        );
      }
    } else {
      // Live: build URL from customer subdomain + live input ID
      streamUrl = getLiveHlsUrl(liveInputId);
      if (!streamUrl) {
        console.error('[Stream Access] getLiveHlsUrl returned null. CLOUDFLARE_CUSTOMER_SUBDOMAIN:', process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN);
        return NextResponse.json(
          { error: 'Le flux en direct n\'est pas encore disponible.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({
      streamUrl,
      ticketCode: ticketResult.ticketCode,
      type,
      eventId: event.id,
      eventName: event.name,
    });

  } catch (err: unknown) {
    console.error('[Stream Access] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur inattendue.' },
      { status: 500 }
    );
  }
}
