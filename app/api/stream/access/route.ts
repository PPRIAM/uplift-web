import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  hasValidTicket,
  getLatestReplayHlsUrl,
  getLiveHlsUrl,
} from '@/lib/streamAccess';
import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

// ─── Contrôle d'accès au flux côté serveur ──────────────────────────────────────────
// Cet endpoint n'expose JAMAIS l'URL HLS dans le bundle client.
// Il valide la session de l'utilisateur + le statut du billet avant de renvoyer l'URL.
// Flux : vérification d'authentification → recherche d'événement → validation du billet → génération d'URL dynamique.
//
// Cause racine de "Le flux en direct n'est pas encore disponible" :
//   1. events.cloudflare_live_input_id est NULL (migration non exécutée, ou non défini)
//   2. La variable d'environnement CLOUDFLARE_CUSTOMER_SUBDOMAIN est manquante
//   → Correction : se rabattre sur la variable d'environnement CLOUDFLARE_LIVE_INPUT_ID lorsque la colonne DB est vide.

export async function POST(req: NextRequest) {
  try {
    // 1. Analyser le corps de la requête
    const body = await req.json().catch(() => ({}));
    const type: string = body.type ?? 'live';
    const eventId: string | undefined = body.eventId;

    // 2. Obtenir l'utilisateur authentifié depuis les cookies de session
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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

    // 3. Résoudre l'événement — soit par un eventId explicite, soit par le dernier événement publié
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

    // 4. Résoudre l'ID d'entrée en direct — colonne de la base de données en premier, puis variable d'environnement en secours.
    //    La colonne DB est définie via la migration supabase_stream_access.sql.
    //    Jusqu'à ce que cette migration soit exécutée (ou la valeur définie manuellement), la variable
    //    d'environnement CLOUDFLARE_LIVE_INPUT_ID sert de secours sécurisé.
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

    // 5. Valider l'accès au billet
    const ticketResult = await hasValidTicket(user.email, event.id);

    if (!ticketResult.valid) {
      return NextResponse.json(
        { error: 'Aucun billet valide trouvé. Veuillez réserver votre place.' },
        { status: 403 }
      );
    }

    // 6. Générer l'URL HLS appropriée de manière dynamique
    let streamUrl: string | null = null;

    if (type === 'replay') {
      // Dynamique : appeler l'API Cloudflare pour obtenir le dernier enregistrement prêt
      streamUrl = await getLatestReplayHlsUrl(liveInputId);
      if (!streamUrl) {
        console.warn('[Stream Access] No ready replay found for liveInputId:', liveInputId);
        return NextResponse.json(
          { error: 'Aucune rediffusion disponible pour le moment.' },
          { status: 404 }
        );
      }
    } else {
      // Direct : construire l'URL à partir du sous-domaine client + ID d'entrée en direct
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
