import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('dummy') || key === 'dummy_key' || key === 'dummy') {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return createClient(url || 'https://dummy.supabase.co', key || 'dummy_key');
    }
    throw new Error('CONFIG_ERROR: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing/invalid.');
  }
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Resend webhook format: { type: string, data: { email_id: string, ... } }
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
    // Optionally track clicks if you add a clicked_at column in the future
    updates.updated_at = new Date().toISOString();
  } else {
    // Ignore other types
    return NextResponse.json({ received: true });
  }

  // Update email_messages table
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
