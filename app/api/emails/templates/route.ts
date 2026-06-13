import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/utils/supabase/admin';

// ─── GET /api/emails/templates — Lister tous les modèles d'e-mail ──────────────────────────
export async function GET(req: NextRequest) {
  // Client Supabase centralisé
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let query = supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates: data || [] });
}

// ─── POST /api/emails/templates — Créer un modèle d'e-mail ────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, description, subject, html_body, category, tokens } = body as {
    name?: string;
    description?: string;
    subject?: string;
    html_body?: string;
    category?: string;
    tokens?: string[];
  };

  if (!name?.trim() || !html_body?.trim()) {
    return NextResponse.json({ error: 'Name and HTML body are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      name: name.trim(),
      description: description || '',
      subject: subject || '',
      html_body,
      category: category || 'general',
      tokens: tokens || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data }, { status: 201 });
}
