import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez la mission d\'Ayibuzz Media : propulser la jeunesse haïtienne et créer un espace de réflexion et d\'action aux Gonaïves.',
  openGraph: {
    title: 'À propos | Ayibuzz Media',
    description: 'Notre mission pour la jeunesse d\'Haïti.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
