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

// ─── Utilitaires côté serveur pour le contrôle d'accès au flux ────────────────
// Ces fonctions s'exécutent exclusivement côté serveur (Route Handlers / Server Components).
// Elles utilisent le client d'administration Supabase pour contourner les politiques RLS.

/**
 * Vérifie si un utilisateur (par e-mail) possède un billet de flux valide pour un événement donné.
 * Un billet est considéré comme valide si :
 *   1. L'enregistrement correspond dans issued_tickets et n'est pas révoqué.
 *   2. La réservation associée est confirmée.
 *   3. Le statut du paiement est 'verified' ou 'not_required' (gratuit).
 */
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
    console.error('[streamAccess] Erreur lors de la vérification du billet :', error);
    throw new Error('La recherche de billets a échoué.');
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

/**
 * Appelle l'API Cloudflare Stream pour récupérer le dernier enregistrement disponible (replay)
 * associé à une entrée en direct (live input) donnée, et retourne son URL de lecture HLS.
 *
 * API : GET /accounts/{account_id}/stream/live_inputs/{live_input_id}/videos
 * Réf : https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/subresources/videos/methods/list/
 */
export async function getLatestReplayHlsUrl(
  liveInputId: string
): Promise<string | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const customerSubdomain = process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN;

  if (!accountId || !apiToken) {
    console.error('[streamAccess] Identifiants Cloudflare manquants (CLOUDFLARE_ACCOUNT_ID ou CLOUDFLARE_API_TOKEN).');
    return null;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs/${liveInputId}/videos`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    // Désactiver le cache pour garantir une liste toujours à jour
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('[streamAccess] Erreur de l\'API Cloudflare :', res.status, await res.text());
    return null;
  }

  const json = await res.json();
  const videos: CloudflareVideo[] = json.result || [];

  // Conserver uniquement les vidéos prêtes ("ready") et trier par date de création décroissante
  const readyVideos = videos
    .filter((v) => v.status?.current === 'ready')
    .sort((a, b) =>
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );

  if (readyVideos.length === 0) {
    return null;
  }

  const latest = readyVideos[0];

  // Si un sous-domaine client personnalisé est configuré, l'utiliser pour construire l'adresse HLS,
  // sinon se rabattre sur l'adresse retournée directement par l'API.
  if (customerSubdomain) {
    return `https://${customerSubdomain}.cloudflarestream.com/${latest.uid}/manifest/video.m3u8`;
  }

  return latest.playback?.hls || null;
}

/**
 * Construit l'URL de diffusion en direct (live HLS) pour une entrée en direct à partir du sous-domaine client.
 */
export function getLiveHlsUrl(liveInputId: string): string | null {
  const customerSubdomain = process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN;

  if (!customerSubdomain) {
    console.error('[streamAccess] Variable CLOUDFLARE_CUSTOMER_SUBDOMAIN manquante.');
    return null;
  }

  return `https://${customerSubdomain}.cloudflarestream.com/${liveInputId}/manifest/video.m3u8`;
}
