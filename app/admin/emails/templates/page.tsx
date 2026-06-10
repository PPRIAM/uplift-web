'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, LayoutTemplate, RefreshCw, Trash2, Eye,
  Edit3, CheckCircle, AlertCircle, X, Loader2, Copy,
  FileText, Calendar, Megaphone, Hash, Tag
} from 'lucide-react';
import { formatDateShort } from '@/lib/dateUtils';

type Template = {
  id: string;
  name: string;
  description: string;
  subject: string;
  html_body: string;
  category: string;
  tokens: string[];
  is_default: boolean;
  created_at: string;
};

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  general: { label: 'Général', color: 'var(--brand-primary)', bg: 'rgba(45,91,255,0.12)' },
  reminder: { label: 'Rappel', color: 'var(--brand-warning)', bg: 'rgba(180,83,9,0.12)' },
  campaign: { label: 'Campagne', color: 'var(--brand-success)', bg: 'rgba(21,128,61,0.12)' },
  confirmation: { label: 'Confirmation', color: 'var(--brand-secondary)', bg: 'rgba(14,116,144,0.12)' },
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);

  // Create/edit form
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formHtml, setFormHtml] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formSaving, setFormSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    try {
      const res = await fetch(`/api/emails/templates?${params.toString()}`);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      setTemplates([]);
    }
    setLoading(false);
  }, [categoryFilter]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openEditForm = (template: Template) => {
    setEditTemplate(template);
    setFormName(template.name);
    setFormDesc(template.description);
    setFormSubject(template.subject);
    setFormHtml(template.html_body);
    setFormCategory(template.category);
    setShowCreate(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormSubject('');
    setFormHtml('');
    setFormCategory('general');
    setEditTemplate(null);
    setShowCreate(false);
  };

  const saveTemplate = async () => {
    if (!formName.trim() || !formHtml.trim()) {
      setToast({ success: false, message: 'Nom et contenu HTML sont requis' });
      return;
    }

    setFormSaving(true);
    try {
      const url = editTemplate
        ? `/api/emails/templates/${editTemplate.id}`
        : '/api/emails/templates';
      const method = editTemplate ? 'PATCH' : 'POST';

      // Extract tokens from subject and html_body
      const extractTokens = (text: string) => {
        const matches = text.match(/{{([^}]+)}}/g);
        if (!matches) return [];
        return Array.from(new Set(matches.map(m => m.replace(/[{}]/g, ''))));
      };

      const foundTokens = extractTokens(formSubject + ' ' + formHtml);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
          subject: formSubject,
          html_body: formHtml,
          category: formCategory,
          tokens: foundTokens,
        }),
      });

      if (res.ok) {
        setToast({ success: true, message: editTemplate ? 'Modèle mis à jour' : 'Modèle créé' });
        resetForm();
        fetchTemplates();
      } else {
        const data = await res.json();
        setToast({ success: false, message: data.error || 'Erreur' });
      }
    } catch {
      setToast({ success: false, message: 'Erreur réseau' });
    }
    setFormSaving(false);
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Supprimer ce modèle ?')) return;
    try {
      await fetch(`/api/emails/templates/${id}`, { method: 'DELETE' });
      setTemplates(prev => prev.filter(t => t.id !== id));
      setToast({ success: true, message: 'Modèle supprimé' });
    } catch { /* silent */ }
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
              Modèles Email
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{templates.length} modèle{templates.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchTemplates} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 20px' }}>
            <Plus size={16} /> Nouveau modèle
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          padding: '12px 18px', borderRadius: '12px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          background: toast.success ? 'rgba(21,128,61,0.1)' : 'rgba(220,38,38,0.1)',
          border: `1px solid ${toast.success ? 'rgba(21,128,61,0.3)' : 'rgba(220,38,38,0.3)'}`,
          color: toast.success ? 'var(--brand-success)' : 'var(--brand-danger)', fontSize: '13px', fontWeight: '600',
        }}>
          {toast.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'general', label: 'Général' },
          { key: 'reminder', label: 'Rappel' },
          { key: 'campaign', label: 'Campagne' },
          { key: 'confirmation', label: 'Confirmation' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setCategoryFilter(f.key)}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
              borderColor: categoryFilter === f.key ? 'var(--brand-primary)' : 'var(--border-subtle)',
              background: categoryFilter === f.key ? 'rgba(45,91,255,0.08)' : 'transparent',
              color: categoryFilter === f.key ? 'var(--brand-secondary)' : 'var(--text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Create/Edit modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={resetForm}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ padding: '28px', maxWidth: '700px', width: '95%', maxHeight: '85vh', overflow: 'auto', animation: 'fadeInUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{editTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}</h2>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nom *</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} className="input-field" placeholder="Nom du modèle" />
                </div>
                <div style={{ minWidth: '140px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Catégorie</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="input-field">
                    <option value="general">Général</option>
                    <option value="reminder">Rappel</option>
                    <option value="campaign">Campagne</option>
                    <option value="confirmation">Confirmation</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Description</label>
                <input value={formDesc} onChange={e => setFormDesc(e.target.value)} className="input-field" placeholder="Description courte" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Sujet</label>
                <input value={formSubject} onChange={e => setFormSubject(e.target.value)} className="input-field" placeholder="Sujet de l'email (supporte {{tokens}})" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Contenu HTML *</label>
                <textarea
                  value={formHtml}
                  onChange={e => setFormHtml(e.target.value)}
                  className="input-field"
                  style={{
                    minHeight: '200px', resize: 'vertical',
                    fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.5',
                  }}
                  placeholder="<!DOCTYPE html>..."
                />
              </div>
              <div style={{ marginTop: '4px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Jetons disponibles pour la personnalisation :</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['full_name', 'event_name', 'event_date', 'event_location', 'unique_code', 'qr_code', 'qr_code_url'].map(t => (
                    <span key={t} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {`{{${t}}}`}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={resetForm} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>Annuler</button>
                <button onClick={saveTemplate} disabled={formSaving} className="btn-primary" style={{ fontSize: '13px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {formSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {editTemplate ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <div className="modal-overlay" onClick={() => setPreviewTemplate(null)}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ padding: '0', maxWidth: '700px', width: '95%', maxHeight: '85vh', overflow: 'hidden', animation: 'fadeInUp 0.25s ease' }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>{previewTemplate.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sujet : {previewTemplate.subject}</p>
              </div>
              <button onClick={() => setPreviewTemplate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ overflow: 'auto', maxHeight: 'calc(85vh - 60px)', padding: '20px', background: 'var(--bg-elevated)' }}>
              <div
                style={{
                  background: '#fff', borderRadius: '12px', overflow: 'hidden',
                  maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
                dangerouslySetInnerHTML={{ __html: previewTemplate.html_body }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Template grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="shimmer" style={{ height: '200px', borderRadius: '16px' }} />)}
        </div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <LayoutTemplate size={44} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Aucun modèle</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Créez votre premier modèle email</p>
          <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <Plus size={16} /> Nouveau modèle
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {templates.map(template => {
            const cat = categoryConfig[template.category] || categoryConfig.general;
            return (
              <div key={template.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Preview thumbnail */}
                <div
                  style={{
                    height: '120px', overflow: 'hidden', position: 'relative',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--bg-elevated)',
                  }}
                  onClick={() => setPreviewTemplate(template)}
                >
                  <div
                    style={{
                      transform: 'scale(0.35)', transformOrigin: 'top left',
                      width: '286%', pointerEvents: 'none',
                    }}
                    dangerouslySetInnerHTML={{ __html: template.html_body }}
                  />
                  {/* Hover overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; (e.currentTarget.querySelector('span') as HTMLElement).style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; (e.currentTarget.querySelector('span') as HTMLElement).style.opacity = '0'; }}
                  >
                    <span style={{ color: 'white', fontWeight: '700', fontSize: '13px', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Eye size={14} /> Aperçu
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px',
                      background: cat.bg, color: cat.color,
                    }}>
                      {cat.label}
                    </span>
                    {template.is_default && (
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: 'rgba(45,91,255,0.08)', color: 'var(--brand-primary)' }}>
                        Défaut
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700' }}>{template.name}</h3>
                  {template.description && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {template.description}
                    </p>
                  )}
                  {template.tokens?.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {template.tokens.slice(0, 3).map(t => (
                        <span key={t} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                          {`{{${t}}}`}
                        </span>
                      ))}
                      {template.tokens.length > 3 && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{template.tokens.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <Link
                      href={`/admin/emails/compose`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
                        borderRadius: '7px', background: 'rgba(45,91,255,0.08)',
                        color: 'var(--brand-secondary)', fontSize: '11px', fontWeight: '600',
                        textDecoration: 'none',
                      }}
                    >
                      <Copy size={11} /> Utiliser
                    </Link>
                    <button
                      onClick={() => openEditForm(template)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
                        borderRadius: '7px', border: 'none', background: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                      }}
                    >
                      <Edit3 size={11} /> Modifier
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px',
                        borderRadius: '7px', border: 'none', background: 'rgba(220,38,38,0.08)',
                        color: 'var(--brand-danger)', cursor: 'pointer', fontSize: '11px', marginLeft: 'auto',
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
