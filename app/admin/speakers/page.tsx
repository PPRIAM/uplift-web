'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, Search, X, CheckCircle, RefreshCw, Eye, EyeOff, Upload, ImageIcon, Camera } from 'lucide-react';
import { toggleSpeakerVisibility } from '../speaker-applications/actions';

const TwitterIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedinIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editSpeaker, setEditSpeaker] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: '',
    role: '',
    company: '',
    bio: '',
    profile_image: '',
    twitter_handle: '',
    linkedin_url: '',
    published: false
  });

  const fetchSpeakers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('speakers')
      .select('*')
      .order('full_name');
    setSpeakers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSpeakers(); }, [fetchSpeakers]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    return speakers.filter(s => 
      s.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      s.role?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [speakers, debouncedSearch]);

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const openCreate = () => {
    setEditSpeaker(null);
    setForm({ full_name: '', role: '', company: '', bio: '', profile_image: '', twitter_handle: '', linkedin_url: '', published: false });
    resetImageState();
    setShowModal(true);
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    setActionLoading(id);
    const res = await toggleSpeakerVisibility(id, !current);
    if (res.error) {
      alert(res.error);
    } else {
      setSpeakers(prev => prev.map(s => s.id === id ? { ...s, published: !current } : s));
      await fetchSpeakers();
    }
    setActionLoading(null);
  };

  const openEdit = (s: any) => {
    setEditSpeaker(s);
    setForm({
      full_name: s.full_name,
      role: s.role,
      company: s.company || '',
      bio: s.bio || '',
      profile_image: s.profile_image || '',
      twitter_handle: s.twitter_handle || '',
      linkedin_url: s.linkedin_url || '',
      published: s.published ?? true
    });
    resetImageState();
    setShowModal(true);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const uploadSpeakerImage = async (speakerId: string): Promise<string | null> => {
    if (!imageFile) return null;
    const supabase = createClient();
    const ext = imageFile.name.split('.').pop();
    const filePath = `${speakerId}/profile.${ext}`;
    
    setIsUploading(true);
    const { error: uploadError } = await supabase.storage
      .from('speakers')
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      alert(`Erreur upload image: ${uploadError.message}`);
      setIsUploading(false);
      return null;
    }

    const { data } = supabase.storage.from('speakers').getPublicUrl(filePath);
    setIsUploading(false);
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) return;
    setActionLoading('save');
    const supabase = createClient();
    
    let error;
    let savedSpeakerId = editSpeaker?.id;

    if (editSpeaker) {
      const { error: updateError } = await supabase.from('speakers').update(form).eq('id', editSpeaker.id).select();
      error = updateError;
    } else {
      const { data: insertData, error: insertError } = await supabase.from('speakers').insert([form]).select().single();
      error = insertError;
      if (insertData) savedSpeakerId = insertData.id;
    }

    if (error) {
      alert(`Erreur BDD : ${error.message}`);
      setActionLoading(null);
      return;
    }

    // Handle Image Upload if a file was selected
    if (imageFile && savedSpeakerId) {
      const uploadedUrl = await uploadSpeakerImage(savedSpeakerId);
      if (uploadedUrl) {
        await supabase.from('speakers').update({ profile_image: uploadedUrl }).eq('id', savedSpeakerId);
      }
    }
    
    await fetchSpeakers();
    setShowModal(false);
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    const { data, error } = await supabase.from('speakers').delete().eq('id', id).select();
    if (error || !data || data.length === 0) {
      alert(`Erreur lors de la suppression. Probablement bloquée par RLS.`);
      setActionLoading(null);
      return;
    }
    setSpeakers(prev => prev.filter(s => s.id !== id));
    setDeleteId(null);
    setActionLoading(null);
  };

  const currentPreview = imagePreview || form.profile_image || null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>Gestion des intervenants</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{speakers.length} intervenants au total</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchSpeakers} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Plus size={16} /> Ajouter un intervenant
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '24px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrer les intervenants..." className="input-field" style={{ paddingLeft: '38px' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map(speaker => (
            <div key={speaker.id} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid var(--border-default)', overflow: 'hidden', flexShrink: 0, aspectRatio: '1/1' }}>
                    <img src={speaker.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${speaker.full_name}`} alt={speaker.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>{speaker.full_name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--brand-secondary)' }}>{speaker.role}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{speaker.company}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => handleToggleVisibility(speaker.id, speaker.published ?? true)} 
                    style={{ padding: '6px', borderRadius: '6px', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', cursor: 'pointer', color: 'var(--brand-secondary)' }}
                    title={speaker.published ? "Visible" : "Masqué"}
                  >
                    {speaker.published !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button onClick={() => openEdit(speaker)} style={{ padding: '6px', borderRadius: '6px', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', cursor: 'pointer', color: 'var(--brand-secondary)' }}><Edit size={12} /></button>
                  <button onClick={() => setDeleteId(speaker.id)} style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: 'var(--brand-danger)' }}><Trash2 size={12} /></button>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px', height: '64px', overflow: 'hidden' }}>{speaker.bio}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                {speaker.twitter_handle && <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><TwitterIcon /> {speaker.twitter_handle}</span>}
                {speaker.linkedin_url && <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><LinkedinIcon /></span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !actionLoading && setShowModal(false)}>
          <div className="glass-strong animate-fade-in" style={{ borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-default)', maxHeight: '95vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '800' }}>{editSpeaker ? 'Modifier l\'intervenant' : 'Ajouter un intervenant'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              
              {/* Photo Upload Area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                  {currentPreview ? (
                    <img src={currentPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <Camera size={32} />
                    </div>
                  )}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    <Upload color="white" size={24} />
                  </div>
                </div>

                <div 
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%', border: '2px dashed var(--border-default)', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                >
                  <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>Cliquez ou glissez une photo</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mise à jour automatique après enregistrement</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nom complet *</label>
                <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Ex: Jean Paul" className="input-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Titre/Poste</label>
                  <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="CEO" className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Entreprise</label>
                  <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Ayibuzz" className="input-field" />
                </div>
              </div>
              
              {/* Optional: keep the URL field but maybe make it less prominent */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>URL de l'image (Manuel)</label>
                <input type="text" value={form.profile_image} onChange={e => setForm({ ...form, profile_image: e.target.value })} placeholder="https://..." className="input-field" />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Biographie</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-field" rows={3} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Twitter</label>
                  <input type="text" value={form.twitter_handle} onChange={e => setForm({ ...form, twitter_handle: e.target.value })} placeholder="@handle" className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>LinkedIn</label>
                  <input type="text" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} placeholder="URL profil" className="input-field" />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="published"
                  checked={form.published} 
                  onChange={e => setForm({ ...form, published: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="published" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer' }}>Afficher sur le site public</label>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
                <button onClick={handleSave} disabled={actionLoading === 'save' || isUploading} className="btn-primary" style={{ flex: 1, opacity: (actionLoading === 'save' || isUploading) ? 0.7 : 1 }}>
                  {isUploading ? 'Upload...' : (actionLoading === 'save' ? 'Chargement...' : (editSpeaker ? 'Enregistrer' : 'Ajouter'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="glass-strong animate-fade-in" style={{ borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '380px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
            <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Supprimer ?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Cet intervenant sera définitivement retiré.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, background: 'var(--brand-danger)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '600', cursor: 'pointer', opacity: actionLoading === deleteId ? 0.6 : 1 }}>
                {actionLoading === deleteId ? '...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

