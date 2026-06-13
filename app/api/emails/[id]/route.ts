import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/utils/supabase/admin';

// ─── GET /api/emails/[id] — Obtenir les détails d'un e-mail unique ──────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Client Supabase centralisé
  const supabase = getSupabase();
  const { id } = await params;

  const { data, error } = await supabase
    .from('email_messages')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 });
  }

  return NextResponse.json({ email: data });
}

// ─── PATCH /api/emails/[id] — Mettre à jour un brouillon d'e-mail ─────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Autoriser uniquement la mise à jour de certains champs
  const allowedFields = [
    'subject', 'html_body', 'plain_body', 'to_emails',
    'from_email', 'from_name', 'event_id', 'scheduled_at',
    'status', 'metadata',
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowedFields) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  const { data, error } = await supabase
    .from('email_messages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ email: data });
}

// ─── DELETE /api/emails/[id] — Supprimer un e-mail ──────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  const { error } = await supabase
    .from('email_messages')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
