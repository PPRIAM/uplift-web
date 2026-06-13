import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/utils/supabase/admin';

// ─── GET /api/emails/campaigns — Lister toutes les campagnes ─────────────────────────
export async function GET(req: NextRequest) {
  // Client Supabase centralisé
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const eventId = searchParams.get('event_id');

  let query = supabase
    .from('email_campaigns')
    .select('*, events(name)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);
  if (eventId) query = query.eq('event_id', eventId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data || [] });
}

// ─── POST /api/emails/campaigns — Créer une campagne ───────────────────────────
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    name, description, event_id, template_id,
    subject, html_body, recipient_filter, scheduled_at,
    target_audience, content_data,
  } = body as {
    name?: string;
    description?: string;
    event_id?: string;
    template_id?: string;
    subject?: string;
    html_body?: string;
    recipient_filter?: Record<string, unknown>;
    scheduled_at?: string;
    target_audience?: string;
    content_data?: Record<string, unknown>;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('email_campaigns')
    .insert({
      name: name.trim(),
      description: description || '',
      event_id: event_id || null,
      template_id: template_id || null,
      subject: subject || '',
      html_body: html_body || '',
      recipient_filter: recipient_filter || {},
      target_audience: target_audience || 'all',
      content_data: content_data || {},
      scheduled_at: scheduled_at || null,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign: data }, { status: 201 });
}
