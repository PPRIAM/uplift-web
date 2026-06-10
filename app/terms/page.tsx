import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation',
  description: 'Conditions d\'utilisation de la plateforme Ayibuzz Media.',
};

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-md md:px-lg py-xl md:py-2xl">
      <div className="badge badge-primary inline-flex mb-md">Légal</div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-lg">
        Conditions d&apos;utilisation
      </h1>

      <div className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
        <p className="mb-md">
          <strong>Date d&apos;entrée en vigueur :</strong> 1er mai 2026
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          1. Acceptation des conditions
        </h2>
        <p className="mb-md">
          En accédant à la plateforme Ayibuzz Media (ayibuzz-media.com), tu acceptes d&apos;être lié(e) par les présentes conditions d&apos;utilisation. Si tu n&apos;acceptes pas ces conditions, merci de ne pas utiliser notre plateforme.
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          2. Description du service
        </h2>
        <p className="mb-md">
          Ayibuzz Media est une plateforme media dédiée à la jeunesse haïtienne, offrant des événements en direct, du contenu original et une communauté de créateurs. Nous nous réservons le droit de modifier ou d&apos;interrompre tout aspect du service à tout moment.
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          3. Comptes utilisateurs
        </h2>
        <p className="mb-md">
          Tu es responsable du maintien de la confidentialité de ton compte et de ton mot de passe. Tu acceptes de nous informer immédiatement de toute utilisation non autorisée de ton compte.
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          4. Propriété intellectuelle
        </h2>
        <p className="mb-md">
          Tout le contenu publié sur Ayibuzz Media, y compris les textes, images, vidéos et logos, est protégé par les lois sur la propriété intellectuelle. Toute reproduction non autorisée est strictement interdite.
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          5. Contact
        </h2>
        <p className="mb-md">
          Pour toute question concernant ces conditions, contacte-nous à{' '}
          <a href="mailto:contact@ayibuzz.com" className="text-[var(--brand-accent)] hover:underline">contact@ayibuzz.com</a>.
        </p>
      </div>

      <div className="mt-2xl">
        <Link href="/" className="btn-secondary no-underline text-sm py-2.5 px-5">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
