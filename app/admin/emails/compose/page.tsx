'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Send, Save, Clock, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, Link2, Image, Type, List, ListOrdered,
  Code, EyeOff, ChevronDown, Users, Calendar, LayoutTemplate,
  Loader2, CheckCircle, AlertCircle, X, Sparkles, Hash,
  Search, Check, UserCheck, UserX,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { formatDateShort } from '@/lib/dateUtils';

type EventInfo = {
  id: string;
  name: string;
  date_time: string;
  location_name: string;
  city: string;
};

type Recipient = {
  email: string;
  full_name: string;
  event_name?: string;
  event_date?: string;
  event_location?: string;
  unique_code?: string;
  qr_code?: string;
  qr_code_url?: string;
  selected: boolean;
};

type Template = {
  id: string;
  name: string;
  description: string;
  subject: string;
  html_body: string;
  category: string;
  tokens: string[];
};

const PERSONALIZATION_TOKENS = [
  { key: 'full_name', label: 'Nom complet', icon: Users },
  { key: 'event_name', label: 'Nom événement', icon: Calendar },
  { key: 'event_date', label: 'Date événement', icon: Clock },
  { key: 'event_location', label: 'Lieu événement', icon: Hash },
  { key: 'unique_code', label: 'Code unique', icon: Code },
  { key: 'qr_code', label: 'Code QR', icon: Image },
  { key: 'qr_code_url', label: 'URL Code QR', icon: Link2 },
];

export default function ComposeEmailPage() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

  // ─── CORE STATE ──────────────────────────────────────────────────────────────
  // Single source of truth for editor HTML content.
  // Updated on every keystroke (visual mode) or textarea change (HTML mode).
  const [editorContent, setEditorContent] = useState('');
  const [showHtml, setShowHtml] = useState(false);
  const [subject, setSubject] = useState('');

  // ─── RECIPIENTS ──────────────────────────────────────────────────────────────
  const [availableRecipients, setAvailableRecipients] = useState<Recipient[]>([]);
  const [manualEmail, setManualEmail] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');

  // ─── EVENTS, TEMPLATES, SCHEDULE ─────────────────────────────────────────────
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  // ─── SENDING ─────────────────────────────────────────────────────────────────
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTokenMenu, setShowTokenMenu] = useState(false);

  // ─── DERIVED ─────────────────────────────────────────────────────────────────
  const selectedRecipients = availableRecipients.filter(r => r.selected);
  const filteredRecipients = availableRecipients.filter(r => {
    if (!recipientSearch) return true;
    const q = recipientSearch.toLowerCase();
    return r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('events')
      .select('id, name, date_time, location_name, city')
      .eq('published', true)
      .order('date_time', { ascending: false })
      .then(({ data }) => setEvents(data || []));
  }, []);

  useEffect(() => {
    fetch('/api/emails/templates')
      .then(r => r.json())
      .then(d => setTemplates(d.templates || []))
      .catch(() => {});
  }, []);

  // Load recipients when event/filter changes
  const loadRecipientsFromEvent = useCallback(async (eventId: string) => {
    if (!eventId) return;
    const supabase = createClient();
    let query = supabase
      .from('reservations')
      .select('id, full_name, email, issued_tickets(ticket_code)')
      .eq('event_id', eventId);

    if (recipientFilter !== 'all') {
      query = query.eq('status', recipientFilter);
    }

    const { data } = await query;
    const event = events.find(e => e.id === eventId);

    setAvailableRecipients(
      (data || []).map((r: any) => {
        const ticketCode = r.issued_tickets?.[0]?.ticket_code || '';
        const qrUrl = ticketCode ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketCode}` : '';
        return {
          email: r.email,
          full_name: r.full_name,
          event_name: event?.name || '',
          event_date: event ? formatDateShort(event.date_time) : '',
          event_location: event ? `${event.location_name}${event.city ? `, ${event.city}` : ''}` : '',
          unique_code: ticketCode,
          qr_code: qrUrl ? `<img src="${qrUrl}" alt="QR Code" width="180" height="180" style="border-radius: 8px;" />` : '',
          qr_code_url: qrUrl,
          selected: true, // default: select all
        };
      })
    );
  }, [recipientFilter, events]);

  useEffect(() => {
    if (selectedEventId) loadRecipientsFromEvent(selectedEventId);
  }, [selectedEventId, recipientFilter, loadRecipientsFromEvent]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // HTML TOGGLE — using a single `editorContent` state as source of truth
  // ═══════════════════════════════════════════════════════════════════════════════

  // When switching FROM HTML → visual, restore the editorContent into the div
  useEffect(() => {
    if (!showHtml && editorRef.current) {
      editorRef.current.innerHTML = editorContent;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHtml]);

  const toggleHtmlView = () => {
    if (!showHtml) {
      // visual → HTML: sync content from div
      setEditorContent(editorRef.current?.innerHTML || '');
    }
    // HTML → visual: the useEffect above handles restoring
    setShowHtml(!showHtml);
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // RECIPIENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  const toggleRecipient = (email: string) => {
    setAvailableRecipients(prev =>
      prev.map(r => r.email === email ? { ...r, selected: !r.selected } : r)
    );
  };

  const selectAll = () => {
    setAvailableRecipients(prev => prev.map(r => ({ ...r, selected: true })));
  };

  const deselectAll = () => {
    setAvailableRecipients(prev => prev.map(r => ({ ...r, selected: false })));
  };

  const addManualRecipient = () => {
    const email = manualEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (availableRecipients.some(r => r.email === email)) return;
    setAvailableRecipients(prev => [
      ...prev,
      { email, full_name: email.split('@')[0], selected: true },
    ]);
    setManualEmail('');
  };

  const removeRecipient = (email: string) => {
    setAvailableRecipients(prev => prev.filter(r => r.email !== email));
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // EDITOR COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════════

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertToken = (tokenKey: string) => {
    const tokenText = `{{${tokenKey}}}`;
    if (showHtml) {
      setEditorContent(prev => prev + tokenText);
    } else {
      // Focus the editor, then insert the token as a styled span
      editorRef.current?.focus();
      const span = document.createElement('span');
      span.style.cssText = 'background:rgba(45,91,255,0.1);color:var(--brand-secondary);padding:1px 6px;border-radius:4px;font-size:12px;font-weight:600;font-family:monospace;';
      span.contentEditable = 'false';
      span.setAttribute('data-token', tokenKey);
      span.textContent = tokenText;

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
        // Move cursor after the token
        range.setStartAfter(span);
        range.setEndAfter(span);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      // Sync state
      if (editorRef.current) {
        setEditorContent(editorRef.current.innerHTML);
      }
    }
    setShowTokenMenu(false);
  };

  const applyTemplate = (template: Template) => {
    setSubject(template.subject);
    setEditorContent(template.html_body);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.html_body;
    }
    setShowTemplates(false);
  };

  // Get the final HTML — normalize token spans back to {{...}} syntax
  const getFinalHtml = (): string => {
    let html = showHtml ? editorContent : (editorRef.current?.innerHTML || editorContent);
    // Replace styled token spans with plain {{token}} text
    html = html.replace(/<span[^>]*data-token="([^"]*)"[^>]*>[^<]*<\/span>/g, '{{$1}}');
    return html;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEND / SAVE — always use bulk endpoint with token replacement
  // ═══════════════════════════════════════════════════════════════════════════════

  const saveDraft = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          html_body: getFinalHtml(),
          to_emails: selectedRecipients.map(r => r.email),
          event_id: selectedEventId || undefined,
          scheduled_at: scheduledAt || undefined,
          send_now: false,
        }),
      });
      if (res.ok) {
        setSendResult({ success: true, message: 'Brouillon sauvegardé' });
        setTimeout(() => router.push('/admin/emails'), 1500);
      } else {
        const data = await res.json();
        setSendResult({ success: false, message: data.error || 'Erreur de sauvegarde' });
      }
    } catch {
      setSendResult({ success: false, message: 'Erreur réseau' });
    }
    setSaving(false);
  };

  const sendEmail = async () => {
    if (selectedRecipients.length === 0) {
      setSendResult({ success: false, message: 'Sélectionnez au moins un destinataire' });
      return;
    }
    if (!subject.trim()) {
      setSendResult({ success: false, message: 'Le sujet est requis' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      // Always use bulk endpoint so tokens ALWAYS get replaced
      const res = await fetch('/api/emails/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          html_body: getFinalHtml(),
          event_id: selectedEventId || undefined,
          recipients: selectedRecipients.map(r => ({
            email: r.email,
            full_name: r.full_name,
            event_name: r.event_name || '',
            event_date: r.event_date || '',
            event_location: r.event_location || '',
            unique_code: r.unique_code || '',
            qr_code: r.qr_code || '',
            qr_code_url: r.qr_code_url || '',
          })),
          delay_ms: 200,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({
          success: true,
          message: `${data.sent}/${data.total} email${data.sent > 1 ? 's' : ''} envoyé${data.sent > 1 ? 's' : ''}${data.failed > 0 ? ` (${data.failed} échoué${data.failed > 1 ? 's' : ''})` : ''} ✓`,
        });
        setTimeout(() => router.push('/admin/emails'), 2500);
      } else {
        setSendResult({ success: false, message: data.error || "Échec de l'envoi" });
      }
    } catch {
      setSendResult({ success: false, message: 'Erreur réseau' });
    }
    setSending(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* ─── HEADER ────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/emails"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display" style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Nouveau message
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {selectedRecipients.length > 0
                ? `${selectedRecipients.length} destinataire${selectedRecipients.length > 1 ? 's' : ''} sélectionné${selectedRecipients.length > 1 ? 's' : ''}`
                : 'Aucun destinataire'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={saveDraft} disabled={saving || sending} className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Brouillon
          </button>
          <button onClick={sendEmail} disabled={sending || saving} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 20px' }}>
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </div>

      {/* ─── TOAST ─────────────────────────────────────────────────────────────── */}
      {sendResult && (
        <div style={{
          padding: '12px 18px', borderRadius: '12px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          background: sendResult.success ? 'rgba(21,128,61,0.1)' : 'rgba(220,38,38,0.1)',
          border: `1px solid ${sendResult.success ? 'rgba(21,128,61,0.3)' : 'rgba(220,38,38,0.3)'}`,
          color: sendResult.success ? 'var(--brand-success)' : 'var(--brand-danger)',
          fontSize: '13px', fontWeight: '600', animation: 'fadeInUp 0.3s ease',
        }}>
          {sendResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {sendResult.message}
          <button onClick={() => setSendResult(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* ─── RECIPIENTS BAR ──────────────────────────────────────────────────── */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', minWidth: '30px' }}>À :</span>

            {/* Selected recipient chips */}
            {selectedRecipients.slice(0, 5).map(r => (
              <span key={r.email} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '6px', fontSize: '12px',
                background: 'rgba(45,91,255,0.08)', color: 'var(--brand-secondary)', fontWeight: '500',
              }}>
                {r.full_name}
                <button onClick={() => toggleRecipient(r.email)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0 2px', display: 'flex' }}>
                  <X size={10} />
                </button>
              </span>
            ))}
            {selectedRecipients.length > 5 && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                +{selectedRecipients.length - 5} autres
              </span>
            )}

            <button onClick={() => setShowRecipientPicker(!showRecipientPicker)} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 12px', borderRadius: '8px', border: '1px dashed var(--border-default)',
              background: 'transparent', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)',
              fontWeight: '600', transition: 'all 0.2s',
            }}>
              <Users size={12} /> Ajouter
              <ChevronDown size={10} style={{ transform: showRecipientPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>

          {/* ─── RECIPIENT PICKER PANEL ──────────────────────────────────────── */}
          {showRecipientPicker && (
            <div style={{ marginTop: '12px', padding: '14px', background: 'var(--bg-elevated)', borderRadius: '12px', animation: 'fadeInUp 0.2s ease' }}>
              {/* Event + Status selectors */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                    Charger depuis un événement
                  </label>
                  <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
                    className="input-field" style={{ padding: '8px 12px', fontSize: '13px' }}>
                    <option value="">-- Sélectionner --</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ minWidth: '140px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                    Statut
                  </label>
                  <select value={recipientFilter} onChange={e => setRecipientFilter(e.target.value as 'all' | 'confirmed' | 'pending')}
                    className="input-field" style={{ padding: '8px 12px', fontSize: '13px' }}>
                    <option value="all">Tous</option>
                    <option value="confirmed">Confirmés</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>

              {/* Manual email entry */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input type="email" placeholder="email@example.com" value={manualEmail}
                  onChange={e => setManualEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addManualRecipient(); }}
                  className="input-field" style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                />
                <button onClick={addManualRecipient} className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700' }}>
                  Ajouter
                </button>
              </div>

              {/* ─── INDIVIDUAL RECIPIENT LIST ──────────────────────────────────── */}
              {availableRecipients.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  {/* Search + Bulk actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" placeholder="Rechercher un participant..."
                        value={recipientSearch} onChange={e => setRecipientSearch(e.target.value)}
                        className="input-field" style={{ paddingLeft: '32px', padding: '6px 10px 6px 32px', fontSize: '12px' }}
                      />
                    </div>
                    <button onClick={selectAll} title="Tout sélectionner" style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
                      borderRadius: '6px', border: 'none', background: 'rgba(21,128,61,0.1)',
                      color: 'var(--brand-success)', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                    }}>
                      <UserCheck size={12} /> Tous
                    </button>
                    <button onClick={deselectAll} title="Tout désélectionner" style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
                      borderRadius: '6px', border: 'none', background: 'rgba(220,38,38,0.08)',
                      color: 'var(--brand-danger)', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                    }}>
                      <UserX size={12} /> Aucun
                    </button>
                  </div>

                  {/* Recipient count summary */}
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {selectedRecipients.length} / {availableRecipients.length} sélectionnés
                  </p>

                  {/* Scrollable recipient list */}
                  <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {filteredRecipients.map(r => (
                      <label
                        key={r.email}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                          background: r.selected ? 'rgba(45,91,255,0.04)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!r.selected) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                        onMouseLeave={e => { if (!r.selected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Checkbox */}
                        <div
                          onClick={(e) => { e.preventDefault(); toggleRecipient(r.email); }}
                          style={{
                            width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                            border: r.selected ? 'none' : '2px solid var(--border-default)',
                            background: r.selected ? 'var(--brand-primary)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s', cursor: 'pointer',
                          }}
                        >
                          {r.selected && <Check size={12} color="white" strokeWidth={3} />}
                        </div>

                        {/* Name + Email */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.full_name}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.email}
                          </p>
                        </div>

                        {/* Remove button */}
                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); removeRecipient(r.email); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.4, padding: '4px', display: 'flex' }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--brand-danger)'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <X size={12} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── SUBJECT ─────────────────────────────────────────────────────────── */}
        <div style={{ padding: '0 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', minWidth: '60px' }}>Sujet :</span>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Objet de votre email..."
              style={{
                flex: 1, border: 'none', outline: 'none', padding: '14px 0',
                fontSize: '14px', fontWeight: '500', background: 'transparent',
                color: 'var(--text-primary)', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* ─── TOOLBAR ─────────────────────────────────────────────────────────── */}
        <div style={{
          padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
          background: 'var(--bg-elevated)',
        }}>
          <ToolbarButton icon={Bold} title="Gras" onClick={() => execCommand('bold')} />
          <ToolbarButton icon={Italic} title="Italique" onClick={() => execCommand('italic')} />
          <ToolbarButton icon={Underline} title="Souligné" onClick={() => execCommand('underline')} />
          <ToolbarDivider />
          <ToolbarButton icon={Type} title="Titre" onClick={() => execCommand('formatBlock', 'h2')} />
          <ToolbarButton icon={List} title="Liste" onClick={() => execCommand('insertUnorderedList')} />
          <ToolbarButton icon={ListOrdered} title="Liste numérotée" onClick={() => execCommand('insertOrderedList')} />
          <ToolbarDivider />
          <ToolbarButton icon={AlignLeft} title="Gauche" onClick={() => execCommand('justifyLeft')} />
          <ToolbarButton icon={AlignCenter} title="Centrer" onClick={() => execCommand('justifyCenter')} />
          <ToolbarButton icon={AlignRight} title="Droite" onClick={() => execCommand('justifyRight')} />
          <ToolbarDivider />
          <ToolbarButton icon={Link2} title="Lien" onClick={() => { const url = prompt('URL du lien :'); if (url) execCommand('createLink', url); }} />
          <ToolbarButton icon={Image} title="Image" onClick={() => { const url = prompt("URL de l'image :"); if (url) execCommand('insertImage', url); }} />
          <ToolbarDivider />

          {/* Personalization tokens dropdown */}
          <div style={{ position: 'relative' }}>
            <ToolbarButton icon={Sparkles} title="Jeton de personnalisation" onClick={() => setShowTokenMenu(!showTokenMenu)} active={showTokenMenu} />
            {showTokenMenu && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, zIndex: 50,
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: '10px', padding: '6px', minWidth: '220px',
                boxShadow: 'var(--shadow-md)', animation: 'fadeInUp 0.15s ease',
              }}>
                <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px 6px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                  Insérer un jeton
                </p>
                {PERSONALIZATION_TOKENS.map(t => (
                  <button key={t.key} onClick={() => insertToken(t.key)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '8px 12px', borderRadius: '8px', border: 'none',
                    background: 'transparent', cursor: 'pointer', fontSize: '12px',
                    color: 'var(--text-secondary)', transition: 'all 0.15s', textAlign: 'left',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <t.icon size={13} />
                    <span style={{ flex: 1 }}>{t.label}</span>
                    <code style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      {`{{${t.key}}}`}
                    </code>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Template selector */}
          <div style={{ position: 'relative' }}>
            <ToolbarButton icon={LayoutTemplate} title="Modèle" onClick={() => setShowTemplates(!showTemplates)} active={showTemplates} />
            {showTemplates && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, zIndex: 50,
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: '10px', padding: '6px', minWidth: '260px',
                boxShadow: 'var(--shadow-md)', animation: 'fadeInUp 0.15s ease',
                maxHeight: '300px', overflowY: 'auto',
              }}>
                <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', marginBottom: '4px' }}>
                  Modèles disponibles
                </p>
                {templates.length === 0 ? (
                  <p style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Aucun modèle</p>
                ) : templates.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)} style={{
                    display: 'flex', flexDirection: 'column', gap: '2px', width: '100%',
                    padding: '10px 12px', borderRadius: '8px', border: 'none',
                    background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{t.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'auto' }} />

          {/* Schedule */}
          <div style={{ position: 'relative' }}>
            <ToolbarButton icon={Clock} title="Planifier" onClick={() => setShowSchedule(!showSchedule)} active={showSchedule || !!scheduledAt} />
            {showSchedule && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, zIndex: 50,
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: '10px', padding: '14px', minWidth: '260px',
                boxShadow: 'var(--shadow-md)', animation: 'fadeInUp 0.15s ease',
              }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Planifier l&apos;envoi
                </p>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  className="input-field" style={{ padding: '8px 12px', fontSize: '13px' }} />
                {scheduledAt && (
                  <button onClick={() => { setScheduledAt(''); setShowSchedule(false); }}
                    style={{ marginTop: '8px', fontSize: '12px', color: 'var(--brand-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Supprimer la planification
                  </button>
                )}
              </div>
            )}
          </div>

          {/* HTML toggle */}
          <ToolbarButton
            icon={showHtml ? EyeOff : Code}
            title={showHtml ? 'Éditeur visuel' : 'Code HTML'}
            onClick={toggleHtmlView}
            active={showHtml}
          />
        </div>

        {/* ─── EDITOR ──────────────────────────────────────────────────────────── */}
        {showHtml ? (
          <textarea
            value={editorContent}
            onChange={e => setEditorContent(e.target.value)}
            style={{
              width: '100%', minHeight: '400px', padding: '20px',
              border: 'none', outline: 'none', resize: 'vertical',
              fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6',
              background: 'var(--code-bg)', color: 'var(--code-text)',
            }}
            spellCheck={false}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
              if (editorRef.current) {
                setEditorContent(editorRef.current.innerHTML);
              }
            }}
            style={{
              minHeight: '400px', padding: '24px', outline: 'none',
              fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)',
              fontFamily: "'Segoe UI', Arial, sans-serif",
            }}
            data-placeholder="Rédigez votre email ici..."
          />
        )}
      </div>

      {/* Back link */}
      <div style={{ marginTop: '20px' }}>
        <Link href="/admin/emails" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>
          ← Retour à la messagerie
        </Link>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// Toolbar sub-components
// ═══════════════════════════════════════════════════════════════════════════════════

function ToolbarButton({ icon: Icon, title, onClick, active }: {
  icon: typeof Bold; title: string; onClick: () => void; active?: boolean;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '32px', height: '32px', borderRadius: '7px',
      border: 'none', cursor: 'pointer',
      background: active ? 'rgba(45,91,255,0.12)' : 'transparent',
      color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={15} />
    </button>
  );
}

function ToolbarDivider() {
  return <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />;
}
