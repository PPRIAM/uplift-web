import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createPublicClient } from '@/utils/supabase/public';

// ─── Génération des métadonnées SEO par intervenant ──────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createPublicClient();

  const { data: speaker } = await supabase
    .from('speakers')
    .select('full_name, role, bio, profile_image')
    .eq('id', id)
    .single();

  // Intervenant introuvable → titre générique
  if (!speaker) return { title: 'Intervenant | Ayibuzz Media' };

  const title = `${speaker.full_name} | Ayibuzz Media`;
  const description =
    speaker.bio?.substring(0, 160) ||
    `${speaker.full_name} — ${speaker.role} sur Ayibuzz Media.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: speaker.profile_image
        ? [{ url: speaker.profile_image, width: 400, height: 400, alt: speaker.full_name }]
        : [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: speaker.profile_image ? [speaker.profile_image] : ['/images/og-image.jpg'],
    },
  };
}

// ─── Composant icône Twitter / X ─────────────────────────────────────────────
const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

// ─── Composant icône LinkedIn ─────────────────────────────────────────────────
const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// ─── Page de profil intervenant (Server Component) ────────────────────────────
export default async function SpeakerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createPublicClient();

  // Requête uniquement sur la table speakers (IDs canoniques)
  const { data: speaker } = await supabase
    .from('speakers')
    .select('id, full_name, role, bio, profile_image, company, twitter_handle, linkedin_url, published')
    .eq('id', id)
    .eq('published', true)
    .single();

  // Intervenant non trouvé ou non publié → 404
  if (!speaker) notFound();

  // Construction des URLs réseaux sociaux
  const linkedinHref = speaker.linkedin_url
    ? speaker.linkedin_url.startsWith('http')
      ? speaker.linkedin_url
      : `https://linkedin.com/in/${speaker.linkedin_url}`
    : null;

  const twitterHref = speaker.twitter_handle
    ? speaker.twitter_handle.startsWith('http')
      ? speaker.twitter_handle
      : `https://twitter.com/${speaker.twitter_handle.replace('@', '')}`
    : null;

  const avatarSrc =
    speaker.profile_image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(speaker.full_name)}`;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Orbes décoratifs d'arrière-plan */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-[rgba(14,26,212,0.05)] -top-[200px] -right-[200px]" />
        <div className="orb w-[400px] h-[400px] bg-[rgba(0,194,255,0.04)] top-[60%] -left-[150px]" />
      </div>

      <div className="relative max-w-[800px] mx-auto px-md md:px-lg py-xl md:py-2xl">
        {/* Bouton retour */}
        <Link
          href="/speakers"
          className="inline-flex items-center gap-xs text-[var(--text-muted)] no-underline text-sm mb-2xl hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft size={16} />
          Retour aux intervenants
        </Link>

        {/* Carte de profil principale */}
        <div className="card bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden animate-fade-in-up">

          {/* Bandeau supérieur gradient de marque */}
          <div className="h-32 bg-[var(--gradient-brand)] relative">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)',
              }}
            />
          </div>

          {/* Avatar chevauchant le bandeau */}
          <div className="px-xl md:px-2xl pb-xl md:pb-2xl">
            <div className="relative -mt-16 mb-lg w-32 h-32 rounded-full border-4 border-[var(--bg-card)] overflow-hidden shadow-lg bg-white">
              <Image
                src={avatarSrc}
                alt={speaker.full_name}
                fill
                priority
                sizes="128px"
                className="object-cover"
              />
            </div>

            {/* Nom, titre, entreprise */}
            <div className="mb-xl">
              <h1 className="font-display text-2xl md:text-4xl font-black text-[var(--text-primary)] leading-tight mb-2">
                {speaker.full_name}
              </h1>
              <p className="text-base font-bold text-[var(--brand-accent)] mb-1">
                {speaker.role}
              </p>
              {speaker.company && (
                <p className="text-sm text-[var(--text-muted)] font-medium">
                  {speaker.company}
                </p>
              )}
            </div>

            {/* Liens réseaux sociaux */}
            {(linkedinHref || twitterHref) && (
              <div className="flex items-center gap-sm mb-xl flex-wrap">
                {linkedinHref && (
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-xs px-md py-2 glass rounded-xl border border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-accent)] hover:border-[var(--brand-accent)] transition-colors no-underline"
                  >
                    <LinkedinIcon size={16} />
                    LinkedIn
                  </a>
                )}
                {twitterHref && (
                  <a
                    href={twitterHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-xs px-md py-2 glass rounded-xl border border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-accent)] hover:border-[var(--brand-accent)] transition-colors no-underline"
                  >
                    <TwitterIcon size={16} />
                    Twitter / X
                  </a>
                )}
              </div>
            )}

            {/* Séparateur */}
            {speaker.bio && (
              <div className="border-t border-[var(--border-subtle)] pt-xl">
                <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-md">
                  À propos
                </h2>
                <p className="text-[var(--text-secondary)] leading-relaxed text-base whitespace-pre-line">
                  {speaker.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA candidature */}
        <div className="mt-xl text-center">
          <p className="text-sm text-[var(--text-muted)] mb-sm">
            Tu veux partager ta voix sur Ayibuzz Media ?
          </p>
          <Link
            href="/speakers/apply"
            className="inline-flex items-center gap-xs text-sm font-bold text-[var(--brand-accent)] no-underline hover:underline"
          >
            Soumettre ta candidature →
          </Link>
        </div>
      </div>
    </div>
  );
}
