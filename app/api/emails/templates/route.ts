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

// ─── GET /api/emails/templates — List all templates ──────────────────────────
export async function GET(req: NextRequest) {
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

// ─── POST /api/emails/templates — Create template ────────────────────────────
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
