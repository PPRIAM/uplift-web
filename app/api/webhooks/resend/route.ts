import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  // Client Supabase centralisé
  const supabase = getSupabase();
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Format du webhook Resend : { type: string, data: { email_id: string, ... } }
  const { type, data } = payload;

  if (!type || !data || !data.email_id) {
    return NextResponse.json({ error: 'Missing required webhook fields' }, { status: 400 });
  }

  const resendId = data.email_id;
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };

  if (type === 'email.delivered') {
    updates.status = 'delivered';
  } else if (type === 'email.bounced' || type === 'email.complained') {
    updates.status = 'bounced';
    updates.error_message = data.reason || 'Bounced/Complained';
  } else if (type === 'email.opened') {
    updates.opened_at = new Date().toISOString();
  } else if (type === 'email.clicked') {
    // Optionnellement suivre les clics si vous ajoutez une colonne clicked_at à l'avenir
    updates.updated_at = new Date().toISOString();
  } else {
    // Ignorer les autres types
    return NextResponse.json({ received: true });
  }

  // Mettre à jour la table email_messages
  const { error } = await supabase
    .from('email_messages')
    .update(updates)
    .eq('resend_id', resendId);

  if (error) {
    console.error('Webhook DB update error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, type, id: resendId });
}
