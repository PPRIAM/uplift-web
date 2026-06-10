import Link from 'next/link';
import { ShieldX, Ticket, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accès refusé',
  description: 'Vous n\'avez pas de billet valide pour accéder au flux en direct.',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center p-md md:p-lg bg-[var(--gradient-hero)] relative">
      {/* Decorative orbs */}
      <div className="orb w-[500px] h-[500px] bg-red-500/5 -top-[100px] -right-[100px]" />
      <div className="orb w-[300px] h-[300px] bg-[rgba(14,26,212,0.05)] -bottom-[50px] -left-[50px]" />

      <div className="glass-strong animate-fade-in rounded-2xl p-lg md:p-xl w-full max-w-[520px] relative z-[1] text-center">
        {/* Icon */}
        <div className="w-[72px] h-[72px] rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mx-auto mb-lg">
          <ShieldX size={32} color="var(--brand-danger)" />
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-black mb-sm text-[var(--text-primary)]">
          Accès Non Autorisé
        </h1>

        <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed mb-lg max-w-[380px] mx-auto">
          Vous n&apos;avez pas de billet valide pour accéder au flux en direct.
          Réservez votre place pour profiter de l&apos;événement Ayibuzz Media.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-sm items-center">
          <Link
            href="/events"
            className="btn-primary no-underline text-sm md:text-base py-3.5 px-8 inline-flex items-center gap-sm"
          >
            <Ticket size={18} /> Réserver un billet <ArrowRight size={16} />
          </Link>

          <Link
            href="/"
            className="btn-ghost no-underline text-xs md:text-sm text-[var(--text-muted)]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Help note */}
        <div className="mt-lg p-4 bg-[rgba(14,26,212,0.04)] rounded-xl border border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Vous avez déjà un billet ? Assurez-vous d&apos;être connecté avec
            la même adresse e-mail utilisée lors de la réservation.
          </p>
        </div>
      </div>
    </div>
  );
}
