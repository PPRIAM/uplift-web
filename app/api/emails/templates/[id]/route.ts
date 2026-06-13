import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/utils/supabase/admin';

// ─── GET /api/emails/templates/[id] — Obtenir les détails d'un modèle d'e-mail ────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Client Supabase centralisé
  const supabase = getSupabase();
  const { id } = await params;
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json({ template: data });
}

// ─── PATCH /api/emails/templates/[id] — Mettre à jour un modèle d'e-mail ───────────────────────
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

  const allowedFields = ['name', 'description', 'subject', 'html_body', 'category', 'tokens', 'is_default'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}

// ─── DELETE /api/emails/templates/[id] — Supprimer un modèle d'e-mail ──────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
