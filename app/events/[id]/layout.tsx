import { Metadata, ResolvingMetadata } from 'next';
import { createClient } from '@/utils/supabase/client';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('name, tagline, description')
    .eq('id', id)
    .single();

  if (!event) return { title: 'Événement non trouvé' };

  return {
    title: event.name,
    description: event.tagline || event.description?.substring(0, 160),
    openGraph: {
      title: `${event.name} | Ayibuzz Media`,
      description: event.tagline || event.description?.substring(0, 160),
      type: 'article',
    },
  };
}

export default function EventDetailLayout({ children }: Props) {
  return <>{children}</>;
}
