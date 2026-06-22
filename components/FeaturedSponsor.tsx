'use client';

import React from 'react';
import Image from 'next/image';
import { sanitizeImageUrl } from '@/utils/image'; // Importation de l'utilitaire de nettoyage d'URL

// Interface définissant la structure de données d'un sponsor
export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  tier?: string; // ex: 'platinum', 'gold', 'silver'
  is_featured?: boolean;
}

interface FeaturedSponsorProps {
  sponsor: Sponsor;
}

/**
 * Composant FeaturedSponsor
 * Affiche un sponsor mis en avant avec des effets visuels haut de gamme (glassmorphism et spotlight).
 * L'effet de survol et de révélation est géré uniquement via du CSS accéléré matériellement.
 */
export default function FeaturedSponsor({ sponsor }: FeaturedSponsorProps) {
  const displayTier = sponsor.tier
    ? sponsor.tier.toUpperCase()
    : 'PARTENAIRE';

  return (
    <div className="featured-sponsor-card relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0E]/90 p-8 md:p-12 backdrop-blur-xl transition-all duration-500 hover:border-[#6842FF]/50 shadow-2xl group w-full max-w-4xl mx-auto">
      {/* Orbe lumineux de fond pour l'effet de projecteur (Spotlight) */}
      <div
        className="sponsor-glow-orb absolute w-[350px] h-[350px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(104, 66, 255, 0.25) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          transform: 'scale(0.8) translate3d(0,0,0)',
        }}
      />

      {/* Deuxième orbe à l'extrémité opposée pour un effet de profondeur de couleur */}
      <div
        className="sponsor-glow-orb-secondary absolute w-[300px] h-[300px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(90, 69, 255, 0.15) 0%, transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          transform: 'scale(0.8) translate3d(0,0,0)',
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Partie gauche : Métadonnées du sponsor */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3 group-hover:text-[#FFAC00] transition-colors duration-300">
            {sponsor.name}
          </h3>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed transition-all duration-300 group-hover:text-slate-200">
            {sponsor.description || "Fier partenaire d'AYIBUZZ MÉDIA. Ensemble, propulsons la créativité et le leadership de la jeunesse haïtienne."}
          </p>

          {/* Bouton de redirection révélé au survol */}
          {sponsor.website_url && (
            <a
              href={sponsor.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6842FF] group-hover:text-white transition-all duration-300 border-b border-[#6842FF]/30 hover:border-white pb-1"
            >
              Visiter le site web
              <svg
                className="w-3 h-3 transform translate-y-[-1px] group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}
        </div>

        {/* Partie droite : Logo du sponsor */}
        <div className="flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 w-48 h-48 md:w-56 md:h-56 backdrop-blur-md transition-all duration-500 group-hover:scale-105 group-hover:bg-white/10 group-hover:border-white/20 will-change-transform">
          <div className="relative w-full h-full md:grayscale md:opacity-60 grayscale-0 opacity-100 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
            <Image
              src={sanitizeImageUrl(sponsor.logo_url)}
              alt={`Logo de ${sponsor.name}`}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 150px, 200px"
              priority={sponsor.is_featured}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
