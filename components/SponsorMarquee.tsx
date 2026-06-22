'use client';

import React from 'react';
import Image from 'next/image';
import { Sponsor } from './FeaturedSponsor';
import { sanitizeImageUrl } from '@/utils/image'; // Nettoyage des URLs locales de logos

interface SponsorMarqueeProps {
  sponsors: Sponsor[];
  speed?: 'slow' | 'medium' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
}

/**
 * Composant SponsorMarquee
 * Affiche un ruban défilant (marquee) horizontal infini de logos de sponsors.
 * L'animation est entièrement gérée en CSS accéléré matériellement pour garantir
 * une fluidité maximale (60 FPS) sans surcharge de calcul JavaScript.
 */
export default function SponsorMarquee({
  sponsors,
  speed = 'medium',
  direction = 'left',
  pauseOnHover = true,
}: SponsorMarqueeProps) {
  // Si aucun sponsor n'est disponible, on n'affiche rien pour éviter tout décalage
  if (!sponsors || sponsors.length === 0) return null;

  // Configuration de la durée de l'animation en secondes selon la vitesse demandée
  const animationDurationMap = {
    slow: '40s',
    medium: '25s',
    fast: '15s',
  };
  const duration = animationDurationMap[speed];

  // Choix de la classe d'animation correspondante selon la direction choisie
  const animationClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';

  // Pour un défilement continu et fluide sans coupure visuelle,
  // nous dupliquons la liste des logos afin qu'elle dépasse largement la largeur de l'écran.
  // Nous répétons la liste 4 fois pour garantir une couverture totale sur les écrans ultra-larges.
  const repetitions = Array.from({ length: 4 });

  return (
    <div className="sponsor-marquee-container relative w-full overflow-hidden py-8 bg-[#F3F2FC]/50 dark:bg-[#0A0A0E]/30 border-y border-slate-200/50 dark:border-slate-800/30">
      {/* Masque de dégradé transparent aux extrémités gauche et droite pour un rendu premium */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white dark:from-[#08090E] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white dark:from-[#08090E] to-transparent z-10 pointer-events-none" />

      {/* Conteneur de défilement animé */}
      <div 
        className={`flex whitespace-nowrap will-change-transform ${animationClass}`}
        style={{
          animationDuration: duration,
          animationPlayState: pauseOnHover ? 'running' : 'initial',
        }}
      >
        {/* Répétitions multiples pour le bouclage seamless */}
        {repetitions.map((_, repIdx) => (
          <div 
            key={`rep-${repIdx}`} 
            className="flex items-center justify-around shrink-0 min-w-full gap-12 px-6"
          >
            {sponsors.map((sponsor) => (
              <a
                key={`${sponsor.id}-rep-${repIdx}`}
                href={sponsor.website_url || '#'}
                target={sponsor.website_url ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="flex items-center justify-center h-12 w-36 md:w-44 transition-all duration-300 hover:scale-110 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 focus:outline-none focus:scale-110 group"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={sanitizeImageUrl(sponsor.logo_url)}
                    alt={sponsor.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100px, 150px"
                  />
                </div>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
