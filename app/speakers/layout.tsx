import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intervenants',
  description: 'Rencontrez les voix engagées et les leaders qui partagent leur vision lors de Ayibuzz Media.',
  openGraph: {
    title: 'Intervenants | Ayibuzz Media',
    description: 'Plusieurs voix engagées pour la jeunesse haïtienne.',
  },
};

export default function SpeakersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
