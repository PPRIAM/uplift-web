'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, X, CheckCircle, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/ticketUtils';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTicket, setEditTicket] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState({
    event_id: '',
    name: '',
    price: '0',
    quantity: '100',
    benefits: '',
    available: true,
    allocation_mode: 'standard',
    pricing_tiers: [] as { id: string, name: string, price: number, benefits: string[] }[],
    description: 'USD'
  });

  const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setGlobalError(null);
    const supabase = createClient();
    
    try {
      // Vérifier la session de l'admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }

      // Fetch tickets with event names
      const { data: tktData, error: tktError } = await supabase
        .from('tickets')
        .select(`
          *,
          events (id, name, capacity)
        `)
        .order('created_at', { ascending: false });

      if (tktError) throw tktError;

      // Fetch LIVE reservation counts per ticket (confirmed only)
      const { data: reservationCounts, error: resError } = await supabase
        .from('reservations')
        .select('ticket_id, quantity')
        .eq('status', 'confirmed');

      if (resError) throw resError;

      // Aggregate by ticket_id
      const soldByTicket: Record<string, number> = {};
      for (const r of reservationCounts || []) {
        if (r.ticket_id) {
          soldByTicket[r.ticket_id] = (soldByTicket[r.ticket_id] || 0) + (r.quantity || 1);
        }
      }

      // Merge live counts into ticket data
      const merged = (tktData || []).map(t => ({
        ...t,
        live_sold: soldByTicket[t.id] || 0,
      }));

      // Calculate base statistics per event
      const eventStats: Record<string, { baseSold: number, capacity: number }> = {};
      merged.forEach(t => {
        if (!eventStats[t.event_id]) {
          eventStats[t.event_id] = { baseSold: 0, capacity: t.events?.capacity || 0 };
        }
        if (t.allocation_mode !== 'expanded') {
          eventStats[t.event_id].baseSold += t.live_sold;
        }
      });

      // Attach eventStats dynamically
      const ticketsWithStats = merged.map(t => ({
        ...t,
        eventStats: eventStats[t.event_id]
      }));

      // Fetch events for dropdown
      const { data: evtData, error: evtError } = await supabase
        .from('events')
        .select('id, name')
        .eq('published', true);

      if (evtError) throw evtError;

      setTickets(ticketsWithStats);
      setEvents(evtData || []);
    } catch (err: any) {
      console.error('Error in fetchData:', err);
      setGlobalError(`Erreur de chargement : ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditTicket(null);
    setModalError(null);
    setValidationErrors({});
    setForm({ event_id: events[0]?.id || '', name: '', price: '0', quantity: '100', benefits: '', available: true, allocation_mode: 'standard', pricing_tiers: [], description: 'USD' });
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setEditTicket(t);
    setModalError(null);
    setValidationErrors({});
    setForm({
      event_id: t.event_id,
      name: t.name,
      price: String(t.price),
      quantity: String(t.quantity),
      benefits: Array.isArray(t.benefits) ? t.benefits.join('\n') : '',
      available: t.available,
      allocation_mode: t.allocation_mode || 'standard',
      pricing_tiers: t.pricing_tiers || [],
      description: t.description || 'USD'
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setModalError(null);
    const errors: Record<string, string> = {};
    if (!form.name.trim()) {
      errors.name = 'Le nom du billet est requis.';
    }
    if (!form.event_id) {
      errors.event_id = 'Veuillez sélectionner un événement.';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    
    setActionLoading('save');
    const supabase = createClient();

    // Verify session again before saving
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setModalError("Votre session a expiré. Veuillez vous reconnecter.");
      setActionLoading(null);
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
      return;
    }

    const ticketData = {
      event_id: form.event_id,
      name: form.name,
      price: parseFloat(form.price) || 0,
      quantity: parseInt(form.quantity) || 0,
      benefits: form.benefits.split('\n').filter(b => b.trim() !== ''),
      available: form.available,
      allocation_mode: form.allocation_mode,
      pricing_tiers: form.pricing_tiers,
      description: form.description
    };

    let result;
    if (editTicket) {
      result = await supabase.from('tickets').update(ticketData).eq('id', editTicket.id);
    } else {
      result = await supabase.from('tickets').insert([ticketData]);
    }

    if (result.error) {
      console.error('Error saving ticket:', result.error);
      setModalError(`Erreur de base de données : ${result.error.message}`);
      setActionLoading(null);
      return;
    }

    await fetchData();
    setShowModal(false);
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    setGlobalError(null);
    const supabase = createClient();
    
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) {
      console.error('Error deleting ticket:', error);
      setGlobalError(`Impossible de supprimer le billet : ${error.message}`);
      setDeleteId(null);
      setActionLoading(null);
      return;
    }

    setTickets(prev => prev.filter(t => t.id !== id));
    setDeleteId(null);
    setActionLoading(null);
  };

  const addTier = () => {
    setForm(prev => ({
      ...prev,
      pricing_tiers: [...prev.pricing_tiers, { id: generateUUID(), name: '', price: 0, benefits: [] }]
    }));
  };

  const updateTier = (id: string, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      pricing_tiers: prev.pricing_tiers.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const removeTier = (id: string) => {
    setForm(prev => ({
      ...prev,
      pricing_tiers: prev.pricing_tiers.filter(t => t.id !== id)
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>Gestion des billets</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{tickets.length} types de billets configurés</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Plus size={16} /> Créer un type de billet
          </button>
        </div>
      </div>

      {globalError && (
        <div className="card" style={{ border: '1px solid var(--brand-danger)', background: 'rgba(220,38,38,0.05)', color: 'var(--brand-danger)', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px' }}>
          <div style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{globalError}</div>
          <button onClick={fetchData} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Réessayer</button>
        </div>
      )}

      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Nom du billet</th>
                  <th>Prix</th>
                  <th>Vendu / Total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => {
                  const liveSold = ticket.live_sold ?? 0;
                  
                  let displaySold = liveSold;
                  let displayTotal = ticket.quantity;
                  let remaining = Math.max(0, ticket.quantity - liveSold);

                  if (ticket.allocation_mode === 'standard') {
                    const stats = ticket.eventStats;
                    if (stats) {
                      displaySold = stats.baseSold;
                      displayTotal = stats.capacity;
                      remaining = Math.max(0, displayTotal - displaySold);
                    }
                  } else if (ticket.allocation_mode === 'shared') {
                    const stats = ticket.eventStats;
                    const standardPoolRemaining = stats ? Math.max(0, stats.capacity - stats.baseSold) : 0;
                    remaining = Math.max(0, Math.min(ticket.quantity - liveSold, standardPoolRemaining));
                  }

                  const soldPct  = displayTotal > 0 ? Math.floor((displaySold / displayTotal) * 100) : 0;
                  
                  return (
                    <tr key={ticket.id}>
                      <td style={{ fontSize: '13px' }}>
                        <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{ticket.events?.name}</p>
                      </td>
                      <td style={{ fontSize: '13px', fontWeight: '600' }}>
                        <div>{ticket.name}</div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'normal', display: 'inline-block', marginTop: '2px', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          {ticket.allocation_mode === 'expanded' ? 'Étendu' : ticket.allocation_mode === 'shared' ? 'Partagé' : 'Standard'}
                        </span>
                      </td>
                      <td style={{ fontSize: '14px', fontWeight: '700' }}>
                        {ticket.pricing_tiers && ticket.pricing_tiers.length > 0 ? (
                          <span>
                            À partir de {formatPrice(Math.min(...ticket.pricing_tiers.map((tr: any) => tr.price)), ticket.description)}
                          </span>
                        ) : (
                          formatPrice(ticket.price, ticket.description)
                        )}
                      </td>
                      <td>
                        <div style={{ minWidth: '140px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '12px' }}>
                              {displaySold} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>/ {displayTotal}</span>
                            </span>
                            <span style={{ fontSize: '10px' }}>{remaining} restants · {soldPct}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(100, soldPct)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${ticket.available ? 'badge-success' : 'badge-danger'}`}>
                          {ticket.available ? 'Disponible' : 'Désactivé'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => openEdit(ticket)} style={{ padding: '5px', borderRadius: '6px', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', cursor: 'pointer', color: 'var(--brand-secondary)' }}><Edit size={12} /></button>
                          <button onClick={() => setDeleteId(ticket.id)} style={{ padding: '5px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', color: 'var(--brand-danger)' }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {tickets.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Aucun billet configuré</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !actionLoading && setShowModal(false)}>
          <div className="glass-strong animate-fade-in" style={{ borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-default)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '800' }}>{editTicket ? 'Modifier le billet' : 'Nouveau type de billet'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            {modalError && (
              <div className="card" style={{ border: '1px solid var(--brand-danger)', background: 'rgba(220,38,38,0.05)', color: 'var(--brand-danger)', padding: '12px', fontSize: '13px', borderRadius: '10px', marginBottom: '16px' }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Événement *</label>
                <select 
                  value={form.event_id} 
                  onChange={e => {
                    setForm({ ...form, event_id: e.target.value });
                    if (validationErrors.event_id) setValidationErrors(prev => { const n = {...prev}; delete n.event_id; return n; });
                  }} 
                  className="input-field"
                  style={validationErrors.event_id ? { borderColor: 'var(--brand-danger)', borderWidth: '2px' } : {}}
                >
                  <option value="">Sélectionner un événement...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
                {validationErrors.event_id && (
                  <p style={{ color: 'var(--brand-danger)', fontSize: '11px', marginTop: '4px' }}>{validationErrors.event_id}</p>
                )}
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nom du billet *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => {
                    setForm({ ...form, name: e.target.value });
                    if (validationErrors.name) setValidationErrors(prev => { const n = {...prev}; delete n.name; return n; });
                  }} 
                  placeholder="Ex: Pass VIP" 
                  className="input-field" 
                  style={validationErrors.name ? { borderColor: 'var(--brand-danger)', borderWidth: '2px' } : {}}
                />
                {validationErrors.name && (
                  <p style={{ color: 'var(--brand-danger)', fontSize: '11px', marginTop: '4px' }}>{validationErrors.name}</p>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 1.2fr', gap: '12px', alignItems: 'flex-start' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Prix ({form.description === 'HTG' ? 'HTG' : '$'})
                  </label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" min="0" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Devise</label>
                  <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: '10px', overflow: 'hidden', height: '42px' }}>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, description: 'USD' })}
                      style={{
                        flex: 1,
                        background: form.description === 'USD' ? 'var(--brand-primary)' : 'transparent',
                        color: form.description === 'USD' ? 'white' : 'var(--text-primary)',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, description: 'HTG' })}
                      style={{
                        flex: 1,
                        background: form.description === 'HTG' ? 'var(--brand-primary)' : 'transparent',
                        color: form.description === 'HTG' ? 'white' : 'var(--text-primary)',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderLeft: '1px solid var(--border-default)'
                      }}
                    >
                      HTG (G)
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Quantité</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input-field" min="1" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Mode de capacité *
                </label>
                <select value={form.allocation_mode} onChange={e => setForm({ ...form, allocation_mode: e.target.value })} className="input-field">
                  <option value="standard">Standard (Capacité de base)</option>
                  <option value="shared">Partagé (Consomme la capacité standard)</option>
                  <option value="expanded">Étendu (Ajoute de la capacité à l'événement)</option>
                </select>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  {form.allocation_mode === 'standard' && 'Ce billet représente la capacité de base de l\'événement. Sa disponibilité s\'ajuste automatiquement.'}
                  {form.allocation_mode === 'shared' && 'Ce billet réduit la disponibilité des billets Standard lors de l\'achat.'}
                  {form.allocation_mode === 'expanded' && 'Ce billet augmente la capacité totale de l\'événement sans affecter les billets Standard.'}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Avantages du billet standard (un par ligne)</label>
                <textarea value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} placeholder={'Repas inclus\nCadeaux\nAccès prioritaire'} className="input-field" rows={3} style={{ resize: 'vertical' }} />
              </div>

              {/* Pricing Tiers Section */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Variantes de Prix (Optionnel)</label>
                  <button onClick={addTier} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} /> Ajouter une variante
                  </button>
                </div>
                {form.pricing_tiers.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ajoutez des variantes si ce billet a plusieurs niveaux de prix (ex: VIP, Early Bird)</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {form.pricing_tiers.map((tier, idx) => (
                      <div key={tier.id} style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700' }}>Variante #{idx + 1}</span>
                          <button onClick={() => removeTier(tier.id)} style={{ background: 'none', border: 'none', color: 'var(--brand-danger)', cursor: 'pointer' }}><X size={14} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <input type="text" placeholder="Nom (Ex: VIP)" value={tier.name} onChange={e => updateTier(tier.id, 'name', e.target.value)} className="input-field" style={{ padding: '8px', fontSize: '13px' }} />
                          <input type="number" placeholder={`Prix (${form.description === 'HTG' ? 'HTG' : '$'})`} value={tier.price || ''} onChange={e => updateTier(tier.id, 'price', parseFloat(e.target.value) || 0)} className="input-field" style={{ padding: '8px', fontSize: '13px' }} />
                        </div>
                        <textarea placeholder="Avantages (un par ligne)" value={(tier.benefits || []).join('\n')} onChange={e => updateTier(tier.id, 'benefits', e.target.value.split('\n').filter(b => b.trim() !== ''))} className="input-field" rows={2} style={{ resize: 'vertical', padding: '8px', fontSize: '13px' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
                <button onClick={handleSave} disabled={actionLoading === 'save'} className="btn-primary" style={{ flex: 1, opacity: actionLoading === 'save' ? 0.7 : 1 }}>
                  {actionLoading === 'save' ? 'Chargement...' : editTicket ? 'Enregistrer' : 'Créer'}
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
            <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Supprimer ce billet ?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
              <button 
                onClick={() => handleDelete(deleteId)} 
                style={{ flex: 1, background: 'var(--brand-danger)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '600', cursor: 'pointer', opacity: actionLoading === deleteId ? 0.6 : 1 }}
              >
                {actionLoading === deleteId ? '...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
