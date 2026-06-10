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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = getSupabase();
  const { token } = await params;

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/confirmation?error=invalid`);
  }

  try {
    // Find reservation by token
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('id, status, confirmed_at, full_name, event_id')
      .eq('confirmation_token', token)
      .single();

    if (error || !reservation) {
      return NextResponse.redirect(`${APP_URL}/confirmation?error=not_found`);
    }

    if (reservation.status === 'confirmed') {
      return NextResponse.redirect(`${APP_URL}/confirmation?status=already_confirmed&event=${reservation.event_id}`);
    }

    // Confirm the reservation
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', reservation.id);

    if (updateError) throw updateError;

    return NextResponse.redirect(
      `${APP_URL}/confirmation?status=confirmed&event=${reservation.event_id}&name=${encodeURIComponent(reservation.full_name)}`
    );

  } catch (err: any) {
    console.error('Confirm API error:', err);
    return NextResponse.redirect(`${APP_URL}/confirmation?error=server`);
  }
}
