'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CtaBannerProps {
  fallbackEventId: string;
  hasFeaturedEvent: boolean;
  eventName?: string;
  eventDateText?: string;
  locationName?: string;
  cityName?: string;
  tagline?: string;
}

// Composant CtaBanner UPLIFT 2.0 - Bannière d'appel à l'action de fin de page
export default function CtaBanner({ 
  fallbackEventId, 
  hasFeaturedEvent,
  eventName,
  eventDateText,
  locationName,
  cityName,
  tagline
}: CtaBannerProps) {
  return (
    <section className="py-24 px-6 bg-[#F8FAFC] border-t-[1.5px] border-[#0F172A]">
      <div className="max-w-[800px] mx-auto text-center font-body">
        
        {/* Conteneur principal de la bannière avec angles de 16px et ombre plate */}
        <div className="bg-[#334155] border-[1.5px] border-[#0F172A] rounded-[16px] p-[clamp(32px,6vw,64px)] relative overflow-hidden shadow-[4px_4px_0px_#0F172A]">
          
          {/* Lignes techniques filaires à faible opacité en arrière-plan */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] text-white">
            <svg viewBox="0 0 800 300" fill="none" className="w-full h-full">
              <circle cx="700" cy="150" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="100" cy="150" r="80" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="150" x2="800" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Titre de la bannière CTA */}
            <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-bold text-white mb-4 tracking-tight uppercase">
              {hasFeaturedEvent ? (tagline || eventName || "Leve ansanm, Briye ansanm") : "Rejoignez la communauté"}
            </h2>
            
            <p className="text-slate-200 text-base mb-8 leading-relaxed">
              {hasFeaturedEvent ? (
                <>
                  {[eventDateText, locationName, cityName].filter(Boolean).join(' • ')}<br />
                  Places limitées
                </>
              ) : (
                <>
                  Créez un compte pour découvrir les futurs événements et participer à nos initiatives.
                </>
              )}
            </p>
            
            {/* Bouton de réservation (Blanc avec texte Bleu Cobalt pour les surfaces sombres) */}
            <Link 
              className="inline-flex items-center gap-2 bg-white text-[#0E1AD4] border-[1.5px] border-[#0F172A] rounded-[12px] py-3.5 px-8 text-sm font-bold no-underline transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0F172A] shadow-[3px_3px_0px_#0F172A]" 
              href={hasFeaturedEvent ? `/events/${fallbackEventId}` : "/auth/login"}
            >
              {hasFeaturedEvent ? "Réserver ma place" : "Créer un compte"}
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
