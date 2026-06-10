import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de la plateforme Ayibuzz Media.',
};

/**
 * Page de la Politique de Confidentialité.
 * Présente de manière lisible les engagements légaux sur la gestion des données utilisateurs.
 */
export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-md md:px-lg py-xl md:py-2xl">
      <div className="badge badge-primary inline-flex mb-md">Légal</div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-lg">
        Politique de confidentialité
      </h1>

      <div className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
        <p className="mb-md">
          <strong>Date d&apos;entrée en vigueur :</strong> 1er mai 2026
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          1. Informations collectées
        </h2>
        <p className="mb-md">
          Ayibuzz Media collecte les informations suivantes lors de ton inscription : nom complet, adresse email. Ces informations sont nécessaires pour la gestion de ton compte et la réservation d&apos;événements.
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          2. Utilisation des données
        </h2>
        <p className="mb-md">
          Tes données personnelles sont utilisées pour : la gestion de ton compte, l&apos;envoi de confirmations de réservation, la communication d&apos;informations sur nos événements et contenus, et l&apos;amélioration de nos services.
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          3. Partage des données
        </h2>
        <p className="mb-md">
          Nous ne vendons ni ne partageons tes données personnelles avec des tiers, sauf lorsque cela est nécessaire pour fournir nos services (hébergement, envoi d&apos;emails) ou lorsque la loi l&apos;exige.
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          4. Sécurité
        </h2>
        <p className="mb-md">
          Nous utilisons des mesures de sécurité conformes aux standards de l&apos;industrie pour protéger tes données, y compris le chiffrement des données en transit et au repos.
        </p>

        <h2 className="font-heading text-lg md:text-xl font-bold mt-xl mb-sm text-[var(--text-primary)]">
          5. Tes droits
        </h2>
        <p className="mb-md">
          Tu as le droit d&apos;accéder, de corriger ou de supprimer tes données personnelles à tout moment. Pour exercer ces droits, contacte-nous à{' '}
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

