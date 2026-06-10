'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StreamPlayer from '@/components/StreamPlayer';
import { Radio, Users, Clock } from 'lucide-react';

function LiveStreamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch('/api/stream/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'live', eventId }),
        });

        if (res.status === 401) {
          router.push('/auth/login?redirect=/live' + (eventId ? `?eventId=${eventId}` : ''));
          return;
        }

        if (res.status === 403) {
          router.push('/unauthorized');
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Erreur inattendue.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setStreamUrl(data.streamUrl);
        setTicketCode(data.ticketCode);
        setEventName(data.eventName || null);
        setLoading(false);
      } catch {
        setError('Erreur de connexion au serveur.');
        setLoading(false);
      }
    }

    checkAccess();
  }, [router, eventId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-72px)] flex flex-col items-center justify-center bg-[var(--gradient-hero)] gap-lg">
        <div className="w-14 h-14 rounded-full border-3 border-[var(--border-subtle)] border-t-[var(--brand-accent)] animate-spin" />
        <p className="text-[var(--text-muted)] text-sm md:text-base">
          Vérification de votre accès...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[calc(100dvh-72px)] flex flex-col items-center justify-center bg-[var(--gradient-hero)] gap-md p-md md:p-lg">
        <div className="p-md px-lg rounded-xl bg-red-500/10 border border-red-500/20 text-[var(--brand-danger)] text-sm md:text-base font-semibold max-w-[400px] text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[var(--gradient-theater)] px-md md:px-lg py-xl md:py-2xl pb-2xl md:pb-3xl">
      {/* Hero Header */}
      <div className="max-w-[1100px] mx-auto mb-xl text-center">
        <div className="animate-fade-in mb-sm">
          <span className="inline-flex items-center gap-sm bg-red-500/15 border border-red-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-[var(--brand-danger)] uppercase tracking-wider">
            <Radio size={14} /> En direct maintenant
          </span>
        </div>
        <h1 className="font-display animate-fade-in-up text-2xl md:text-4xl font-black text-white mb-sm tracking-tight">
          {eventName || 'Ayibuzz'} — Live
        </h1>
        <p className="animate-fade-in-up animate-delay-100 text-white/50 text-sm md:text-base">
          Leve ansanm, Briye ansanm
        </p>
      </div>

      {/* Video Player */}
      <div className="animate-fade-in-up animate-delay-200">
        {streamUrl && (
          <StreamPlayer
            streamUrl={streamUrl}
            title={`${eventName || 'Ayibuzz'} — Flux en direct`}
            isLive
          />
        )}
      </div>

      {/* Info Cards */}
      <div className="max-w-[1100px] mx-auto mt-xl grid grid-cols-1 sm:grid-cols-2 gap-md">
        {ticketCode && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-md">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Users size={18} className="text-[var(--brand-success)]" />
            </div>
            <div>
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mb-0.5">
                Votre billet
              </p>
              <p className="text-sm md:text-base text-white font-bold tracking-wider">
                {ticketCode}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-md">
          <div className="w-10 h-10 rounded-lg bg-[var(--brand-accent)]/20 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-[var(--brand-accent)]" />
          </div>
          <div>
            <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mb-0.5">
              Événement
            </p>
            <p className="text-sm md:text-base text-white font-bold">
              {eventName || 'Ayibuzz'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveStreamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-72px)] flex flex-col items-center justify-center bg-[var(--gradient-hero)] gap-lg">
        <div className="w-14 h-14 rounded-full border-3 border-[var(--border-subtle)] border-t-[var(--brand-accent)] animate-spin" />
        <p className="text-[var(--text-muted)] text-sm md:text-base">
          Chargement...
        </p>
      </div>
    }>
      <LiveStreamContent />
    </Suspense>
  );
}
