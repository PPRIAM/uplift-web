'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, ScanLine, User, MapPin, ArrowLeft } from 'lucide-react';

export default function ScannerPage() {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // { success: boolean, message: string, details?: any }
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input for hardware scanners
  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  const validateTicket = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResult({ success: true, message: data.message, details: data.details });
        setTicketId(''); // Clear for next scan only if success
      } else {
        setResult({ success: false, message: data.error, details: data.details });
      }
    } catch (err: unknown) {
      setResult({ success: false, message: 'Erreur réseau.' });
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '600' }}>
          <ArrowLeft size={18} /> Retour Admin
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,24,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--brand-primary)' }}>
          <ScanLine size={32} />
        </div>
        <h1 className="font-display" style={{ fontSize: '28px', fontWeight: '900' }}>Scanner de Billets</h1>
        <p style={{ color: 'var(--text-muted)' }}>Scannez ou entrez l'ID du billet</p>
      </div>

      <form onSubmit={validateTicket} style={{ marginBottom: '32px' }}>
        <input 
          ref={inputRef}
          type="text" 
          value={ticketId}
          onChange={e => setTicketId(e.target.value)}
          placeholder="Entrez l'ID du billet (UUID)..."
          disabled={loading}
          style={{
            width: '100%', padding: '20px', borderRadius: '16px', border: '2px solid var(--border-default)',
            fontSize: '18px', textAlign: 'center', fontWeight: '700', letterSpacing: '1px',
            background: 'var(--bg-elevated)', outline: 'none', transition: 'all 0.2s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
          autoFocus
        />
        <button 
          type="submit" 
          disabled={!ticketId.trim() || loading}
          className="btn-primary"
          style={{ width: '100%', marginTop: '16px', padding: '18px', fontSize: '18px' }}
        >
          {loading ? 'Validation...' : 'Valider'}
        </button>
      </form>

      {/* RESULT CARD */}
      {result && (
        <div style={{ 
          background: result.success ? 'rgba(21,128,61,0.08)' : 'rgba(220,38,38,0.08)',
          border: `2px solid ${result.success ? 'var(--brand-success)' : 'var(--brand-danger)'}`,
          borderRadius: '16px', padding: '32px', textAlign: 'center',
          animation: 'fadeInUp 0.3s ease-out forwards'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            {result.success ? (
              <CheckCircle size={64} color="var(--brand-success)" />
            ) : (
              <XCircle size={64} color="var(--brand-danger)" />
            )}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: result.success ? 'var(--brand-success)' : 'var(--brand-danger)', marginBottom: '8px' }}>
            {result.message}
          </h2>
          
          {result.details && result.details.reservations && (
            <div style={{ marginTop: '24px', textAlign: 'left', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
                <User size={18} color="var(--brand-primary)" /> {result.details.reservations.full_name}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <ScanLine size={16} /> ID: {result.details.ticket_code}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <MapPin size={16} /> {result.details.reservations.events.name}
              </p>
            </div>
          )}
          
          <button 
            onClick={() => { setResult(null); setTicketId(''); }}
            className="btn-secondary"
            style={{ marginTop: '24px', width: '100%', border: 'none', background: 'transparent' }}
          >
            Scanner un autre
          </button>
        </div>
      )}

    </div>
  );
}
