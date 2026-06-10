'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, X, CheckCircle, RefreshCw, Calendar, User } from 'lucide-react';
import { formatTime } from '@/lib/dateUtils';

type SessionType = 'conference' | 'workshop' | 'break';

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  conference: 'Conférence',
  workshop: 'Atelier',
  break: 'Pause',
};

const toLocalISOString = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Port-au-Prince',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const parts = formatter.formatToParts(d);
  const p = (type: string) => parts.find(x => x.type === type)?.value;
  return `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}`;
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSession, setEditSession] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    event_id: '',
    title: '',
    description: '',
    type: 'conference' as SessionType,
    start_time: '',
    end_time: '',
    speaker_id: '', // One speaker for simple UI
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    
    // Fetch sessions with their event names and speakers
    const { data: sesData } = await supabase
      .from('sessions')
      .select(`
        *,
        events (name),
        session_speakers (
          speaker_id,
          speakers (full_name, profile_image)
        )
      `)
      .order('start_time', { ascending: true });

    // Fetch events and speakers for dropdowns
    const { data: evtData } = await supabase.from('events').select('id, name').eq('published', true);
    const { data: spkData } = await supabase.from('speakers').select('id, full_name');

    setSessions(sesData || []);
    setEvents(evtData || []);
    setSpeakers(spkData || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditSession(null);
    setForm({ event_id: events[0]?.id || '', title: '', description: '', type: 'conference', start_time: '', end_time: '', speaker_id: '' });
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditSession(s);
    setForm({
      event_id: s.event_id,
      title: s.title,
      description: s.description || '',
      type: s.type as SessionType,
      start_time: toLocalISOString(s.start_time),
      end_time: toLocalISOString(s.end_time),
      speaker_id: s.session_speakers?.[0]?.speaker_id || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.event_id) return;
    setActionLoading('save');
    const supabase = createClient();

    const sessionData = {
      event_id: form.event_id,
      title: form.title,
      description: form.description,
      type: form.type,
      start_time: form.start_time ? new Date(`${form.start_time}-04:00`).toISOString() : null,
      end_time: form.end_time ? new Date(`${form.end_time}-04:00`).toISOString() : null,
    };

    let sessionId = editSession?.id;

    if (editSession) {
      await supabase.from('sessions').update(sessionData).eq('id', sessionId);
    } else {
      const { data } = await supabase.from('sessions').insert([sessionData]).select();
      sessionId = data?.[0]?.id;
    }

    // Handle speaker link
    if (sessionId) {
      // Clear existing speakers for this session
      await supabase.from('session_speakers').delete().eq('session_id', sessionId);
      
      // Add new speaker if selected
      if (form.speaker_id) {
        await supabase.from('session_speakers').insert({
          session_id: sessionId,
          speaker_id: form.speaker_id
        });
      }
    }

    await fetchData();
    setShowModal(false);
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette session ?')) return;
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from('sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
    setActionLoading(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>Gestion des sessions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{sessions.length} sessions au total</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Plus size={16} /> Ajouter une session
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.map(ses => (
            <div key={ses.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 22px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{SESSION_TYPE_LABELS[ses.type as SessionType]}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>· {ses.events?.name}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>{ses.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {ses.start_time ? formatTime(ses.start_time) : '--:--'} - 
                  {ses.end_time ? formatTime(ses.end_time) : '--:--'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                {ses.session_speakers?.[0] && (
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600' }}>{ses.session_speakers[0].speakers?.full_name}</p>
                    <img src={ses.session_speakers[0].speakers?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ses.session_speakers[0].speakers?.full_name}`} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEdit(ses)} style={{ padding: '6px', borderRadius: '6px', background: 'rgba(0,24,255,0.1)', border: '1px solid rgba(0,24,255,0.2)', color: 'var(--brand-secondary)', cursor: 'pointer' }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(ses.id)} style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--brand-danger)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="glass-strong animate-fade-in" style={{ borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-default)' }}>
            <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
              {editSession ? 'Modifier la session' : 'Nouvelle session'}
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Événement *</label>
                <select value={form.event_id} onChange={e => setForm({ ...form, event_id: e.target.value })} className="input-field">
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Titre *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as SessionType })} className="input-field">
                    <option value="conference">Conférence</option>
                    <option value="workshop">Atelier</option>
                    <option value="break">Pause</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Intervenant</label>
                  <select value={form.speaker_id} onChange={e => setForm({ ...form, speaker_id: e.target.value })} className="input-field">
                    <option value="">(Aucun)</option>
                    {speakers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Début</label>
                  <input type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Fin</label>
                  <input type="datetime-local" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="input-field" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
                <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
