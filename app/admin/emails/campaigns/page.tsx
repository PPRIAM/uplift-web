'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Megaphone, RefreshCw, Send, Pause,
  CheckCircle, AlertCircle, Clock, Trash2, Eye, Play,
  Users, Calendar, Loader2, X, FileText, ChevronRight, ChevronLeft
} from 'lucide-react';
import { formatDateShort } from '@/lib/dateUtils';
import { createClient } from '@/utils/supabase/client';

type Campaign = {
  id: string;
  name: string;
  description: string;
  event_id: string | null;
  template_id: string | null;
  subject: string;
  html_body: string;
  status: string;
  target_audience: string;
  content_data: any;
  recipient_filter: Record<string, unknown>;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  opened_count: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  events?: { name: string } | null;
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  draft: { label: 'Brouillon', color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.12)', icon: FileText },
  sending: { label: 'En cours', color: 'var(--brand-primary)', bg: 'rgba(45,91,255,0.12)', icon: Loader2 },
  completed: { label: 'Terminée', color: 'var(--brand-success)', bg: 'rgba(21,128,61,0.12)', icon: CheckCircle },
  paused: { label: 'En pause', color: 'var(--brand-warning)', bg: 'rgba(180,83,9,0.12)', icon: Pause },
  failed: { label: 'Échouée', color: 'var(--brand-danger)', bg: 'rgba(220,38,38,0.12)', icon: AlertCircle },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignEmails, setCampaignEmails] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEventId, setNewEventId] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('all');
  const [newTemplateId, setNewTemplateId] = useState('');
  const [newContent, setNewContent] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [savingDraft, setSavingDraft] = useState(false);

  // Sending
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    try {
      const res = await fetch(`/api/emails/campaigns?${params.toString()}`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch {
      setCampaigns([]);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  useEffect(() => {
    const fetchEventsAndTemplates = async () => {
      const supabase = createClient();
      const { data: evData } = await supabase
        .from('events')
        .select('id, name, date_time')
        .eq('published', true)
        .order('date_time', { ascending: false });
      setEvents(evData || []);

      const res = await fetch('/api/emails/templates');
      const tmplData = await res.json();
      setTemplates(tmplData.templates || []);
    };
    fetchEventsAndTemplates();
  }, []);

  const resetWizard = () => {
    setShowWizard(false);
    setWizardStep(1);
    setNewName('');
    setNewDesc('');
    setNewEventId('');
    setNewTargetAudience('all');
    setNewTemplateId('');
    setNewContent('');
  };

  const getPreviewHtml = () => {
    const tmpl = templates.find(t => t.id === newTemplateId);
    if (!tmpl) return '';
    let html = tmpl.html_body;
    html = html.replace(/{{content}}/g, newContent.replace(/\n/g, '<br/>'));
    html = html.replace(/{{full_name}}/g, 'Jean Dupont');
    html = html.replace(/{{event_name}}/g, events.find(e => e.id === newEventId)?.name || 'Nom Événement');
    return html;
  };

  const saveDraft = async () => {
    if (!newName.trim()) return;
    setSavingDraft(true);
    try {
      const tmpl = templates.find(t => t.id === newTemplateId);
      const res = await fetch('/api/emails/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          event_id: newEventId || null,
          template_id: newTemplateId || null,
          target_audience: newTargetAudience,
          content_data: { content: newContent },
          subject: tmpl?.subject || '',
          html_body: tmpl?.html_body || '',
        }),
      });
      if (res.ok) {
        resetWizard();
        fetchCampaigns();
        setSendResult({ success: true, message: 'Brouillon enregistré' });
      }
    } catch { /* silent */ }
    setSavingDraft(false);
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Supprimer cette campagne ?')) return;
    try {
      await fetch(`/api/emails/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
    } catch { /* silent */ }
  };

  const viewCampaignDetail = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/emails/campaigns/${campaign.id}`);
      const data = await res.json();
      setCampaignEmails(data.emails || []);
    } catch {
      setCampaignEmails([]);
    }
    setDetailLoading(false);
  };

  const handleSendFromWizard = async () => {
    if (!newEventId) {
      setSendResult({ success: false, message: 'Sélectionnez un événement cible' });
      return;
    }
    setSendingCampaign(true);
    setSendResult(null);

    try {
      const tmpl = templates.find(t => t.id === newTemplateId);
      
      // First create the campaign
      const campRes = await fetch('/api/emails/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          event_id: newEventId,
          template_id: newTemplateId,
          target_audience: newTargetAudience,
          content_data: { content: newContent },
          subject: tmpl?.subject || '',
          html_body: tmpl?.html_body || '',
        }),
      });
      const campData = await campRes.json();
      if (!campRes.ok) throw new Error(campData.error);
      
      const newCampaign = campData.campaign;
      
      // Then send it
      await executeCampaignSend(newCampaign, tmpl?.subject, tmpl?.html_body, { content: newContent });
      resetWizard();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSendResult({ success: false, message: message || 'Erreur réseau' });
    }
    setSendingCampaign(false);
  };

  const sendExistingCampaign = async (campaign: Campaign) => {
    setSendingCampaign(true);
    setSendResult(null);
    await executeCampaignSend(campaign, campaign.subject, campaign.html_body, campaign.content_data);
    setSendingCampaign(false);
  };

  const executeCampaignSend = async (campaign: any, subject?: string, templateHtml?: string, contentData?: any) => {
    if (!campaign.event_id) {
      setSendResult({ success: false, message: 'Événement cible manquant' });
      return;
    }

    const supabase = createClient();
    
    // Fetch reservations based on target audience
    let query = supabase
      .from('reservations')
      .select('id, full_name, email, status, payment_status, issued_tickets(ticket_code)')
      .eq('event_id', campaign.event_id);
      
    if (campaign.target_audience === 'confirmed') {
      query = query.eq('status', 'confirmed');
    } else if (campaign.target_audience === 'pending') {
      query = query.eq('status', 'pending');
    }

    const { data: reservations } = await query;
    const event = events.find(e => e.id === campaign.event_id);

    if (!reservations || reservations.length === 0) {
      setSendResult({ success: false, message: 'Aucun destinataire trouvé pour cet événement et cette audience.' });
      return;
    }

    try {
      // Inject user's custom content into the HTML before sending to the bulk engine
      let finalHtml = templateHtml || campaign.html_body || '';
      if (contentData?.content) {
        finalHtml = finalHtml.replace(/{{content}}/g, contentData.content.replace(/\n/g, '<br/>'));
      }

      const res = await fetch('/api/emails/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          subject: subject || campaign.subject || campaign.name,
          html_body: finalHtml,
          event_id: campaign.event_id,
          recipients: reservations.map(r => {
            const ticketCode = r.issued_tickets?.[0]?.ticket_code || '';
            const qrUrl = ticketCode ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketCode}` : '';
            return {
              email: r.email,
              full_name: r.full_name,
              event_name: event?.name || '',
              event_date: event ? formatDateShort(event.date_time) : '',
              unique_code: ticketCode,
              qr_code: qrUrl ? `<img src="${qrUrl}" alt="QR Code" width="180" height="180" style="border-radius: 8px;" />` : '',
              qr_code_url: qrUrl,
            };
          }),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ success: true, message: `${data.sent}/${data.total} emails envoyés avec succès (envoi par lots)` });
        fetchCampaigns();
      } else {
        setSendResult({ success: false, message: data.error || 'Échec' });
      }
    } catch {
      setSendResult({ success: false, message: 'Erreur réseau lors de l\'envoi' });
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin/emails" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '10px',
            border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)',
            textDecoration: 'none',
          }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display" style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Campagnes Email
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{campaigns.length} campagne{campaigns.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchCampaigns} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setShowWizard(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 20px' }}>
            <Plus size={16} /> Nouvelle campagne
          </button>
        </div>
      </div>

      {/* Send result toast */}
      {sendResult && (
        <div style={{
          padding: '12px 18px', borderRadius: '12px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          background: sendResult.success ? 'rgba(21,128,61,0.1)' : 'rgba(220,38,38,0.1)',
          border: `1px solid ${sendResult.success ? 'rgba(21,128,61,0.3)' : 'rgba(220,38,38,0.3)'}`,
          color: sendResult.success ? 'var(--brand-success)' : 'var(--brand-danger)', fontSize: '13px', fontWeight: '600',
        }}>
          {sendResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {sendResult.message}
          <button onClick={() => setSendResult(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'draft', label: 'Brouillons' },
          { key: 'sending', label: 'En cours' },
          { key: 'completed', label: 'Terminées' },
          { key: 'failed', label: 'Échouées' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
              borderColor: statusFilter === f.key ? 'var(--brand-primary)' : 'var(--border-subtle)',
              background: statusFilter === f.key ? 'rgba(45,91,255,0.08)' : 'transparent',
              color: statusFilter === f.key ? 'var(--brand-secondary)' : 'var(--text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 4-Step Campaign Wizard */}
      {showWizard && (
        <div className="modal-overlay" onClick={resetWizard}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ padding: '0', maxWidth: '800px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'fadeInUp 0.25s ease' }}>
            
            {/* Wizard Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Créer une campagne</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700',
                        background: wizardStep === s ? 'var(--brand-primary)' : wizardStep > s ? 'rgba(21,128,61,0.1)' : 'var(--bg-elevated)',
                        color: wizardStep === s ? '#fff' : wizardStep > s ? 'var(--brand-success)' : 'var(--text-muted)'
                      }}>
                        {wizardStep > s ? <CheckCircle size={14} /> : s}
                      </div>
                      {s < 4 && <div style={{ width: '20px', height: '2px', background: wizardStep > s ? 'rgba(16,185,129,0.5)' : 'var(--bg-elevated)' }} />}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={resetWizard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Wizard Body */}
            <div style={{ padding: '28px', flex: 1, overflow: 'auto' }}>
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>1. Configuration</h3>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nom de la campagne *</label>
                    <input value={newName} onChange={e => setNewName(e.target.value)} className="input-field" placeholder="Ex: Rappel Ayibuzz Media" autoFocus />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Description</label>
                    <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="input-field" placeholder="Description courte (interne)..." />
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Événement cible *</label>
                      <select value={newEventId} onChange={e => setNewEventId(e.target.value)} className="input-field">
                        <option value="">-- Sélectionnez un événement --</option>
                        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Audience cible</label>
                      <select value={newTargetAudience} onChange={e => setNewTargetAudience(e.target.value)} className="input-field">
                        <option value="all">Tous les inscrits</option>
                        <option value="confirmed">Inscriptions Confirmées uniquement</option>
                        <option value="pending">En attente de paiement uniquement</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>2. Choix du modèle (Template)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {templates.map(tmpl => (
                      <div 
                        key={tmpl.id} 
                        onClick={() => setNewTemplateId(tmpl.id)}
                        style={{ 
                          padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                          border: `2px solid ${newTemplateId === tmpl.id ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                          background: newTemplateId === tmpl.id ? 'rgba(45,91,255,0.04)' : 'transparent',
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                          <FileText size={20} />
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{tmpl.name}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tmpl.subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>3. Contenu personnalisé</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Le modèle choisi comporte des zones dynamiques. Saisissez votre contenu ci-dessous.</p>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Corps du message {"{{content}}"}</label>
                    <textarea 
                      value={newContent} 
                      onChange={e => setNewContent(e.target.value)} 
                      className="input-field" 
                      style={{ minHeight: '200px', resize: 'vertical' }} 
                      placeholder="Tapez le contenu principal ici... Le HTML de base est autorisé (ex: <b>gras</b>)." 
                    />
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>4. Aperçu & Envoi</h3>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Sujet :</p>
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>{templates.find(t => t.id === newTemplateId)?.subject || 'Sans sujet'}</p>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--bg-elevated)', maxHeight: '400px', overflow: 'auto' }}>
                      <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-elevated)' }}>
              <button 
                onClick={() => setWizardStep(prev => prev - 1)} 
                disabled={wizardStep === 1}
                className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              
              {wizardStep < 4 ? (
                <button 
                  onClick={() => setWizardStep(prev => prev + 1)} 
                  disabled={
                    (wizardStep === 1 && (!newName.trim() || !newEventId)) ||
                    (wizardStep === 2 && !newTemplateId)
                  }
                  className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  Suivant <ChevronRight size={16} />
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={saveDraft} disabled={savingDraft} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    {savingDraft ? <Loader2 size={14} className="animate-spin" /> : 'Enregistrer le brouillon'}
                  </button>
                  <button onClick={handleSendFromWizard} disabled={sendingCampaign} className="btn-primary" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    {sendingCampaign ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Envoyer maintenant
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="modal-overlay" onClick={() => setSelectedCampaign(null)}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ padding: '28px', maxWidth: '700px', width: '95%', maxHeight: '85vh', overflow: 'auto', animation: 'fadeInUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{selectedCampaign.name}</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedCampaign.description}</p>
              </div>
              <button onClick={() => setSelectedCampaign(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total', value: selectedCampaign.total_recipients, color: 'var(--brand-primary)' },
                { label: 'Envoyés', value: selectedCampaign.sent_count, color: 'var(--brand-success)' },
                { label: 'Échoués', value: selectedCampaign.failed_count, color: 'var(--brand-danger)' },
              ].map(s => (
                <div key={s.label} style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-elevated)', textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            {selectedCampaign.total_recipients > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Progression</span>
                  <span>{Math.round((selectedCampaign.sent_count / selectedCampaign.total_recipients) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (selectedCampaign.sent_count / selectedCampaign.total_recipients) * 100)}%` }} />
                </div>
              </div>
            )}

            {/* Send log */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Journal d'envoi</h3>
              {detailLoading ? (
                <div className="shimmer" style={{ height: '80px', borderRadius: '10px' }} />
              ) : campaignEmails.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Aucun envoi enregistré</p>
              ) : (
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {campaignEmails.map((em: any) => (
                    <div key={em.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', marginBottom: '4px', background: 'var(--bg-elevated)' }}>
                      {em.status === 'sent' || em.status === 'delivered' ? <CheckCircle size={14} color="var(--brand-success)" /> : <AlertCircle size={14} color="var(--brand-danger)" />}
                      <span style={{ fontSize: '13px', flex: 1 }}>{em.to_emails?.[0]}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{em.sent_at ? formatDateShort(em.sent_at) : '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaign list */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: '180px', borderRadius: '16px' }} />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Megaphone size={44} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Aucune campagne</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Créez votre première campagne email</p>
          <button onClick={() => setShowWizard(true)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <Plus size={16} /> Nouvelle campagne
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {campaigns.map(campaign => {
            const sc = statusConfig[campaign.status] || statusConfig.draft;
            const progressPct = campaign.total_recipients > 0
              ? Math.round((campaign.sent_count / campaign.total_recipients) * 100) : 0;

            return (
              <div key={campaign.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px',
                        background: sc.bg, color: sc.color, display: 'inline-flex', alignItems: 'center', gap: '4px',
                      }}>
                        <sc.icon size={10} /> {sc.label}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {campaign.name}
                    </h3>
                    {campaign.events?.name && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> {campaign.events.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                {campaign.total_recipients > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>{campaign.sent_count} / {campaign.total_recipients} envoyés</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                {/* Date */}
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Créée le {formatDateShort(campaign.created_at)}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => viewCampaignDetail(campaign)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                      borderRadius: '7px', border: 'none', background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                    }}
                  >
                    <Eye size={12} /> Détails
                  </button>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => sendExistingCampaign(campaign)}
                      disabled={sendingCampaign}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                        borderRadius: '7px', border: 'none', background: 'rgba(21,128,61,0.12)',
                        color: 'var(--brand-success)', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      }}
                    >
                      {sendingCampaign ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                      Envoyer
                    </button>
                  )}
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
                      borderRadius: '7px', border: 'none', background: 'rgba(220,38,38,0.08)',
                      color: 'var(--brand-danger)', cursor: 'pointer', fontSize: '12px', marginLeft: 'auto',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
