'use client';

import { Award, Heart, Globe, TrendingUp } from 'lucide-react';

// Section "Pourquoi UPLIFT" UPLIFT 2.0 - Présentation des propositions de valeur en grille asymétrique
export default function WhyUpliftSection() {
  const assets = [
    {
      icon: Award,
      title: 'Conférences de haut niveau',
      description: 'Des intervenants engagés qui partagent des perspectives réelles sur les défis de la jeunesse haïtienne.',
    },
    {
      icon: Heart,
      title: 'Ateliers interactifs',
      description: 'Des espaces de réflexion pratique pour explorer, comprendre et agir dans un contexte de crise.',
    },
    {
      icon: Globe,
      title: 'Réseau & Communauté',
      description: 'Connectez-vous avec des jeunes engagés, des leaders en devenir et des professionnels inspirants.',
    },
    {
      icon: TrendingUp,
      title: 'Gratuit & Accessible',
      description: "L'accès à l'inspiration et aux idées ne devrait pas avoir de prix. UPLIFT 2.0 est ouvert à tous.",
    },
  ];

  return (
    <section className="py-24 px-6 max-w-[1200px] mx-auto xl:pl-24 font-body">
      
      {/* En-tête de section */}
      <div className="text-center mb-16">
        <div className="badge badge-primary inline-flex mb-3">Pourquoi UPLIFT ?</div>
        <h2 className="font-heading text-[clamp(32px,4vw,44px)] font-bold tracking-tight text-[#0F172A]">
          Plus qu&apos;un événement
        </h2>
        <p className="text-[#64748B] text-base mt-3 max-w-[520px] mx-auto leading-relaxed">
          UPLIFT 2.0 est un espace structuré de réflexion, d&apos;action et de connexion pour la jeunesse haïtienne.
        </p>
      </div>

      {/* Grille Bento à 4 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((item, index) => {
          const IconComponent = item.icon;
          // Alternance des couleurs de cartes (pair = sombre #334155, impair = blanc #FFFFFF)
          const isDark = index % 2 === 0;

          return (
            <div 
              key={index}
              className={`card animate-fade-in-up p-8 border-[1.5px] border-[#0F172A] rounded-[16px] shadow-[4px_4px_0px_#0F172A] transition-all duration-300 relative overflow-hidden flex flex-col min-h-[300px] animate-delay-${(index + 1) * 100} ${
                isDark 
                  ? 'bg-[#334155] text-white' 
                  : 'bg-white text-[#0F172A]'
              }`}
            >
              {/* Conteneur d'icône */}
              <div 
                className={`w-12 h-12 rounded-[12px] border-[1.5px] border-[#0F172A] flex items-center justify-center mb-6 z-10 relative ${
                  isDark 
                    ? 'bg-white text-[#0E1AD4]' 
                    : 'bg-[#0E1AD4]/10 text-[#0E1AD4]'
                }`}
              >
                <IconComponent size={22} />
              </div>

              {/* Titre de l'atout */}
              <h3 className={`text-lg font-bold font-heading mb-3 z-10 relative ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}>
                {item.title}
              </h3>

              {/* Description de l'atout */}
              <p className={`text-sm leading-relaxed z-10 relative ${
                isDark ? 'text-slate-200' : 'text-[#64748B]'
              }`}>
                {item.description}
              </p>

              {/* Petit motif filaire décoratif à l'arrière-plan */}
              <div className={`absolute right-2 bottom-2 w-14 h-14 pointer-events-none opacity-[0.05] ${
                isDark ? 'text-white' : 'text-[#0E1AD4]'
              }`}>
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
