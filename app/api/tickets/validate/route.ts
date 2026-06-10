import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes('dummy') || key === 'dummy_key' || key === 'dummy') {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return createClient(url || 'https://dummy.supabase.co', key || 'dummy_key');
    }
    throw new Error('CONFIG_ERROR: SUPABASE_SERVICE_ROLE_KEY is missing. Ticket validation requires this key.');
  }
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  try {
    const { ticket_id } = await req.json();

    if (!ticket_id || typeof ticket_id !== 'string') {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Lookup the ticket by personalized code
    const { data: ticket, error: ticketError } = await supabase
      .from('issued_tickets')
      .select('*, reservations(full_name, email, events(name))')
      .eq('ticket_code', ticket_id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Billet introuvable (Invalide)' }, { status: 404 });
    }

    if (ticket.status === 'used') {
      return NextResponse.json({ 
        error: 'Ce billet a déjà été utilisé !',
        details: ticket
      }, { status: 409 });
    }

    // Validate the ticket
    const { error: updateError } = await supabase
      .from('issued_tickets')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('id', ticket.id);

    if (updateError) {
      throw new Error(`Failed to update ticket: ${updateError.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Billet validé avec succès !',
      details: ticket
    });

  } catch (error: any) {
    console.error('Ticket validation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
