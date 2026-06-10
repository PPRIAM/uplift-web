import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createHash } from 'crypto';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSupabase, getSupabaseAdmin } from '@/utils/supabase/admin';
import { generateTicketCode } from '@/lib/ticketUtils';

// ─── Email / App config ───────────────────────────────────────────────────────
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('dummy')) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return new Resend(key || 're_dummy');
    }
    throw new Error('CONFIG_ERROR: RESEND_API_KEY is missing.');
  }
  return new Resend(key);
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
// Strict RFC 5322-lite email regex (covers 99.99 % of real addresses)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Hash an email for privacy-safe audit logging (SHA-256 hex) */
function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/** Extract best-effort client IP from Next.js request headers */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Fire-and-forget audit log writer.
 * Never throws — audit failures must NOT affect the reservation outcome.
 */
async function auditLog(params: {
  event_id:   string | null;
  email:      string;
  ip:         string;
  userAgent:  string;
  outcome:    'success' | 'duplicate' | 'invalid' | 'rate_limited' | 'error' | 'event_not_found';
  detail?:    string;
}): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.rpc('log_reservation_attempt', {
      p_event_id:   params.event_id,
      p_email_hash: hashEmail(params.email),
      p_ip_address: params.ip,
      p_user_agent: params.userAgent,
      p_outcome:    params.outcome,
      p_detail:     params.detail ?? null,
    });
  } catch (err) {
    console.warn('[Audit] log_reservation_attempt RPC failed:', err);
  }
}

// ─── Email HTML template ──────────────────────────────────────────────────────
function buildEmailHTML(params: {
  full_name:        string;
  event_name:       string;
  event_date:       string;
  event_location:   string;
  quantity:         number;
  confirmation_url: string;
}): string {
  const { full_name, event_name, event_date, event_location, quantity, confirmation_url } = params;
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmation Ayibuzz Media</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B29CC 0%,#0018FF 100%);padding:40px 48px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Confirmation de réservation</p>
            <h1 style="margin:0;font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Ayibuzz Media</h1>
            <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.8);font-style:italic;">Leve ansanm, Briye ansanm</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0a0a0a;">Bonjour ${full_name} 👋</p>
            <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.7;">
              Votre réservation pour <strong style="color:#0a0a0a;">${event_name}</strong> a été reçue avec succès.
              Cliquez sur le bouton ci-dessous pour confirmer votre place.
            </p>

            <!-- Event details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f2;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
              <tr><td>
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Détails de votre réservation</p>
                <table width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#555;width:120px;">📅 Date</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0a0a0a;">${event_date}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#555;">📍 Lieu</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0a0a0a;">${event_location}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#555;">🎟️ Places</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0a0a0a;">${quantity} place${quantity > 1 ? 's' : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#555;">💰 Prix</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#16a34a;">Gratuit</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td align="center">
                <a href="${confirmation_url}" style="display:inline-block;background:linear-gradient(135deg,#1B29CC,#0018FF);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:800;letter-spacing:0.02em;">
                  ✅ Confirmer ma participation
                </a>
              </td></tr>
            </table>

            <p style="margin:0 0 4px;font-size:12px;color:#aaa;text-align:center;">
              Ce lien expire dans 48 heures. Si vous n'avez pas fait cette demande, ignorez cet e-mail.
            </p>
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;word-break:break-all;">
              Ou copiez ce lien : ${confirmation_url}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f7f2;padding:24px 48px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">© 2026 Ayibuzz Media · Gonaïves, Haïti</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── POST /api/reservations ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const ip        = getClientIp(req);
  const userAgent = req.headers.get('user-agent') ?? 'unknown';

  // ── 1. Rate limiting ────────────────────────────────────────────────────────
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    // Audit log — no email yet, use placeholder hash
    void auditLog({
      event_id: null,
      email:    'rate_limited',
      ip,
      userAgent,
      outcome:  'rate_limited',
      detail:   `Retry after ${rateCheck.retryAfterSeconds}s`,
    });
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.retryAfterSeconds),
          'X-RateLimit-Limit':     '5',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // ── 2. Parse body ───────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body. JSON expected.' },
      { status: 400 }
    );
  }

  const { full_name, email: rawEmail, quantity, event_id, ticket_id, ticket_tier, payment_method, payment_proof_url } = body as {
    full_name?: unknown;
    email?:     unknown;
    quantity?:  unknown;
    event_id?:  unknown;
    ticket_id?: unknown;
    ticket_tier?: unknown;
    payment_method?: unknown;
    payment_proof_url?: unknown;
  };

  // ── 3. Field presence validation ────────────────────────────────────────────
  if (
    typeof full_name !== 'string' || !full_name.trim() ||
    typeof rawEmail  !== 'string' || !rawEmail.trim()  ||
    typeof event_id  !== 'string' || !event_id.trim()
  ) {
    return NextResponse.json(
      { error: 'Missing required fields: name, email, and event ID are all required.' },
      { status: 400 }
    );
  }

  const email    = rawEmail.toLowerCase().trim();
  const name     = full_name.trim();
  const qty      = Math.max(1, Math.min(10, Number(quantity) || 1));
  const eventId  = event_id.trim();

  // ── 4. Email format validation ──────────────────────────────────────────────
  if (!EMAIL_REGEX.test(email)) {
    void auditLog({ event_id: eventId, email, ip, userAgent, outcome: 'invalid', detail: 'Invalid email format' });
    return NextResponse.json(
      { error: 'Invalid email address. Please enter a valid email (e.g. name@example.com).' },
      { status: 400 }
    );
  }

  try {
    // ── 5. Event lookup ─────────────────────────────────────────────────────
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, date_time, location_name, city')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('[Reservations] Event not found:', eventId, eventError);
      void auditLog({ event_id: eventId, email, ip, userAgent, outcome: 'event_not_found' });
      return NextResponse.json(
        { error: 'The selected event could not be found. Please refresh and try again.' },
        { status: 404 }
      );
    }

    // ── 6. Soft duplicate check (before DB insert, for faster UX feedback) ──
    const { data: existing, error: findError } = await supabase
      .from('reservations')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', email)
      .maybeSingle();

    if (findError) {
      // Non-fatal: log and continue — the DB constraint is the hard safety net
      console.warn('[Reservations] Duplicate check query failed:', findError.message);
    }

    if (existing) {
      void auditLog({ event_id: eventId, email, ip, userAgent, outcome: 'duplicate', detail: 'Soft check' });
      return NextResponse.json(
        {
          error:
            'This email address is already registered for this event. ' +
            'To reserve an additional spot, please use a different email address.',
        },
        { status: 409 }
      );
    }

    // ── 7. Build reservation payload ────────────────────────────────────────
    const reservationData: Record<string, unknown> = {
      event_id:     eventId,
      full_name:    name,
      email,
      quantity:     qty,
    };

    if (payment_method === 'moncash' || payment_method === 'natcash') {
      reservationData.status = 'pending';
      reservationData.payment_method = payment_method;
      reservationData.payment_proof_url = typeof payment_proof_url === 'string' ? payment_proof_url : null;
      reservationData.payment_status = 'pending';
    } else {
      reservationData.status = 'confirmed';
      reservationData.confirmed_at = new Date().toISOString();
      reservationData.payment_method = 'free';
      reservationData.payment_status = 'not_required';
    }

    // Only attach ticket_id if it is a valid UUID
    if (
      typeof ticket_id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticket_id)
    ) {
      reservationData.ticket_id = ticket_id;
    }

    if (typeof ticket_tier === 'string' && ticket_tier.trim() !== '') {
      reservationData.ticket_tier = ticket_tier.trim();
    }

    // ── 8. Insert ───────────────────────────────────────────────────────────
    const supabaseAdmin = getSupabaseAdmin();
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (insertError) {
      // Postgres unique-violation error code = 23505
      // This catches the race-condition case where two concurrent requests
      // both passed the soft check but only one can win the DB insert.
      if (insertError.code === '23505') {
        void auditLog({ event_id: eventId, email, ip, userAgent, outcome: 'duplicate', detail: 'DB unique constraint (race condition)' });
        return NextResponse.json(
          {
            error:
              'This email address is already registered for this event. ' +
              'To reserve an additional spot, please use a different email address.',
          },
          { status: 409 }
        );
      }

      console.error('[Reservations] Insert error:', insertError);
      void auditLog({ event_id: eventId, email, ip, userAgent, outcome: 'error', detail: insertError.message });
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      );
    }

    // ── 8.5. Auto-generate Ticket for 'free' plans
    if (insertData && reservationData.payment_status === 'not_required') {
      try {
        const ticketsToCreate = [];
        const initials = name.substring(0, 2).toUpperCase().padEnd(2, 'X');
        for (let i = 0; i < qty; i++) {
          const ticketCode = generateTicketCode(initials);
          ticketsToCreate.push({
            reservation_id: insertData.id,
            event_id: eventId,
            status: 'unused',
            ticket_tier: reservationData.ticket_tier || null,
            ticket_code: ticketCode
          });
        }
        
        const supabaseAdmin = getSupabaseAdmin();
        const { data: issuedTickets, error: issueError } = await supabaseAdmin
          .from('issued_tickets')
          .insert(ticketsToCreate)
          .select('id, ticket_code');
          
        if (issueError) throw issueError;
        
        // Send email
        const resend = getResend();
        const ticketsHTML = issuedTickets.map(t => {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${t.ticket_code}`;
          return `
            <div style="margin-bottom: 24px; padding: 20px; border: 2px dashed #0018FF; border-radius: 12px; text-align: center;">
              <p style="font-size: 11px; color: #888; margin: 0 0 8px;">TICKET ID</p>
              <p style="font-size: 22px; font-weight: 900; letter-spacing: 2px; margin: 0 0 16px; color: #E11B22;">${t.ticket_code}</p>
              <img src="${qrUrl}" alt="QR Code" width="180" height="180" style="border-radius: 8px;" />
              <p style="font-size: 12px; color: #E11B22; margin: 12px 0 0; font-weight: bold;">Valable pour 1 personne. Ne pas partager.</p>
            </div>
          `;
        }).join('');

        await resend.emails.send({
          from: 'Ayibuzz Media <contact@ayibuzz-media.com>',
          to: email,
          subject: 'Votre Billet Confirmé pour Ayibuzz Media !',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #0018FF;">Réservation Confirmée !</h1>
              <p>Bonjour ${name},</p>
              <p>Votre place a été réservée avec succès pour l'événement.</p>
              <p>Voici vos billets officiels, assurez-vous de les avoir sur votre téléphone à l'entrée. Chaque code est valable pour une seule personne à la fois.</p>
              ${ticketsHTML}
              <p>L'équipe Ayibuzz Media</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Failed to auto-issue ticket or send email:', err);
      }
    }

    // ── 9. Log success ──────────────────────────────────────────────────────
    void auditLog({ event_id: eventId, email, ip, userAgent, outcome: 'success' });

    // ── 10. Update event/ticket counters (fire-and-forget) ─────────────────
    try {
      await supabase.rpc('increment_registered_count', {
        event_id_param: eventId,
        amount:         qty,
      });

      if (reservationData.ticket_id) {
        await supabase.rpc('increment_ticket_sold', {
          ticket_id_param: reservationData.ticket_id,
          amount:          qty,
        });
      }
    } catch (rpcErr) {
      console.error('[Reservations] Counter update failed (non-fatal):', rpcErr);
    }

    return NextResponse.json({ success: true, emailSent: false }, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Reservations] CRITICAL unexpected error:', message);
    return NextResponse.json(
      {
        error:   'An unexpected server error occurred. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}
