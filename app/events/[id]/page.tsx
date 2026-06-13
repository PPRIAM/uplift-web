import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/utils/supabase/public';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, ChevronLeft } from 'lucide-react';
import { formatTime } from '@/lib/dateUtils';
import EventClient from './EventClient';

export const dynamic = 'force-dynamic';

// ─── Metadata Generation ─────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createPublicClient();
  
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single();
  
  if (!event) return { title: 'Événement non trouvé' };

  return {
    title: `${event.name} | Ayibuzz Media`,
    description: event.tagline || event.description?.substring(0, 160),
    openGraph: {
      title: event.name,
      description: event.tagline,
      images: [event.cover_image || '/images/og-image.jpg'],
    },
  };
}

// ─── Session Card (Server) ─────────────────────────────────────────────────────
function SessionCard({ session }: { session: any }) {
  const isConference = session.type === 'conference';
  const primarySpeaker = session.session_speakers?.[0]?.speakers;

  return (
    <div className="glass p-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl">
      <div className="flex gap-md items-start">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isConference ? 'bg-[rgba(14,26,212,0.1)]' : 'bg-emerald-500/10'}`}>
          {isConference ? <Clock size={14} className="text-[var(--brand-accent)]" /> : <Users size={14} className="text-[var(--brand-success)]" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-sm mb-1">
            <span className={isConference ? 'badge badge-primary' : 'badge badge-success'} style={{ fontSize: '10px' }}>
              {isConference ? 'Conférence' : 'Atelier'}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {session.start_time ? formatTime(session.start_time) : ''}
            </span>
          </div>
          <h3 className="text-base font-extrabold mb-2 text-[var(--text-primary)]">{session.title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-md">{session.description}</p>
          
          {primarySpeaker && (
            <div className="text-left flex items-center gap-sm border-t border-[var(--border-subtle)] pt-3">
              <div className="w-7 h-7 rounded-full overflow-hidden border-[1.5px] border-white shadow-[0_0_0_3px_rgba(14, 26, 212, 0.04),0_1px_3px_rgba(0,0,0,0.1)] shrink-0 aspect-square relative">
                <Image src={primarySpeaker.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${primarySpeaker.full_name}`} 
                  alt={primarySpeaker.full_name}
                  fill
                  sizes="28px"
                  className="object-cover object-[center_15%]" />
              </div>
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">{primarySpeaker.full_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();

  const [
    { data: event },
    { data: tickets },
    { data: sessions }
  ] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase.from('tickets').select('*').eq('event_id', id).eq('available', true),
    supabase.from('sessions').select(`
       *,
       session_speakers (
         speakers (*)
       )
     `).eq('event_id', id).order('start_time')
  ]);

  if (!event) notFound();

  // 4. Extract unique speakers
  const spksMap = new Map();
  if (sessions) {
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      if (s.session_speakers) {
        for (let j = 0; j < s.session_speakers.length; j++) {
          const ss = s.session_speakers[j];
          if (ss.speakers) {
            spksMap.set(ss.speakers.id, ss.speakers);
          }
        }
      }
    }
  }
  const speakers = Array.from(spksMap.values());

  return (
    <div className="max-w-[1100px] mx-auto px-md md:px-lg py-xl md:py-2xl pb-2xl md:pb-3xl">
      <Link href="/events" className="inline-flex items-center gap-xs text-[var(--text-muted)] no-underline text-sm mb-xl hover:text-[var(--text-primary)] transition-colors">
        <ChevronLeft size={16} /> Retour
      </Link>

      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">
          <div className="relative rounded-2xl overflow-hidden h-[300px] mb-xl bg-[var(--gradient-brand)]">
            {event.cover_image && (
              <Image
                src={event.cover_image}
                alt={event.name}
                fill
                priority
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 to-slate-950/65 flex flex-col justify-end p-lg md:p-xl">
              <h1 className="font-display text-2xl md:text-4xl font-black text-white mb-2 leading-[1.1]">{event.name}</h1>
              <p className="text-white/90 text-base md:text-lg italic">{event.tagline}</p>
            </div>
          </div>

          <section className="mb-2xl">
            <h2 className="font-heading text-xl md:text-2xl font-bold mb-md text-[var(--text-primary)]">À propos</h2>
            <div className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description?.replace(/\n/g, '<br/>') }} />
          </section>

          {sessions && sessions.length > 0 && (
            <section className="mb-2xl">
              <h2 className="font-heading text-xl md:text-2xl font-bold mb-md text-[var(--text-primary)]">Programme</h2>
              <div className="flex flex-col gap-md">
                {sessions.map(s => <SessionCard key={s.id} session={s} />)}
              </div>
            </section>
          )}

          {speakers.length > 0 && (
            <section className="mb-2xl">
              <h2 className="font-heading text-xl md:text-2xl font-bold mb-md text-[var(--text-primary)]">Intervenants</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                {speakers.map(sp => (
                  <div key={sp.id} className="card text-center p-md md:p-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <div className="w-20 h-20 rounded-full border-3 border-[var(--border-subtle)] relative mx-auto mb-md overflow-hidden">
                      <Image src={sp.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sp.full_name}`} 
                        alt={sp.full_name}
                        fill
                        sizes="80px"
                        className="object-cover" />
                    </div>
                    <h3 className="text-sm md:text-base font-extrabold mb-1 text-[var(--text-primary)]">{sp.full_name}</h3>
                    <p className="text-xs md:text-sm text-[var(--brand-secondary)] font-semibold">{sp.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (Client Component) */}
        <EventClient event={event} tickets={tickets || []} sessions={sessions || []} speakers={speakers} />
      </div>
    </div>
  );
}
