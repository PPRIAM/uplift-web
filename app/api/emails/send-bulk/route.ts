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
const resend = new Resend(process.env.RESEND_API_KEY);
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

// Personalization token replacement
const TOKEN_REGEX = /\{\{([^}]+)\}\}/g;
function replaceTokens(
  html: string,
  tokens: Record<string, string>
): string {
  return html.replace(TOKEN_REGEX, (match, key) => {
    return key in tokens ? (tokens[key] || '') : match;
  });
}

// Small delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── POST /api/emails/send-bulk — Bulk email send using Batch API ────────────
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    campaign_id,
    subject,
    html_body,
    from_email,
    from_name,
    event_id,
    recipients, // Array of { email: string, full_name: string, ...extra token data }
  } = body as {
    campaign_id?: string;
    subject?: string;
    html_body?: string;
    from_email?: string;
    from_name?: string;
    event_id?: string;
    recipients?: Array<{ email: string; full_name: string; [key: string]: string }>;
  };

  if (!subject?.trim() || !html_body?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
  }

  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ error: 'At least one recipient is required' }, { status: 400 });
  }

  const senderEmail = from_email || 'contact@ayibuzz-media.com';
  const senderName = from_name || 'Ayibuzz Media';

  // If campaign exists, update status to 'sending'
  if (campaign_id) {
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sending',
        started_at: new Date().toISOString(),
        total_recipients: recipients.length,
        sent_count: 0,
        failed_count: 0,
      })
      .eq('id', campaign_id);
  }

  let sentCount = 0;
  let failedCount = 0;
  const results: Array<{ email: string; success: boolean; error?: string; resend_id?: string }> = [];

  // Prepare all payloads
  const allPayloads = recipients.map(recipient => {
    const tokenData: Record<string, string> = {
      full_name: recipient.full_name || '',
      email: recipient.email || '',
      event_name: recipient.event_name || '',
      event_date: recipient.event_date || '',
      event_location: recipient.event_location || '',
      content: recipient.content || '',
      subject: subject,
      unique_code: recipient.unique_code || '',
      qr_code: recipient.qr_code || '',
      qr_code_url: recipient.qr_code_url || '',
    };

    const personalizedHtml = replaceTokens(html_body, tokenData);
    const personalizedSubject = replaceTokens(subject, tokenData);

    return {
      recipient,
      personalizedHtml,
      personalizedSubject,
      resendPayload: {
        from: `${senderName} <${senderEmail}>`,
        replyTo: senderEmail,
        to: [recipient.email],
        subject: personalizedSubject,
        html: personalizedHtml,
        text: stripHtml(personalizedHtml),
        headers: {
          'List-Unsubscribe': `<${APP_URL}/unsubscribe>, <mailto:contact@ayibuzz-media.com?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }
    };
  });

  // Resend Batch API allows up to 100 emails per request
  const BATCH_SIZE = 100;
  for (let i = 0; i < allPayloads.length; i += BATCH_SIZE) {
    const chunk = allPayloads.slice(i, i + BATCH_SIZE);
    const resendBatchPayload = chunk.map(p => p.resendPayload);
    const dbLogsToInsert: any[] = [];

    try {
      const batchResult = await resend.batch.send(resendBatchPayload);
      
      if (batchResult.error) {
        // Entire batch failed
        failedCount += chunk.length;
        chunk.forEach(p => {
          results.push({ email: p.recipient.email, success: false, error: batchResult.error?.message });
          dbLogsToInsert.push({
            direction: 'outbound', status: 'failed',
            from_email: senderEmail, from_name: senderName,
            to_emails: [p.recipient.email],
            subject: p.personalizedSubject, html_body: p.personalizedHtml,
            event_id: event_id || null, campaign_id: campaign_id || null,
            error_message: batchResult.error?.message,
          });
        });
      } else {
        // Process individual results
        // Resend batch result format: data.data is an array of objects { id: string }
        const returnedIds = (batchResult.data as any)?.data || batchResult.data || [];
        
        chunk.forEach((p, index) => {
          const resendResponse = returnedIds[index];
          const hasError = !resendResponse || resendResponse.error;
          const msgId = resendResponse?.id || null;

          if (hasError) {
            failedCount++;
            results.push({ email: p.recipient.email, success: false, error: resendResponse?.error?.message || 'Unknown batch error' });
            dbLogsToInsert.push({
              direction: 'outbound', status: 'failed',
              from_email: senderEmail, from_name: senderName,
              to_emails: [p.recipient.email],
              subject: p.personalizedSubject, html_body: p.personalizedHtml,
              event_id: event_id || null, campaign_id: campaign_id || null,
              error_message: resendResponse?.error?.message || 'Unknown batch error',
            });
          } else {
            sentCount++;
            results.push({ email: p.recipient.email, success: true, resend_id: msgId });
            dbLogsToInsert.push({
              direction: 'outbound', status: 'sent',
              from_email: senderEmail, from_name: senderName,
              to_emails: [p.recipient.email],
              subject: p.personalizedSubject, html_body: p.personalizedHtml,
              event_id: event_id || null, campaign_id: campaign_id || null,
              resend_id: msgId,
              sent_at: new Date().toISOString(),
            });
          }
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      failedCount += chunk.length;
      chunk.forEach(p => {
        results.push({ email: p.recipient.email, success: false, error: message });
        dbLogsToInsert.push({
          direction: 'outbound', status: 'failed',
          from_email: senderEmail, from_name: senderName,
          to_emails: [p.recipient.email],
          subject: p.personalizedSubject, html_body: p.personalizedHtml,
          event_id: event_id || null, campaign_id: campaign_id || null,
          error_message: message,
        });
      });
    }

    // Bulk insert logs to Supabase
    if (dbLogsToInsert.length > 0) {
      await supabase.from('email_messages').insert(dbLogsToInsert);
    }

    // Update campaign progress after each chunk
    if (campaign_id) {
      await supabase
        .from('email_campaigns')
        .update({ sent_count: sentCount, failed_count: failedCount })
        .eq('id', campaign_id);
    }

    // Small delay between batches to respect overall account rate limits (e.g. 10 req/sec)
    if (i + BATCH_SIZE < allPayloads.length) {
      await delay(500); 
    }
  }

  // Mark campaign as completed
  if (campaign_id) {
    await supabase
      .from('email_campaigns')
      .update({
        status: failedCount === recipients.length ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq('id', campaign_id);
  }

  return NextResponse.json({
    success: true,
    total: recipients.length,
    sent: sentCount,
    failed: failedCount,
    results,
  });
}
