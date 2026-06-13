'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface Speaker {
  name: string;
  role: string;
  image: string;
}

interface Session {
  id: string;
  type: string;
  name: string;
  description: string;
  speaker: Speaker;
}

interface SessionsSectionProps {
  tagline: string;
  activeSessions: Session[];
  fallbackEventId: string;
  hasFeaturedEvent: boolean;
}

// Section des Sessions UPLIFT 2.0 - Présentation du programme avec cartes alternées asymétriques
export default function SessionsSection({
  tagline,
  activeSessions,
  fallbackEventId,
  hasFeaturedEvent,
}: SessionsSectionProps) {
  if (!hasFeaturedEvent) {
    return (
      <section className="py-24 px-6 max-w-[1200px] mx-auto xl:pl-24 font-body">
        <div className="text-center mb-16">
          <div className="badge badge-primary inline-flex mb-3">About Uplift</div>
          <h2 className="font-heading text-[clamp(32px,4vw,44px)] font-bold tracking-tight text-[#0F172A]">
            Mission & Vision
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold font-heading mb-4">Notre Mission</h3>
            <p className="text-[#64748B] leading-relaxed">
              Connecter, inspirer et propulser la nouvelle génération haïtienne à travers des événements et du contenu à forte valeur ajoutée.
            </p>
          </div>
          <div className="card card-dark">
            <h3 className="text-xl font-bold font-heading mb-4 text-white">Impact Communautaire</h3>
            <p className="text-slate-300 leading-relaxed">
              Créer des espaces sûrs d&apos;apprentissage et de partage où les idées se transforment en actions tangibles pour l&apos;avenir.
            </p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-24 px-6 max-w-[1200px] mx-auto xl:pl-24 font-body">
      
      {/* En-tête de la section */}
      <div className="text-center mb-16">
        <div className="badge badge-primary inline-flex mb-3">Sessions phares</div>
        <h2 className="font-heading text-[clamp(32px,4vw,44px)] font-bold tracking-tight text-[#0F172A]">
          Programme UPLIFT 2.0
        </h2>
        <p className="text-[#64748B] text-lg mt-3 max-w-[650px] mx-auto leading-relaxed">
          {tagline}
        </p>
      </div>

      {/* Grille de cartes asymétrique / alternance de couleurs (ardoise / blanc) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {activeSessions.map((session, index) => {
          // Détermination du style (pair = sombre #334155, impair = blanc #FFFFFF)
          const isDark = index % 2 === 0;
          
          return (
            <div 
              key={session.id}
              className={`card animate-fade-in-up p-8 animate-delay-${(index + 1) * 100} border-[1.5px] border-[#0F172A] shadow-[4px_4px_0px_#0F172A] relative overflow-hidden flex flex-col min-h-[380px] transition-all duration-300 ${
                isDark 
                  ? 'card-dark bg-[#334155] text-white' 
                  : 'bg-white text-[#0F172A]'
              }`}
            >
              {/* Contenu de la carte */}
              <div className="relative z-10 flex-1 flex flex-col">
                
                {/* Badge de type de session */}
                <div className="mb-4">
                  <span className={`badge py-1 px-3 text-[10px] font-extrabold uppercase tracking-widest ${
                    isDark 
                      ? 'bg-white text-[#0E1AD4] border-[#0F172A]' 
                      : 'bg-[#0E1AD4] text-white border-[#0F172A]'
                  }`}>
                    {session.type}
                  </span>
                </div>

                {/* Titre de la session */}
                <h3 className={`text-xl font-bold mb-3 font-heading ${
                  isDark ? 'text-white' : 'text-[#0F172A]'
                }`}>
                  {session.name}
                </h3>

                {/* Description de la session */}
                <p className={`text-[14px] leading-relaxed mb-6 ${
                  isDark ? 'text-slate-200' : 'text-[#64748B]'
                }`}>
                  {session.description}
                </p>
                
                {/* Intervenant (épinglé en bas de carte) */}
                <div className={`flex items-center gap-3 border-t pt-4 mt-auto ${
                  isDark ? 'border-white/10' : 'border-slate-100'
                }`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-[0_0_0_4px_rgba(14,26,212,0.1)] relative aspect-square shrink-0">
                    <Image 
                      alt={session.speaker.name} 
                      loading="lazy" 
                      fill 
                      sizes="40px"
                      className="object-cover object-[center_15%]" 
                      src={session.speaker.image}
                    />
                  </div>
                  <div>
                    <p className={`text-[13px] font-bold ${
                      isDark ? 'text-white' : 'text-[#0F172A]'
                    }`}>
                      {session.speaker.name}
                    </p>
                    <p className={`text-[11px] font-medium ${
                      isDark ? 'text-slate-300' : 'text-[#64748B]'
                    }`}>
                      {session.speaker.role}
                    </p>
                  </div>
                </div>

              </div>

              {/* Dessin technique filaire signature en arrière-plan */}
              <div className={`absolute right-4 bottom-4 w-20 h-20 pointer-events-none opacity-[0.08] ${
                isDark ? 'text-white' : 'text-[#0E1AD4]'
              }`}>
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>

            </div>
          );
        })}
      </div>

      {/* Bouton d'action pour voir l'événement */}
      <div className="text-center">
        <Link 
          className="btn-primary no-underline text-sm py-3.5 px-8 inline-flex items-center gap-2" 
          href={`/events/${fallbackEventId}`}
        >
          Voir l&apos;événement complet
          <ChevronRight size={16} />
        </Link>
      </div>

    </section>
  );
}
