import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/utils/supabase/admin';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Client Supabase centralisé
  const supabase = getSupabase();
  const { token } = await params;

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/confirmation?error=invalid`);
  }

  try {
    // Recherche de la réservation par jeton
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

    // Confirmer la réservation
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
