'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  eventName: string;
  eventDescription: string;
  organizerName: string;
  cityName: string;
  tagline: string;
  fallbackEventId: string;
  eventDateText: string;
  locationName: string;
  inscritsCount: number;
  placesRestantes: number;
  isAyibuzzMedia?: boolean;
  isLive?: boolean;
  coverImage?: string;
}

// Section Hero d'accueil UPLIFT 2.0 (conception asymétrique et compacte)
export default function HeroSection({
  eventName,
  eventDescription,
  organizerName,
  cityName,
  tagline,
  fallbackEventId,
  eventDateText,
  locationName,
  inscritsCount,
  placesRestantes,
  isAyibuzzMedia = false,
  isLive = false,
  coverImage,
}: HeroSectionProps) {
  return (
    <section
      className="min-h-[90dvh] lg:min-h-[100dvh] flex items-center bg-[#F8FAFC] relative overflow-hidden pt-24 pb-12 px-6 font-body"
    >
      {/* Subtiles lignes de grille structurelles asymétriques en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#0E1AD4_1px,transparent_1px),linear-gradient(to_bottom,#0E1AD4_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="max-w-[1200px] mx-auto w-full relative z-10 lg:pl-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Bloc de gauche : Contenu textuel et actions (7 colonnes) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Badge de l'organisateur et de la ville (et Badge En direct si Live) */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="animate-fade-in-up inline-flex items-center gap-2 bg-[#0E1AD4]/10 border border-[#0E1AD4]/20 rounded-full py-1.5 px-4">
                <div className="w-2 h-2 rounded-full bg-[#0E1AD4] animate-pulse-glow"></div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#0E1AD4] font-body">
                  {isAyibuzzMedia ? "AYIBUZZ MEDIA" : `${organizerName} • ${cityName}`}
                </span>
              </div>
              {isLive && (
                <div className="animate-fade-in-up inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full py-1.5 px-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-red-600 font-body">
                    En direct
                  </span>
                </div>
              )}
            </div>
            {/* Titre héroïque principal en font-display de l'Agent 2 */}
            <h1 className="font-display animate-fade-in-up animate-delay-100 text-[clamp(42px,5vw,72px)] font-black text-[#0F172A] tracking-[-0.03em] leading-[0.95] mb-4 uppercase">
              {isAyibuzzMedia ? "Leve ansanm, Briye ansanm" : eventName}
            </h1>

            {/* Slogan de l'événement */}
            <p className="animate-fade-in-up animate-delay-200 text-[clamp(18px,2vw,24px)] text-[#334155] mb-6 font-heading font-semibold tracking-tight leading-snug">
              {isAyibuzzMedia ? "Rejoignez la plus grande communauté." : tagline}
            </p>

            {/* Manifeste court (limité pour éviter la distraction) */}
            <p className="animate-fade-in-up animate-delay-300 text-base md:text-lg text-[#64748B] leading-relaxed mb-8 max-w-[540px]">
              {isAyibuzzMedia ? "Inspirer, Créer, Connecter. Ayibuzz Média est votre plateforme pour découvrir des événements, apprendre des leaders, et forger l'avenir d'Haïti." : eventDescription}
            </p>

            {/* Boutons d'action principaux en cobalt */}
            <div className="animate-fade-in-up animate-delay-400 flex flex-wrap gap-4 items-center">
              {!isAyibuzzMedia ? (
                <Link
                  className="btn-primary no-underline text-sm py-3 px-6 inline-flex items-center gap-2"
                  href={`/events/${fallbackEventId}`}
                >
                  Rejoindre l&apos;élan
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  className="btn-primary no-underline text-sm py-3 px-6 inline-flex items-center gap-2"
                  href="/auth/login"
                >
                  Créer un compte
                  <ArrowRight size={16} />
                </Link>
              )}
              <Link
                className="btn-secondary no-underline text-sm py-3 px-6 text-[#0F172A] border-[#0F172A] hover:bg-[#0E1AD4]/5"
                href="/events"
              >
                {isAyibuzzMedia ? "Parcourir les événements passés" : "En savoir plus"}
              </Link>
            </div>

            {/* Détails logistiques rapides sous forme de barre aérée */}
            {!isAyibuzzMedia && (
              <div className="animate-fade-in-up animate-delay-500 flex flex-wrap gap-x-6 gap-y-3 mt-12 pt-6 border-t border-slate-200 w-full max-w-[580px]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
                  <Calendar size={15} className="text-[#0E1AD4]" />
                  {eventDateText}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
                  <MapPin size={15} className="text-[#0E1AD4]" />
                  {locationName}
                </div>
                {/*
                <div className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
                  <Users size={15} className="text-[#0E1AD4]" />
                  <span className="font-mono">{inscritsCount}</span> inscrits • <span className="font-mono">{placesRestantes}</span> places restantes
                </div>
                */}
              </div>
            )}

          </div>

          {/* Bloc de droite : Illustration filaire technique dynamique OU Image de couverture (5 colonnes) */}
          <div className="lg:col-span-5 hidden lg:flex justify-center items-center relative select-none w-full">
            {coverImage ? (
              <div className="w-full max-w-[440px] aspect-[4/3] relative rounded-[16px] overflow-hidden border-[1.5px] border-[#0F172A] shadow-[6px_6px_0px_#0F172A] animate-float">
                <Image
                  src={coverImage}
                  alt={eventName}
                  fill
                  sizes="440px"
                  priority
                  className="object-cover animate-delay-200"
                />
              </div>
            ) : (
              /* L'illustration filaire à cercles concentriques dynamiques cobalt */
              <div className="w-full max-w-[420px] aspect-square relative animate-float">
                <svg className="w-full h-full text-[#0E1AD4]" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Lignes de repère techniques */}
                  <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-45" />
                  <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-45" />
                  <line x1="72" y1="72" x2="328" y2="328" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 6" className="opacity-30" />
                  <line x1="72" y1="328" x2="328" y2="72" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 6" className="opacity-30" />

                  {/* Cercles concentriques */}
                  <circle cx="200" cy="200" r="170" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" className="animate-[spin_60s_linear_infinite] opacity-60" />
                  <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="1.5" className="opacity-75" />
                  <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="8 4" className="animate-[spin_30s_linear_infinite_reverse] opacity-80" />
                  <circle cx="200" cy="200" r="50" stroke="currentColor" strokeWidth="1.5" className="opacity-90" />
                  <circle cx="200" cy="200" r="15" stroke="currentColor" strokeWidth="2" />

                  {/* Points de pivot cinétiques */}
                  <circle cx="200" cy="70" r="4.5" fill="currentColor" />
                  <circle cx="330" cy="200" r="4.5" fill="currentColor" />
                  <circle cx="200" cy="330" r="4.5" fill="currentColor" />
                  <circle cx="70" cy="200" r="4.5" fill="currentColor" />
                  <circle cx="200" cy="200" r="4" fill="#F8FAFC" />
                </svg>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
