'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  CheckCircle, XCircle, Clock, Trash2, ExternalLink, 
  Search, RefreshCw, Mail, UserPlus, Eye, EyeOff 
} from 'lucide-react';
import { promoteToSpeaker, updateApplicationStatus, deleteApplication, toggleApplicationVisibility, getSpeakerApplications } from './actions';
import { formatDateShort } from '@/lib/dateUtils';
import { fr } from 'date-fns/locale';

const TwitterIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;

export default function AdminSpeakerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [hideApproved, setHideApproved] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const res = await getSpeakerApplications();
    if (res.error) {
      alert(res.error);
      setApplications([]);
    } else {
      setApplications(res.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch = 
        a.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        a.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        a.role?.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
      const isHiddenByToggle = hideApproved && a.status === 'approved';
      
      return matchesSearch && matchesStatus && !isHiddenByToggle;
    });
  }, [applications, debouncedSearch, filterStatus, hideApproved]);

  const handleApprove = async (id: string) => {
    if (!confirm('Voulez-vous approuver cette candidature et créer un profil intervenant ?')) return;
    setActionLoading(id);
    const res = await promoteToSpeaker(id);
    if (res.error) {
      alert(res.error);
      await fetchApplications(); // Sync back if there was partial success
    } else {
      if (res.message) alert(res.message);
      // Update local state immediately for better UX
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', published: false } : a));
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm('Voulez-vous rejeter cette candidature ?')) return;
    setActionLoading(id);
    const res = await updateApplicationStatus(id, 'rejected');
    if (res.error) {
      alert(res.error);
    } else {
      await fetchApplications();
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Action irréversible. Supprimer définitivement cette candidature ?')) return;
    setActionLoading(id);
    const res = await deleteApplication(id);
    if (res.error) {
      alert(res.error);
    } else {
      await fetchApplications();
    }
    setActionLoading(null);
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    setActionLoading(id);
    const res = await toggleApplicationVisibility(id, !current);
    if (res.error) {
      alert(res.error);
    } else {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, published: !current } : a));
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Approuvée</span>;
      case 'rejected': return <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Rejetée</span>;
      default: return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> En attente</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>Candidatures Intervenants</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gérez les propositions de conférences pour Ayibuzz Media</p>
        </div>
        <button onClick={fetchApplications} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: '380px', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Rechercher par nom, email..." 
            className="input-field" 
            style={{ paddingLeft: '38px' }} 
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field"
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)', userSelect: 'none' }}>
          <input 
            type="checkbox" 
            checked={hideApproved} 
            onChange={e => setHideApproved(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--brand-secondary)' }}
          />
          Masquer les approuvées
        </label>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
          Chargement des candidatures...
        </div>
      ) : filtered.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Aucune candidature trouvée.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filtered.map(app => (
            <div key={app.id} className="stat-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0, overflow: 'hidden', border: '2px solid var(--border-default)' }}>
                    {app.profile_image ? (
                      <img src={app.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      app.full_name?.[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{app.full_name}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--brand-secondary)', fontWeight: '600', marginBottom: '2px' }}>{app.role}</p>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={13} /> {app.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {formatDateShort(app.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {app.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(app.id)} 
                        disabled={actionLoading === app.id}
                        className="btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <UserPlus size={14} /> Approuver
                      </button>
                      <button 
                        onClick={() => handleReject(app.id)} 
                        disabled={actionLoading === app.id}
                        className="btn-secondary" 
                        style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--brand-danger)' }}
                      >
                        Rejeter
                      </button>
                    </>
                  )}
                  {app.status === 'approved' && (
                    <button 
                      onClick={() => handleToggleVisibility(app.id, app.published)} 
                      disabled={actionLoading === app.id}
                      className={app.published ? "btn-secondary" : "btn-primary"}
                      style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: app.published ? 'var(--brand-secondary)' : 'white' }}
                      title={app.published ? "Masquer du site public" : "Afficher sur le site public"}
                    >
                      {app.published ? <Eye size={16} /> : <EyeOff size={16} />}
                      {app.published ? "Public" : "Masqué"}
                    </button>
                  )}
                  {app.status !== 'pending' && (
                     <button 
                      onClick={() => handleDelete(app.id)} 
                      disabled={actionLoading === app.id}
                      style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--brand-danger)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Biographie / Résumé</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{app.bio}</p>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                {app.twitter_handle && (
                  <a href={`https://twitter.com/${app.twitter_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-brand">
                    <TwitterIcon /> @{app.twitter_handle.replace('@', '')}
                  </a>
                )}
                {app.linkedin_url && (
                  <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-brand">
                    <LinkedinIcon /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
