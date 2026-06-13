'use client';

import { Award, Heart, Globe, TrendingUp } from 'lucide-react';

interface WhyUpliftSectionProps {
  hasFeaturedEvent: boolean;
  eventMetadata: any;
}

const renderDescription = (value: any, defaultText: string) => {
  if (!value) return defaultText;
  
  let list: string[] = [];
  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === 'string') {
    if (value.startsWith('[')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        list = value.split('\n').map(s => s.trim()).filter(Boolean);
      }
    } else {
      list = value.split('\n').map(s => s.trim()).filter(Boolean);
    }
  }

  const filteredList = list.filter(item => item.trim().length > 0);
  if (filteredList.length === 0) return defaultText;

  return (
    <ul className="list-disc pl-4 space-y-1.5 mt-2 text-left">
      {filteredList.map((item: string, idx: number) => (
        <li key={idx} className="text-xs md:text-sm leading-relaxed">{item}</li>
      ))}
    </ul>
  );
};

// Section "Pourquoi UPLIFT" UPLIFT 2.0 - Présentation des propositions de valeur en grille asymétrique
export default function WhyUpliftSection({ hasFeaturedEvent, eventMetadata }: WhyUpliftSectionProps) {
  if (!hasFeaturedEvent) {
    return (
      <section className="py-24 px-6 max-w-[1200px] mx-auto xl:pl-24 font-body">
        <div className="text-center mb-16">
          <div className="badge badge-primary inline-flex mb-3">FAQ</div>
          <h2 className="font-heading text-[clamp(32px,4vw,44px)] font-bold tracking-tight text-[#0F172A]">
            Questions Fréquentes
          </h2>
        </div>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {/* FAQ Placeholder */}
          <details className="card group cursor-pointer">
            <summary className="font-bold text-lg font-heading">Comment créer un compte ?</summary>
            <p className="mt-4 text-[#64748B]">Cliquez sur &quot;Créer un compte&quot; en haut à droite de la page et suivez les instructions.</p>
          </details>
          <details className="card group cursor-pointer">
            <summary className="font-bold text-lg font-heading">Comment participer aux événements ?</summary>
            <p className="mt-4 text-[#64748B]">Inscrivez-vous sur la page de l&apos;événement. Vous recevrez un billet électronique pour accéder à l&apos;événement.</p>
          </details>
        </div>
      </section>
    );
  }

  const assets = [
    {
      icon: Award,
      title: 'Bénéfices',
      description: renderDescription(eventMetadata?.benefits, 'Des intervenants engagés qui partagent des perspectives réelles sur les défis de la jeunesse haïtienne.'),
    },
    {
      icon: Heart,
      title: 'Objectifs',
      description: renderDescription(eventMetadata?.objectives, 'Des espaces de réflexion pratique pour explorer, comprendre et agir dans un contexte de crise.'),
    },
    {
      icon: Globe,
      title: 'Résultats attendus',
      description: renderDescription(eventMetadata?.outcomes, 'Connectez-vous avec des jeunes engagés, des leaders en devenir et des professionnels inspirants.'),
    },
    {
      icon: TrendingUp,
      title: 'Public cible',
      description: renderDescription(eventMetadata?.audience, "L'accès à l'inspiration et aux idées ne devrait pas avoir de prix. UPLIFT 2.0 est ouvert à tous."),
    },
  ];

  return (
    <section className="py-24 px-6 max-w-[1200px] mx-auto xl:pl-24 font-body">
      
      {/* En-tête de section */}
      <div className="text-center mb-16">
        <div className="badge badge-primary inline-flex mb-3">Pourquoi participer ?</div>
        <h2 className="font-heading text-[clamp(32px,4vw,44px)] font-bold tracking-tight text-[#0F172A]">
          Why Attend This Event?
        </h2>
        <p className="text-[#64748B] text-base mt-3 max-w-[520px] mx-auto leading-relaxed">
          Découvrez les bénéfices et les objectifs de cet événement incontournable.
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
              <div className={`text-sm leading-relaxed z-10 relative ${
                isDark ? 'text-slate-200' : 'text-[#64748B]'
              }`}>
                {item.description}
              </div>

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
