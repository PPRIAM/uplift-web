import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/utils/supabase/admin';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const resend = getResend();
  try {
    const { reservation_id, action, rejection_reason } = await req.json();

    if (!reservation_id || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Get the reservation details
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*, events(name, date_time, location_name, city)')
      .eq('id', reservation_id)
      .single();

    if (fetchError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // 2. Generate unique tickets
      const ticketsToCreate = [];
      const initials = reservation.full_name.substring(0, 2).toUpperCase().padEnd(2, 'X');
      for (let i = 0; i < reservation.quantity; i++) {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const ticketCode = `UP-${initials}-${randomStr}`;
        ticketsToCreate.push({
          reservation_id: reservation.id,
          event_id: reservation.event_id,
          status: 'unused',
          ticket_tier: reservation.ticket_tier,
          ticket_code: ticketCode
        });
      }

      const { data: issuedTickets, error: issueError } = await supabase
        .from('issued_tickets')
        .insert(ticketsToCreate)
        .select('id, ticket_code');

      if (issueError) {
        throw new Error(`Failed to issue tickets: ${issueError.message}`);
      }

      // 3. Update reservation status
      await supabase
        .from('reservations')
        .update({ 
          status: 'confirmed', 
          payment_status: 'verified',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', reservation.id);

      // 4. Send Confirmation Email via Resend
      const ticketsHTML = issuedTickets.map(t => {
        // We use an external API to generate the QR Code for the custom ticket code
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
        to: reservation.email,
        subject: 'Paiement Confirmé - Votre billet est prêt !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #0018FF;">Paiement Confirmé !</h1>
            <p>Bonjour ${reservation.full_name},</p>
            <p>Nous avons reçu votre paiement pour <strong>${reservation.events.name}</strong> avec succès.</p>
            <p>Voici vos billets officiels, assurez-vous de les avoir sur votre téléphone à l'entrée. Chaque code est valable pour une seule personne à la fois.</p>
            ${ticketsHTML}
            <p>Date : ${new Date(reservation.events.date_time).toLocaleString()}</p>
            <p>Lieu : ${reservation.events.location_name}, ${reservation.events.city}</p>
            <p>Merci, l'équipe Ayibuzz Media</p>
          </div>
        `,
      });

      // 5. Cleanup Proof Storage (Fire-and-forget)
      if (reservation.payment_proof_url) {
        supabase.storage.from('payment_proofs').remove([reservation.payment_proof_url.split('/').pop()]).catch(console.error);
      }

      return NextResponse.json({ success: true });

    } else if (action === 'reject') {
      // Update status
      await supabase
        .from('reservations')
        .update({ 
          status: 'rejected', 
          payment_status: 'rejected',
          payment_rejection_reason: rejection_reason || 'Preuve invalide'
        })
        .eq('id', reservation.id);

      // Cleanup Proof Storage
      if (reservation.payment_proof_url) {
        supabase.storage.from('payment_proofs').remove([reservation.payment_proof_url.split('/').pop()]).catch(console.error);
      }

      await resend.emails.send({
        from: 'Ayibuzz Media <contact@ayibuzz-media.com>',
        to: reservation.email,
        subject: 'Problème avec votre paiement - Ayibuzz Media',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #E11B22;">Paiement Rejeté</h1>
            <p>Bonjour ${reservation.full_name},</p>
            <p>Malheureusement, nous n'avons pas pu vérifier la preuve de paiement que vous avez envoyée pour <strong>${reservation.events.name}</strong>.</p>
            <p>Raison : <strong>${rejection_reason || 'Preuve invalide ou montant incorrect'}</strong></p>
            <p>Veuillez soumettre à nouveau le formulaire avec une preuve valide ou contacter le support.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Reservation action error:', message);
    return NextResponse.json({ error: 'Une erreur serveur inattendue est survenue.' }, { status: 500 });
  }
}
