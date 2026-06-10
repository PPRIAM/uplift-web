'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle, Clock, Trash2, RefreshCw, Users, Mail, Calendar, Download } from 'lucide-react';
import { formatDateShort, formatDateTimeCompact } from '@/lib/dateUtils';

type Reservation = {
  id: string;
  full_name: string;
  email: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  confirmed_at: string | null;
  event_id: string;
  ticket_tier?: string;
  payment_method?: string;
  payment_status?: string;
  payment_proof_url?: string;
  payment_rejection_reason?: string;
  tickets?: {
    name: string;
    allocation_mode?: string;
    pricing_tiers?: any;
  } | null;
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    
    try {
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select('*, tickets:ticket_id(name, allocation_mode, pricing_tiers)')
        .order('created_at', { ascending: false });
        
      if (fetchError) {
        throw fetchError;
      }
      
      setReservations(data || []);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errDetails = err && typeof err === 'object' ? (err as Record<string, any>) : {};
      console.error('DIAGNOSTICS RESERVATIONS:', {
        message: errorMsg,
        code: errDetails.code,
        details: errDetails.details,
        hint: errDetails.hint
      });
      setError(`Erreur lors du chargement des réservations: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  const confirmReservation = async (id: string, action: 'approve' | 'reject', rejectReason: string = '') => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/reservations/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: id, action, rejection_reason: rejectReason })
      });
      if (!res.ok) throw new Error('Action failed');
      await fetchReservations();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert('Error updating reservation: ' + message);
    }
    setReviewModalOpen(false);
    setActionLoading(null);
  };

  const deleteReservation = async (id: string) => {
    const res = reservations.find(r => r.id === id);
    if (!res || !confirm('Supprimer cette réservation ?')) return;
    
    setActionLoading(id);
    const supabase = createClient();
    
    // 1. Delete the row First
    const { data, error } = await supabase.from('reservations').delete().eq('id', id).select();
    if (error || !data || data.length === 0) {
      alert(`Erreur : Impossible de supprimer la réservation. (${error?.message || 'Inconnue'})`);
      setActionLoading(null);
      return;
    }

    // 2. Decrement the count on the event ONLY if deletion succeeded
    await supabase.rpc('decrement_registered_count', { 
      event_id_param: res.event_id, 
      amount: res.quantity 
    });
    
    setReservations(prev => prev.filter(r => r.id !== id));
    setActionLoading(null);
  };

  const filtered = reservations.filter(r => {
    const matchSearch = r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = reservations.length;
  const confirmed = reservations.filter(r => r.status === 'confirmed').length;
  const pending = reservations.filter(r => r.status === 'pending').length;
  const totalSeats = reservations.reduce((sum, r) => sum + r.quantity, 0);

  const exportCSV = () => {
    const headers = ['Nom', 'Email', 'Catégorie', 'Places', 'Statut', 'Date inscription', 'Date confirmation'];
    const rows = filtered.map(r => {
      let tName = r.tickets?.name || 'Standard';
      if (r.ticket_tier && r.tickets?.pricing_tiers) {
        const tr = r.tickets.pricing_tiers.find((t: any) => t.id === r.ticket_tier);
        if (tr) tName += ` (${tr.name})`;
      }
      return [
        r.full_name, r.email, tName, r.quantity, r.status,
        formatDateTimeCompact(r.created_at),
        r.confirmed_at ? formatDateTimeCompact(r.confirmed_at) : '',
      ];
    });
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reservations_ayibuzz.csv'; a.click();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="badge badge-primary" style={{ display: 'inline-flex', marginBottom: '8px' }}>Administration</div>
          <h1 className="font-display" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Réservations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{total} inscriptions au total</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchReservations} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <button onClick={exportCSV} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <Download size={14} /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total inscriptions', value: total, icon: Users, color: 'var(--brand-primary)' },
          { label: 'Confirmées', value: confirmed, icon: CheckCircle, color: 'var(--brand-success)' },
          { label: 'En attente', value: pending, icon: Clock, color: 'var(--brand-warning)' },
          { label: 'Places réservées', value: totalSeats, icon: Calendar, color: 'var(--brand-secondary)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass" style={{ borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'pending', 'confirmed'] as const).map(s => {
            const labels = { all: 'Tous', pending: 'En attente', confirmed: 'Confirmés' };
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid', borderColor: statusFilter === s ? 'var(--brand-primary)' : 'var(--border-subtle)', background: statusFilter === s ? 'rgba(0,24,255,0.12)' : 'transparent', color: statusFilter === s ? 'var(--brand-secondary)' : 'var(--text-secondary)' }}>
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ border: '1px solid var(--brand-danger)', background: 'rgba(220,38,38,0.05)', color: 'var(--brand-danger)', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1 }}>{error}</div>
          <button onClick={fetchReservations} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Essayer à nouveau</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '20px', marginBottom: '8px' }}>📋</p>
          <p style={{ color: 'var(--text-muted)' }}>{error ? 'Impossible de charger les données.' : 'Aucune réservation trouvée.'}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Participant', 'Email', 'Billet', 'Places', 'Paiement', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((res, i) => (
                  <tr key={res.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{res.full_name}</p>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <a href={`mailto:${res.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <Mail size={12} /> {res.email}
                      </a>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                        {(() => {
                           let tName = res.tickets?.name || 'Accès Standard';
                           if (res.ticket_tier && res.tickets?.pricing_tiers) {
                             const tr = res.tickets.pricing_tiers.find((t: any) => t.id === res.ticket_tier);
                             if (tr) tName += ` (${tr.name})`;
                           }
                           return tName;
                        })()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center' }}>
                      {res.quantity}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {res.payment_method && res.payment_method !== 'free' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: res.payment_method === 'moncash' ? 'var(--color-moncash)' : 'var(--color-natcash)' }}>
                            {res.payment_method}
                          </span>
                          {res.payment_proof_url ? (
                            <button
                              onClick={() => { setSelectedRes(res); setReviewModalOpen(true); }}
                              style={{ border: 'none', background: 'var(--brand-primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Voir Preuve
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aucune preuve</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gratuit</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={res.status === 'confirmed' ? 'badge badge-success' : res.status === 'rejected' ? 'badge badge-error' : 'badge badge-warning'} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {res.status === 'confirmed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {res.status === 'confirmed' ? 'Confirmé' : res.status === 'rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {res.status === 'pending' && (!res.payment_method || res.payment_method === 'free') && (
                          <button
                            onClick={() => confirmReservation(res.id, 'approve')}
                            disabled={actionLoading === res.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', border: 'none', background: 'rgba(21,128,61,0.15)', color: 'var(--brand-success)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                          >
                            <CheckCircle size={12} /> Confirmer
                          </button>
                        )}
                        {res.status === 'pending' && res.payment_method && res.payment_method !== 'free' && (
                          <button
                            onClick={() => { setSelectedRes(res); setReviewModalOpen(true); }}
                            disabled={actionLoading === res.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', border: 'none', background: 'rgba(0,24,255,0.1)', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                          >
                            Vérifier Peman
                          </button>
                        )}
                        <button
                          onClick={() => deleteReservation(res.id)}
                          disabled={actionLoading === res.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '7px', border: 'none', background: 'rgba(220,38,38,0.1)', color: 'var(--brand-danger)', cursor: 'pointer', fontSize: '12px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>
          ← Retour au dashboard admin
        </Link>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedRes && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', maxWidth: '500px', width: '100%', position: 'relative' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>Vérification de Paiement</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>{selectedRes.full_name} ({selectedRes.email})</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Places</span>
                <p style={{ fontSize: '16px', fontWeight: '800' }}>{selectedRes.quantity}</p>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Méthode</span>
                <p style={{ fontSize: '16px', fontWeight: '800', textTransform: 'capitalize' }}>{selectedRes.payment_method}</p>
              </div>
            </div>

            {selectedRes.payment_proof_url && (
              <div style={{ marginBottom: '24px', textAlign: 'center', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                <img 
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment_proofs/${selectedRes.payment_proof_url.split('/').pop()}`} 
                  alt="Proof" 
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => confirmReservation(selectedRes.id, 'approve')}
                className="btn-primary" 
                style={{ flex: 1, background: 'var(--brand-success)' }}
              >
                Approuver
              </button>
              <button 
                onClick={() => confirmReservation(selectedRes.id, 'reject', prompt('Raison du rejet:', 'Preuve invalide') || 'Preuve invalide')}
                className="btn-secondary" 
                style={{ flex: 1, color: 'var(--brand-danger)', borderColor: 'rgba(220,38,38,0.2)' }}
              >
                Rejeter
              </button>
            </div>
            <button onClick={() => setReviewModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
