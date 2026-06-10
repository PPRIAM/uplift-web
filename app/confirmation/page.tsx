'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle, XCircle, Clock, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const error = searchParams.get('error');
  const eventId = searchParams.get('event');
  const name = searchParams.get('name');

  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (!eventId) return;
    const supabase = createClient();
    supabase.from('events').select('name, date_time, location_name, city').eq('id', eventId).single().then(({ data }) => setEvent(data));
  }, [eventId]);

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (status === 'confirmed') return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{
        width: '90px', height: '90px', borderRadius: '50%',
        background: 'var(--brand-success)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 28px', boxShadow: '0 0 50px rgba(21,128,61,0.3)',
      }}>
        <CheckCircle size={44} color="white" />
      </div>

      <div className="badge badge-success" style={{ display: 'inline-flex', marginBottom: '16px' }}>Inscription confirmée</div>

      <h1 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '12px' }}>
        {name ? `Bienvenue, ${name} !` : 'Votre place est confirmée !'}
      </h1>

      <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
        Votre participation à <strong style={{ color: 'var(--text-primary)' }}>{event?.name || 'Ayibuzz Media'}</strong> est maintenant officielle. 🎉
      </p>

      {event && (
        <div className="glass" style={{ borderRadius: '16px', padding: '20px 24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <Calendar size={16} color="var(--brand-primary)" />
            <span><strong>{formatDateTime(event.date_time)}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <MapPin size={16} color="var(--brand-primary)" />
            <span>{event.location_name}, {event.city}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {eventId && (
          <Link href={`/events/${eventId}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Voir l'événement <ArrowRight size={16} />
          </Link>
        )}
        <Link href="/events" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Tous les événements
        </Link>
      </div>
    </div>
  );

  // ── ALREADY CONFIRMED ──────────────────────────────────────────────────────
  if (status === 'already_confirmed') return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(14,26,212,0.15)', border: '2px solid rgba(14,26,212,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <Clock size={36} color="var(--brand-primary)" />
      </div>
      <h1 className="font-display" style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px' }}>
        Déjà confirmé !
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '28px' }}>
        Cette inscription est déjà confirmée. Votre place est bien réservée pour Ayibuzz Media.
      </p>
      <Link href={eventId ? `/events/${eventId}` : '/events'} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        Voir l'événement <ArrowRight size={16} />
      </Link>
    </div>
  );

  // ── ERROR ──────────────────────────────────────────────────────────────────
  const errorMessages: Record<string, string> = {
    invalid: 'Le lien de confirmation est invalide.',
    not_found: 'Ce lien de confirmation est introuvable ou a déjà été utilisé.',
    server: 'Une erreur serveur est survenue. Veuillez réessayer.',
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(220,38,38,0.1)', border: '2px solid rgba(220,38,38,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <XCircle size={36} color="var(--brand-danger)" />
      </div>
      <h1 className="font-display" style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px' }}>
        Lien invalide
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '28px' }}>
        {errorMessages[error || ''] || 'Ce lien de confirmation est invalide ou expiré.'}
      </p>
      <Link href="/events" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        Retour aux événements <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Chargement...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
