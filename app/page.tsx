import { createPublicClient } from '@/utils/supabase/public';
import HomePageClient from '@/components/HomePageClient';

export const revalidate = 86400;

export default async function HomePage() {
  const supabase = createPublicClient();

  // Fetch upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('id, name, tagline, description, date_time, location_name, city, registered_count, capacity, cover_image')
    .eq('published', true)
    .gt('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(3);

  // Fetch featured event
  const { data: featuredEvents, error: featuredErr } = await supabase
    .from('events')
    .select('id, name, tagline, description, date_time, end_date_time, location_name, location_details, city, registered_count, capacity, cover_image, is_featured')
    .eq('published', true)
    .eq('is_featured', true)
    .limit(1);

  if (featuredErr) {
    console.error('Error fetching featured event:', featuredErr);
  }

  const featuredEvent = featuredEvents && featuredEvents.length > 0 ? featuredEvents[0] : null;

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
    />
  );
}
