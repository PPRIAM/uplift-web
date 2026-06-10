import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Strip HTML tags to generate a plain-text fallback
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── GET /api/emails — List emails with pagination & filtering ────────────────
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const direction = searchParams.get('direction') || 'outbound';
  const status = searchParams.get('status');
  const campaignId = searchParams.get('campaign_id');
  const eventId = searchParams.get('event_id');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('email_messages')
    .select('*', { count: 'exact' })
    .eq('direction', direction)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') query = query.eq('status', status);
  if (campaignId) query = query.eq('campaign_id', campaignId);
  if (eventId) query = query.eq('event_id', eventId);
  if (search) query = query.or(`subject.ilike.%${search}%,to_emails.cs.{${search}}`);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    emails: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// ─── POST /api/emails — Create email (draft) or send immediately ──────────────
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    subject,
    html_body,
    plain_body,
    to_emails,
    from_email,
    from_name,
    event_id,
    campaign_id,
    scheduled_at,
    send_now,
    metadata,
  } = body as {
    subject?: string;
    html_body?: string;
    plain_body?: string;
    to_emails?: string[];
    from_email?: string;
    from_name?: string;
    event_id?: string;
    campaign_id?: string;
    scheduled_at?: string;
    send_now?: boolean;
    metadata?: Record<string, unknown>;
  };

  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
  }

  if (!html_body?.trim()) {
    return NextResponse.json({ error: 'Email body is required' }, { status: 400 });
  }

  const emailData: Record<string, unknown> = {
    direction: 'outbound',
    status: send_now ? 'queued' : 'draft',
    subject: subject.trim(),
    html_body,
    plain_body: plain_body || '',
    to_emails: to_emails || [],
    from_email: from_email || 'contact@ayibuzz-media.com',
    from_name: from_name || 'Ayibuzz Media',
    event_id: event_id || null,
    campaign_id: campaign_id || null,
    scheduled_at: scheduled_at || null,
    metadata: metadata || {},
  };

  // Insert into database
  const { data: inserted, error: insertError } = await supabase
    .from('email_messages')
    .insert(emailData)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Send immediately if requested
  if (send_now && to_emails && to_emails.length > 0) {
    const resend = getResend();
    try {
      const { data: resendData, error: resendError } = await resend.emails.send({
        from: `${emailData.from_name} <${emailData.from_email}>`,
        replyTo: String(emailData.from_email),
        to: to_emails,
        subject: subject.trim(),
        html: html_body,
        text: stripHtml(html_body),
        headers: {
          'List-Unsubscribe': `<${APP_URL}/unsubscribe>, <mailto:contact@ayibuzz-media.com?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      if (resendError) {
        await supabase
          .from('email_messages')
          .update({ status: 'failed', error_message: resendError.message })
          .eq('id', inserted.id);

        return NextResponse.json({
          email: inserted,
          sent: false,
          error: resendError.message,
        }, { status: 207 });
      }

      await supabase
        .from('email_messages')
        .update({
          status: 'sent',
          resend_id: resendData?.id,
          sent_at: new Date().toISOString(),
        })
        .eq('id', inserted.id);

      return NextResponse.json({
        email: { ...inserted, status: 'sent', resend_id: resendData?.id },
        sent: true,
      }, { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase
        .from('email_messages')
        .update({ status: 'failed', error_message: message })
        .eq('id', inserted.id);

      return NextResponse.json({ email: inserted, sent: false, error: message }, { status: 207 });
    }
  }

  return NextResponse.json({ email: inserted, sent: false }, { status: 201 });
}
