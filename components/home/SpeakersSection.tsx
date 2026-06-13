'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  role: string;
  image: string;
}

interface SpeakersSectionProps {
  activeSpeakers: Speaker[];
  hasFeaturedEvent: boolean;
  fallbackEventId: string;
}

// Section des Intervenants UPLIFT 2.0 - Présentation avec cartes alternées et design asymétrique
export default function SpeakersSection({ activeSpeakers, hasFeaturedEvent, fallbackEventId }: SpeakersSectionProps) {
  return (
    <section className="py-24 px-6 bg-[#F8FAFC] border-t-[1.5px] border-[#0F172A]">
      <div className="max-w-[1200px] mx-auto xl:pl-24 font-body">
        
        {/* En-tête de section */}
        <div className="text-center mb-16">
          <div className="badge badge-primary inline-flex mb-3">{hasFeaturedEvent ? "Nos voix" : "Intervenants"}</div>
          <h2 className="font-heading text-[clamp(32px,4vw,44px)] font-bold tracking-tight text-[#0F172A]">
            {hasFeaturedEvent ? "Intervenants" : "Intervenants Passés"}
          </h2>
          <p className="text-[#64748B] text-base mt-3 mx-auto leading-relaxed">
            Des personnalités inspirantes qui partagent leur expertise et leur vision pour Haïti.
          </p>
        </div>

        {/* Grille de cartes alternant sombre/clair */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeSpeakers.map((speaker, index) => {
            // Détermination du style (pair = sombre #334155, impair = blanc #FFFFFF)
            const isDark = index % 2 === 0;

            return (
              <div 
                key={speaker.id}
                className={`animate-fade-in-up card border-[1.5px] border-[#0F172A] rounded-[16px] py-12 px-8 text-center shadow-[4px_4px_0px_#0F172A] transition-all duration-300 relative overflow-hidden animate-delay-${(index + 1) * 100} ${
                  isDark 
                    ? 'card-dark bg-[#334155] text-white' 
                    : 'bg-white text-[#0F172A]'
                }`}
              >
                {/* Photo de profil de l'intervenant */}
                <div 
                  className="w-[100px] h-[100px] rounded-full overflow-hidden mx-auto mb-6 border-2 border-white shadow-[0_0_0_5px_rgba(14,26,212,0.1)] relative aspect-square shrink-0 z-10"
                >
                  <Image 
                    alt={speaker.name} 
                    loading="lazy" 
                    fill 
                    sizes="100px"
                    className="object-cover object-[center_15%]" 
                    src={speaker.image}
                  />
                </div>

                {/* Nom */}
                <h3 className={`text-2xl font-bold font-heading mb-2 z-10 relative ${
                  isDark ? 'text-white' : 'text-[#0F172A]'
                }`}>
                  {speaker.name}
                </h3>

                {/* Rôle professionnel */}
                <p className={`text-[13px] font-bold tracking-wider uppercase leading-relaxed max-w-[220px] mx-auto z-10 relative ${
                  isDark ? 'text-slate-300' : 'text-[#64748B]'
                }`}>
                  {speaker.role}
                </p>

                {/* Motif filaire décoratif discret en arrière-plan */}
                <div className={`absolute left-0 right-0 bottom-2 mx-auto w-16 h-16 pointer-events-none opacity-[0.06] ${
                  isDark ? 'text-white' : 'text-[#0E1AD4]'
                }`}>
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" />
                    <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bouton d'action pour voir l'ensemble des intervenants */}
        {activeSpeakers.length > 3 || !hasFeaturedEvent ? (
          <div className="text-center mt-12">
            <Link
              className="btn-secondary no-underline text-sm py-3.5 px-8 inline-flex items-center gap-2"
              href={hasFeaturedEvent ? `/events/${fallbackEventId}` : "/speakers"}
            >
              {hasFeaturedEvent ? "Voir Plus" : "Tous les intervenants passés"}
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : null}

      </div>
    </section>
  );
}
