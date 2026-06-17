import { Metadata } from 'next';
import { createPublicClient } from '@/utils/supabase/public';
import HomePageClient from '@/components/HomePageClient';

export const dynamic = 'force-dynamic';

// ─── SEO Adaptatif : basé sur l'événement vedette, fallback Ayibuzz ───────────
export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicClient();

  // Chercher l'événement vedette actif
  const { data: featured } = await supabase
    .from('events')
    .select('name, tagline, description, cover_image')
    .eq('published', true)
    .eq('is_featured', true)
    .limit(1)
    .single();

  // Si aucun événement vedette, tenter le prochain événement à venir
  let event = featured;
  if (!event) {
    const { data: next } = await supabase
      .from('events')
      .select('name, tagline, description, cover_image')
      .eq('published', true)
      .gt('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })
      .limit(1)
      .single();
    event = next;
  }

  // Fallback : métadonnées de marque Ayibuzz Media
  if (!event) {
    return {
      title: 'Ayibuzz Media | Leve ansanm, Briye ansanm',
      description:
        "Ayibuzz Media — la plateforme media de la nouvelle génération haïtienne. Découvre les voix, les histoires et les événements qui façonnent Haïti.",
      openGraph: {
        title: 'Ayibuzz Media | Leve ansanm, Briye ansanm',
        description:
          "La scène digitale d'Haïti : la prochaine génération crée, partage et amplifie les histoires qui façonnent notre avenir.",
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Ayibuzz Media | Leve ansanm, Briye ansanm',
        description:
          "La scène digitale d'Haïti. Découvre les voix, les histoires et les événements qui façonnent notre avenir.",
        images: ['/images/og-image.jpg'],
      },
    };
  }

  // Métadonnées dynamiques calquées sur l'événement vedette
  const title = `${event.name} | Ayibuzz Media`;
  const description =
    event.tagline ||
    event.description?.substring(0, 160) ||
    "Découvre le prochain événement Ayibuzz Media.";
  const ogImage = event.cover_image || '/images/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: event.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function HomePage() {
  const supabase = createPublicClient();

  // Fetch upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('id, name, tagline, description, date_time, end_date_time, location_name, location_details, city, registered_count, capacity, cover_image, is_live')
    .eq('published', true)
    .gt('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(3);

  // Fetch featured event
  const { data: featuredEvents, error: featuredErr } = await supabase
    .from('events')
    .select('id, name, tagline, description, date_time, end_date_time, location_name, location_details, city, registered_count, capacity, cover_image, is_featured, is_live')
    .eq('published', true)
    .eq('is_featured', true)
    .limit(1);

  if (featuredErr) {
    console.error('Error fetching featured event:', featuredErr);
  }

  let featuredEvent = featuredEvents && featuredEvents.length > 0 ? featuredEvents[0] : null;

  // Fallback to the nearest upcoming event if no featured event exists
  if (!featuredEvent && upcomingEvents && upcomingEvents.length > 0) {
    featuredEvent = { ...upcomingEvents[0], is_featured: false };
  }

  let eventSessions = null;
  if (featuredEvent) {
    const { data: sessions, error: sessionsErr } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        description,
        type,
        start_time,
        session_speakers (
          speakers (
            id,
            full_name,
            role,
            profile_image
          )
        )
      `)
      .eq('event_id', featuredEvent.id)
      .order('start_time', { ascending: true })
      .limit(20);

    if (sessionsErr) {
      console.error('Error fetching sessions:', sessionsErr);
    }
    eventSessions = sessions;
  }

  // Fetch event-specific speakers if featured event exists
  let eventSpeakers = null;
  if (featuredEvent) {
    const { data: speakersData, error: speakersErr } = await supabase
      .from('event_speakers')
      .select(`
        speaker_id,
        speakers (
          id,
          full_name,
          role,
          bio,
          profile_image
        )
      `)
      .eq('event_id', featuredEvent.id);

    if (speakersErr) {
      console.error('Error fetching event speakers:', speakersErr);
    } else if (speakersData) {
      eventSpeakers = speakersData
        .map((item: any) => item.speakers)
        .filter((speaker: any) => speaker !== null);
    }
  }

  // Fetch featured speakers (general site speakers)
  const { data: featuredSpeakers } = await supabase
    .from('speakers')
    .select('id, full_name, role, bio, profile_image, published')
    .eq('published', true)
    .order('full_name')
    .limit(5);

  // Fetch count of published events
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  // Fetch count of published speakers
  const { count: totalSpeakers } = await supabase
    .from('speakers')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  return (
    <HomePageClient
      upcomingEvents={upcomingEvents}
      featuredSpeakers={featuredSpeakers}
      totalEvents={totalEvents}
      totalSpeakers={totalSpeakers}
      featuredEvent={featuredEvent}
      eventSessions={eventSessions}
      eventSpeakers={eventSpeakers}
    />
  );
}
