import { Metadata } from 'next';
import { createPublicClient } from '@/utils/supabase/public';
import EventsClient from './EventsClient';

export const metadata: Metadata = {
  title: 'Événements',
  description: "Découvre et participe aux prochains événements Ayibuzz Media. Conférences, ateliers et espaces de réflexion pour la jeunesse haïtienne.",
};

export const revalidate = 3600;

export default async function EventsPage() {
  const supabase = createPublicClient();
  
  const { data: events } = await supabase
    .from('events')
    .select('id, name, tagline, description, date_time, location_name, city, registered_count, capacity, cover_image, tags, published')
    .eq('published', true);

  return (
    <div className="relative overflow-hidden w-full bg-[var(--bg-base)]">
      {/* Floating background orbs */}
      <div className="orb animate-float w-[700px] h-[700px] bg-[rgba(0,24,255,0.06)] -top-[200px] -right-[150px] [animation-duration:8s]"></div>
      <div className="orb animate-float w-[400px] h-[400px] bg-[rgba(0,194,255,0.04)] top-[40%] -left-[100px] [animation-duration:10s] [animation-delay:2s]"></div>

      <div className="max-w-[1200px] mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center max-w-[800px] mx-auto">
          <div className="badge badge-primary mb-4 inline-flex">Événements</div>
          <h1 className="font-display text-4xl md:text-6.5xl font-black tracking-tight leading-[1.05] text-[var(--text-primary)] mb-6 uppercase">
            Nos événements
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-[650px] mx-auto leading-relaxed font-medium">
            Participe aux prochaines conférences, espaces de réflexion et ateliers organisés par Ayibuzz Media.
          </p>
        </div>

        <EventsClient initialEvents={events || []} />
      </div>
    </div>
  );
}
