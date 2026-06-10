import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Événements',
  description: 'Découvrez les conférences, ateliers et rencontres Ayibuzz Media aux Gonaïves et partout en Haïti.',
  openGraph: {
    title: 'Événements | Ayibuzz Media',
    description: 'Participez aux événements qui façonnent l\'avenir de la jeunesse haïtienne.',
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
