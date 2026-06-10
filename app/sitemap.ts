import { MetadataRoute } from 'next';
import { createPublicClient } from '@/utils/supabase/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ayibuzz-media.com';

  // Static routes
  const routes = [
    '',
    '/events',
    '/speakers',
    '/about',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Dynamic event routes
    const supabase = createPublicClient();
    const { data: events } = await supabase
      .from('events')
      .select('id, updated_at')
      .eq('published', true);

    if (events) {
      const eventRoutes = events.map((event) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
      return [...routes, ...eventRoutes];
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
