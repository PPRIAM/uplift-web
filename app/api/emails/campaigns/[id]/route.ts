import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/utils/supabase/admin';

// ─── GET /api/emails/campaigns/[id] — Obtenir les détails d'une campagne ───────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Client Supabase centralisé
  const supabase = getSupabase();
  const { id } = await params;
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*, events(name)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Récupérer également les journaux d'envoi associés
  const { data: emails } = await supabase
    .from('email_messages')
    .select('id, to_emails, status, resend_id, sent_at, error_message')
    .eq('campaign_id', id)
    .order('sent_at', { ascending: false });

  return NextResponse.json({ campaign: data, emails: emails || [] });
}

// ─── PATCH /api/emails/campaigns/[id] — Mettre à jour une campagne ───────────────────────────
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

  const allowedFields = [
    'name', 'description', 'event_id', 'template_id',
    'subject', 'html_body', 'status', 'recipient_filter',
    'scheduled_at', 'total_recipients', 'sent_count', 'failed_count',
    'target_audience', 'content_data'
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from('email_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign: data });
}

// ─── DELETE /api/emails/campaigns/[id] — Supprimer une campagne ──────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;
  const { error } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
