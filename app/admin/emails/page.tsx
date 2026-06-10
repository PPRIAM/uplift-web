'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Mail, Send, FileText, Megaphone, LayoutTemplate, Search,
  Plus, RefreshCw, Trash2, CheckCircle, Clock, AlertCircle,
  ChevronRight, Eye, ArrowLeft, X, Inbox
} from 'lucide-react';
import { formatDateShort } from '@/lib/dateUtils';

type EmailMessage = {
  id: string;
  direction: string;
  status: string;
  from_email: string;
  from_name: string;
  to_emails: string[];
  subject: string;
  html_body: string;
  event_id: string | null;
  campaign_id: string | null;
  resend_id: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
};

type Folder = 'sent' | 'drafts' | 'campaigns' | 'templates';

const folders: { key: Folder; label: string; icon: typeof Mail }[] = [
  { key: 'sent', label: 'Envoyés', icon: Send },
  { key: 'drafts', label: 'Brouillons', icon: FileText },
  { key: 'campaigns', label: 'Campagnes', icon: Megaphone },
  { key: 'templates', label: 'Modèles', icon: LayoutTemplate },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  sent: { label: 'Envoyé', color: 'var(--brand-success)', bg: 'rgba(21,128,61,0.12)', icon: CheckCircle },
  delivered: { label: 'Livré', color: 'var(--brand-success)', bg: 'rgba(21,128,61,0.12)', icon: CheckCircle },
  draft: { label: 'Brouillon', color: 'var(--brand-warning)', bg: 'rgba(180,83,9,0.12)', icon: FileText },
  queued: { label: 'En file', color: 'var(--brand-primary)', bg: 'rgba(45,91,255,0.12)', icon: Clock },
  failed: { label: 'Échoué', color: 'var(--brand-danger)', bg: 'rgba(220,38,38,0.12)', icon: AlertCircle },
};

export default function AdminEmailsPage() {
  const [activeFolder, setActiveFolder] = useState<Folder>('sent');
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({ sent: 0, drafts: 0 });

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setSelectedEmail(null);

    if (activeFolder === 'campaigns' || activeFolder === 'templates') {
      setEmails([]);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ direction: 'outbound' });
    if (activeFolder === 'sent') params.set('status', 'sent');
    if (activeFolder === 'drafts') params.set('status', 'draft');
    if (search) params.set('search', search);

    try {
      const res = await fetch(`/api/emails?${params.toString()}`);
      const data = await res.json();
      setEmails(data.emails || []);

      // Count stats
      if (activeFolder === 'sent') setStats(prev => ({ ...prev, sent: data.total || 0 }));
      if (activeFolder === 'drafts') setStats(prev => ({ ...prev, drafts: data.total || 0 }));
    } catch {
      setEmails([]);
    }
    setLoading(false);
  }, [activeFolder, search]);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Supprimer cet email ?')) return;
    setDeleteLoading(id);
    try {
      await fetch(`/api/emails/${id}`, { method: 'DELETE' });
      setEmails(prev => prev.filter(e => e.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
    } catch { /* silent */ }
    setDeleteLoading(null);
  };

  // Redirect to sub-pages for campaigns and templates
  if (activeFolder === 'campaigns') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <MailboxHeader />
        <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 200px)' }}>
          <FolderSidebar activeFolder={activeFolder} setActiveFolder={setActiveFolder} stats={stats} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <Megaphone size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Gérez vos campagnes email</p>
            <Link href="/admin/emails/campaigns" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <Megaphone size={16} /> Gérer les campagnes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (activeFolder === 'templates') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <MailboxHeader />
        <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 200px)' }}>
          <FolderSidebar activeFolder={activeFolder} setActiveFolder={setActiveFolder} stats={stats} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <LayoutTemplate size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Gérez vos modèles d'email</p>
            <Link href="/admin/emails/templates" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <LayoutTemplate size={16} /> Gérer les modèles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <MailboxHeader />

      <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 200px)' }}>
        {/* Folder Sidebar */}
        <FolderSidebar activeFolder={activeFolder} setActiveFolder={setActiveFolder} stats={stats} />

        {/* Email List */}
        <div style={{ flex: selectedEmail ? 1 : 2, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Search + Actions */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Rechercher par sujet..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button onClick={fetchEmails} className="btn-secondary" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', flexShrink: 0 }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Email List */}
          <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="shimmer" style={{ height: '60px', borderRadius: '10px', marginBottom: '10px' }} />
                <div className="shimmer" style={{ height: '60px', borderRadius: '10px', marginBottom: '10px' }} />
                <div className="shimmer" style={{ height: '60px', borderRadius: '10px' }} />
              </div>
            ) : emails.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Inbox size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {activeFolder === 'drafts' ? 'Aucun brouillon' : 'Aucun email envoyé'}
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
                {emails.map((email, idx) => {
                  const sc = statusConfig[email.status] || statusConfig.sent;
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      style={{
                        padding: '14px 18px',
                        borderBottom: idx < emails.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(45,91,255,0.06)' : 'transparent',
                        transition: 'background 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: `${sc.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <sc.icon size={16} color={sc.color} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                            {email.subject || '(Sans sujet)'}
                          </p>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                            {formatDateShort(email.sent_at || email.created_at)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            → {email.to_emails?.[0] || 'Non défini'}
                            {(email.to_emails?.length || 0) > 1 && ` +${email.to_emails.length - 1}`}
                          </span>
                          <span style={{
                            fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px',
                            background: sc.bg, color: sc.color,
                          }}>
                            {sc.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteEmail(email.id); }}
                        disabled={deleteLoading === email.id}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '6px', borderRadius: '6px', color: 'var(--text-muted)',
                          opacity: 0.5, transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--brand-danger)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Email Preview */}
        {selectedEmail && (
          <div style={{ flex: 1.2, minWidth: 0 }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Preview Header */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedEmail.subject || '(Sans sujet)'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    De: {selectedEmail.from_name} &lt;{selectedEmail.from_email}&gt; → {selectedEmail.to_emails?.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Preview Body */}
              <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    maxWidth: '650px',
                    margin: '0 auto',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html_body }}
                />
              </div>

              {/* Preview Footer */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {(() => {
                    const sc = statusConfig[selectedEmail.status] || statusConfig.sent;
                    return (
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    );
                  })()}
                  {selectedEmail.resend_id && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ID: {selectedEmail.resend_id}</span>
                  )}
                </div>
                {selectedEmail.error_message && (
                  <span style={{ fontSize: '11px', color: 'var(--brand-danger)' }}>
                    ⚠ {selectedEmail.error_message}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function MailboxHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
      <div>
        <div className="badge badge-primary" style={{ display: 'inline-flex', marginBottom: '8px' }}>Messagerie</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Boîte de messagerie
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gérez vos communications avec les participants</p>
      </div>
      <Link
        href="/admin/emails/compose"
        className="btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', textDecoration: 'none' }}
      >
        <Plus size={16} /> Nouveau message
      </Link>
    </div>
  );
}

function FolderSidebar({
  activeFolder,
  setActiveFolder,
  stats,
}: {
  activeFolder: Folder;
  setActiveFolder: (f: Folder) => void;
  stats: { sent: number; drafts: number };
}) {
  return (
    <div style={{ width: '200px', flexShrink: 0 }} className="hide-mobile">
      <div className="card" style={{ padding: '8px' }}>
        {folders.map(f => {
          const isActive = activeFolder === f.key;
          const count = f.key === 'sent' ? stats.sent : f.key === 'drafts' ? stats.drafts : undefined;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFolder(f.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '10px 14px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? '700' : '500',
                background: isActive ? 'rgba(45,91,255,0.08)' : 'transparent',
                color: isActive ? 'var(--brand-secondary)' : 'var(--text-secondary)',
                transition: 'all 0.2s', textAlign: 'left',
              }}
            >
              <f.icon size={16} />
              <span style={{ flex: 1 }}>{f.label}</span>
              {count !== undefined && count > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '2px 7px',
                  borderRadius: '6px', background: isActive ? 'rgba(45,91,255,0.15)' : 'var(--bg-elevated)',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
