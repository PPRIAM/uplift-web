'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, CheckCircle, X, RefreshCw, Upload, ImageIcon, Star, Radio } from 'lucide-react';
import Link from 'next/link';
import { formatDateShort } from '@/lib/dateUtils';

const toLocalISOString = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  // Normalize space to T for consistent parsing
  const normalized = dateString.includes(' ') && !dateString.includes('T') 
    ? dateString.replace(' ', 'T') 
    : dateString;
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Port-au-Prince',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const parts = formatter.formatToParts(d);
  const p = (type: string) => parts.find(x => x.type === type)?.value;
  return `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}`;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Cover image state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    location_name: '',
    location_details: '',
    city: '',
    date_time: '',
    end_date_time: '',
    description: '',
    capacity: 500,
    cover_image: '' as string,
    is_featured: false,
    is_live: false,
    metadata_benefits: '',
    metadata_objectives: '',
    metadata_outcomes: '',
    metadata_audience: '',
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date_time', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = events.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.city?.toLowerCase().includes(search.toLowerCase())
  );

  const togglePublish = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    const supabase = createClient();
    const { error } = await supabase.from('events').update({ published: !currentStatus }).eq('id', id).select();
    if (error) alert(`Erreur de permission (RLS) : ${error.message}`);
    await fetchEvents();
    setActionLoading(null);
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    const supabase = createClient();
    if (!currentStatus) {
      // Unfeatured all others first (single-featured constraint)
      await supabase.from('events').update({ is_featured: false }).eq('is_featured', true);
    }
    const { error } = await supabase.from('events').update({ is_featured: !currentStatus }).eq('id', id).select();
    if (error) alert(`Erreur: ${error.message}`);
    await fetchEvents();
    setActionLoading(null);
  };

  const toggleLive = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    const supabase = createClient();
    const { error } = await supabase.from('events').update({ is_live: !currentStatus }).eq('id', id).select();
    if (error) alert(`Erreur: ${error.message}`);
    await fetchEvents();
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    const { data, error } = await supabase.from('events').delete().eq('id', id).select();
    if (error || !data || data.length === 0) {
      alert(`Impossible de supprimer. Sécurité RLS bloque l'action.`);
      setActionLoading(null);
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeleteId(null);
    setActionLoading(null);
  };

  const resetCoverState = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setRemoveCover(false);
  };

  const openCreate = () => {
    setEditEvent(null);
    setForm({ name: '', tagline: '', location_name: '', location_details: '', city: '', date_time: '', end_date_time: '', description: '', capacity: 500, cover_image: '', is_featured: false, is_live: false, metadata_benefits: '', metadata_objectives: '', metadata_outcomes: '', metadata_audience: '' });
    resetCoverState();
    setShowModal(true);
  };

  const openEdit = (event: any) => {
    setEditEvent(event);

    let metadata = { benefits: '', objectives: '', outcomes: '', audience: '' };
    if (event.location_details) {
      try {
        const parsed = JSON.parse(event.location_details);
        metadata = { ...metadata, ...parsed };
      } catch (e) {
        // use default empty metadata
      }
    }

    setForm({
      name: event.name,
      tagline: event.tagline || '',
      location_name: event.location_name || '',
      location_details: event.location_details || '',
      city: event.city || '',
      date_time: toLocalISOString(event.date_time),
      end_date_time: toLocalISOString(event.end_date_time),
      description: event.description || '',
      capacity: event.capacity || 500,
      cover_image: event.cover_image || '',
      is_featured: event.is_featured || false,
      is_live: event.is_live || false,
      metadata_benefits: metadata.benefits || '',
      metadata_objectives: metadata.objectives || '',
      metadata_outcomes: metadata.outcomes || '',
      metadata_audience: metadata.audience || '',
    });
    resetCoverState();
    setShowModal(true);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setCoverFile(file);
    setRemoveCover(false);
    const reader = new FileReader();
    reader.onload = e => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const uploadCoverImage = async (eventId: string): Promise<string | null> => {
    if (!coverFile) return null;
    const supabase = createClient();
    const ext = coverFile.name.split('.').pop();
    const filePath = `${eventId}/cover.${ext}`;
    const { error } = await supabase.storage
      .from('event-covers')
      .upload(filePath, coverFile, { upsert: true });
    if (error) {
      alert(`Erreur upload image: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from('event-covers').getPublicUrl(filePath);
    // Bust cache with timestamp
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const deleteCoverFromStorage = async (eventId: string, currentUrl: string) => {
    if (!currentUrl) return;
    const supabase = createClient();
    // Extract path from the URL (everything after /event-covers/)
    const match = currentUrl.match(/event-covers\/(.+?)(\?|$)/);
    if (!match) return;
    await supabase.storage.from('event-covers').remove([match[1]]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setActionLoading('save');
    setCoverUploading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }

    // Determine final cover_image URL
    let finalCoverImage = form.cover_image;

    // If editing and user wants to remove cover
    if (removeCover && editEvent?.cover_image) {
      await deleteCoverFromStorage(editEvent.id, editEvent.cover_image);
      finalCoverImage = '';
    }

    // If setting as featured, unfeatured all others first
    if (form.is_featured) {
      await supabase.from('events').update({ is_featured: false }).eq('is_featured', true);
    }

    const metadataPayload = {
      benefits: form.metadata_benefits,
      objectives: form.metadata_objectives,
      outcomes: form.metadata_outcomes,
      audience: form.metadata_audience
    };

    const eventData: any = {
      name: form.name,
      tagline: form.tagline,
      location_name: form.location_name,
      location_details: JSON.stringify(metadataPayload),
      city: form.city,
      description: form.description,
      capacity: form.capacity,
      cover_image: finalCoverImage,
      is_featured: form.is_featured,
      is_live: form.is_live,
      date_time: form.date_time ? new Date(`${form.date_time}-04:00`).toISOString() : null,
      end_date_time: form.end_date_time ? new Date(`${form.end_date_time}-04:00`).toISOString() : null,
    };

    let savedEventId = editEvent?.id;

    let error;
    if (editEvent) {
      const { error: updateError } = await supabase.from('events').update(eventData).eq('id', editEvent.id).select();
      error = updateError;
    } else {
      const { data: insertData, error: insertError } = await supabase.from('events').insert([eventData]).select().single();
      error = insertError;
      if (insertData) savedEventId = insertData.id;
    }

    if (error) {
      alert(`Erreur de base de données : ${error.message}`);
      setActionLoading(null);
      setCoverUploading(false);
      return;
    }

    // Upload cover image AFTER we have the event ID
    if (coverFile && savedEventId) {
      const uploadedUrl = await uploadCoverImage(savedEventId);
      if (uploadedUrl) {
        await supabase.from('events').update({ cover_image: uploadedUrl }).eq('id', savedEventId);
      }
    }

    setCoverUploading(false);
    await fetchEvents();
    setShowModal(false);
    setActionLoading(null);
  };

  const getStatus = (date: string) => {
    if (!date) return 'upcoming';
    return new Date(date) < new Date() ? 'past' : 'upcoming';
  };

  const statusBadge: Record<string, string> = { upcoming: 'badge-success', ongoing: 'badge-warning', past: 'badge-primary' };

  const currentCover = coverPreview || (removeCover ? null : form.cover_image) || null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>Gestion des événements</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{events.length} événements au total</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchEvents} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Plus size={16} /> Créer un événement
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrer les événements..." className="input-field" style={{ paddingLeft: '42px' }} />
      </div>

      {/* Table */}
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Participants</th>
                  <th>Statut</th>
                  <th>Publié</th>
                  <th>Vedette</th>
                  <th>En direct</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(event => {
                  const fillPct = Math.round((event.registered_count / event.capacity) * 100);
                  const status = getStatus(event.date_time);
                  return (
                    <tr key={event.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Cover thumbnail */}
                          <div style={{
                            width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden',
                            background: event.cover_image ? 'transparent' : 'var(--gradient-brand)',
                            flexShrink: 0, border: '1px solid var(--border-subtle)',
                          }}>
                            {event.cover_image
                              ? <img src={event.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', background: 'var(--gradient-brand)' }} />
                            }
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>{event.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{event.tagline}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {event.date_time ? formatDateShort(event.date_time, 'en-HT') : 'Non planifié'}
                      </td>
                      <td style={{ fontSize: '13px' }}>{event.city || event.location_name}</td>
                      <td>
                        <div style={{ minWidth: '100px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            <span>{event.registered_count} / {event.capacity}</span><span>{fillPct}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(100, fillPct)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${statusBadge[status]}`}>{status === 'upcoming' ? 'À venir' : 'Passé'}</span></td>
                      <td>
                        <button
                          onClick={() => togglePublish(event.id, event.published)}
                          disabled={actionLoading === event.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: event.published ? 'var(--brand-success)' : 'var(--text-muted)', transition: 'color 0.2s', opacity: actionLoading === event.id ? 0.5 : 1 }}
                        >
                          {event.published ? <><CheckCircle size={14} /> En ligne</> : <><EyeOff size={14} /> Brouillon</>}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleFeatured(event.id, event.is_featured)}
                          disabled={actionLoading === event.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: event.is_featured ? '#f59e0b' : 'var(--text-muted)', transition: 'color 0.2s', opacity: actionLoading === event.id ? 0.5 : 1 }}
                        >
                          <Star size={14} fill={event.is_featured ? '#f59e0b' : 'none'} />
                          {event.is_featured ? 'Vedette' : '—'}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleLive(event.id, event.is_live)}
                          disabled={actionLoading === event.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: event.is_live ? 'var(--brand-danger)' : 'var(--text-muted)', transition: 'color 0.2s', opacity: actionLoading === event.id ? 0.5 : 1 }}
                        >
                          {event.is_live ? (
                            <>
                              <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Radio size={14} />
                                <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '6px', height: '6px', borderRadius: '9999px', background: 'var(--brand-danger)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                              </span>
                              Live
                            </>
                          ) : (
                            <><Radio size={14} /> Off</>
                          )}
                        </button>
                        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.4); } }`}</style>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Link href={`/events/${event.id}`} title="Voir" target="_blank" style={{ padding: '6px', borderRadius: '6px', background: 'var(--bg-elevated)', display: 'flex', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', transition: 'all 0.2s' }}>
                            <Eye size={13} />
                          </Link>
                          <button onClick={() => openEdit(event)} title="Modifier" style={{ padding: '6px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--brand-secondary)', transition: 'all 0.2s' }}>
                            <Edit size={13} />
                          </button>
                          <button onClick={() => setDeleteId(event.id)} title="Supprimer" style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: 'var(--brand-danger)', transition: 'all 0.2s' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Aucun événement trouvé</div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !actionLoading && setShowModal(false)}>
          <div className="glass-strong animate-fade-in" style={{ borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '800' }}>{editEvent ? 'Modifier un événement' : 'Créer un nouvel événement'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>

              {/* ── Cover Image Upload ─────────────────────────────────── */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Image de couverture
                </label>

                {currentCover ? (
                  /* Preview */
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '160px', border: '1px solid var(--border-subtle)' }}>
                    <img src={currentCover} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: 0, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Upload size={14} /> Changer
                      </button>
                      <button
                        onClick={() => { setRemoveCover(true); setCoverFile(null); setCoverPreview(null); }}
                        style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.9)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <X size={14} /> Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-default)', borderRadius: '12px', padding: '32px 20px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                      cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                      background: 'rgba(108,71,255,0.03)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-primary)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(108,71,255,0.08)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(108,71,255,0.03)';
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108,71,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={22} color="var(--brand-primary)" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Glissez une image ici</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ou cliquez pour parcourir · JPG, PNG, WebP · max 5 MB</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
                />
              </div>

              {/* ── Text Fields ───────────────────────────────────────── */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Titre *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ayibuzz Media Summit" className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Tagline</label>
                <input type="text" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="Description courte" className="input-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Ville</label>
                  <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Gonaïves" className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Capacité</label>
                  <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} className="input-field" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description détaillée *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description de l'événement..." className="input-field" rows={4} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Lieu précis</label>
                <input type="text" value={form.location_name} onChange={e => setForm({ ...form, location_name: e.target.value })} placeholder="Centre de conférence" className="input-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Bénéfices</label>
                  <input type="text" value={form.metadata_benefits} onChange={e => setForm({ ...form, metadata_benefits: e.target.value })} placeholder="ex: Networking..." className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Objectifs</label>
                  <input type="text" value={form.metadata_objectives} onChange={e => setForm({ ...form, metadata_objectives: e.target.value })} placeholder="ex: Sensibilisation..." className="input-field" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Résultats attendus</label>
                  <input type="text" value={form.metadata_outcomes} onChange={e => setForm({ ...form, metadata_outcomes: e.target.value })} placeholder="ex: Plan d'action..." className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Public cible</label>
                  <input type="text" value={form.metadata_audience} onChange={e => setForm({ ...form, metadata_audience: e.target.value })} placeholder="ex: Étudiants..." className="input-field" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Début</label>
                  <input type="datetime-local" value={form.date_time} onChange={e => setForm({ ...form, date_time: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Fin</label>
                  <input type="datetime-local" value={form.end_date_time} onChange={e => setForm({ ...form, end_date_time: e.target.value })} className="input-field" />
                </div>
              </div>

              {/* ── Featured & Live Checkboxes ─────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer', background: form.is_featured ? 'rgba(245,158,11,0.08)' : 'transparent', transition: 'background 0.2s' }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} style={{ accentColor: '#f59e0b', width: '16px', height: '16px' }} />
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: form.is_featured ? '#f59e0b' : 'var(--text-primary)' }}>Mettre en avant</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vedette</p>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer', background: form.is_live ? 'rgba(239,68,68,0.08)' : 'transparent', transition: 'background 0.2s' }}>
                  <input type="checkbox" checked={form.is_live} onChange={e => setForm({ ...form, is_live: e.target.checked })} style={{ accentColor: 'var(--brand-danger)', width: '16px', height: '16px' }} />
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: form.is_live ? 'var(--brand-danger)' : 'var(--text-primary)' }}>Marquer en direct</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live</p>
                  </div>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading === 'save'}
                  className="btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: actionLoading === 'save' ? 0.7 : 1 }}
                >
                  {actionLoading === 'save'
                    ? coverUploading ? 'Upload image...' : 'Chargement...'
                    : editEvent ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="glass-strong animate-fade-in" style={{ borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={24} color="var(--brand-danger)" />
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Supprimer l'événement ?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Cette action est irréversible. Toutes les données liées seront impactées.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, background: 'var(--brand-danger)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', opacity: actionLoading === deleteId ? 0.6 : 1 }}>
                {actionLoading === deleteId ? '...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
