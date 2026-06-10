'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Activity, MapPin, Star } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/dateUtils';

interface FeaturedEventProps {
  loading: boolean;
  featuredEvent: any;
}

export function FeaturedEvent({ loading, featuredEvent }: FeaturedEventProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Neo-Gauge Math
  const fillPct = useMemo(() => {
    if (!featuredEvent) return 0;
    const registered = featuredEvent.registered_count || 0;
    const capacity = featuredEvent.capacity || 1;
    return Math.round((registered / capacity) * 100);
  }, [featuredEvent]);

  if (loading) {
    return (
      <div className="bg-white border-2 border-black rounded-[18px] p-8 shadow-[4px_4px_0px_0px_#000000] mb-8 animate-pulse h-48" />
    );
  }

  if (!featuredEvent) {
    return (
      <div
        className="bg-white border-2 border-black rounded-[18px] p-8 text-center shadow-[4px_4px_0px_0px_#000000] mb-8 animate-fade-slide-up"
        style={{ animationDelay: '320ms' }}
      >
        <Calendar size={48} className="mx-auto mb-4 text-black/40" />
        <h3 className="font-sans font-bold text-lg text-black mb-2">aucun événement vedette sélectionné</h3>
        <p className="text-black/60 text-sm max-w-md mx-auto mb-5 font-medium">
          Aucun événement n'est configuré en vedette. Marquez un événement avec le drapeau "vedette" dans l'espace de gestion pour activer cette zone.
        </p>
        <Link
          href="/admin/events"
          className="inline-block bg-[#0E1AD4] text-white border-2 border-black px-5 py-2.5 text-xs font-extrabold rounded-lg shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-200"
        >
          Aller aux Événements
        </Link>
      </div>
    );
  }

  return (
    <div
      className="bg-white border-2 border-black rounded-[18px] p-6 shadow-[4px_4px_0px_0px_#000000] mb-8 relative animate-fade-slide-up"
      style={{ animationDelay: '320ms' }}
    >
      {/* Badge Vedette Néo-Brutaliste UPLIFT */}
      <div className="absolute top-4 right-4 bg-[#E0E7FF] text-[#0E1AD4] text-xs font-bold border-2 border-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1.5px_1.5px_0px_#000000] transition-all">
        <Star size={12} fill="currentColor" /> événement vedette
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">

        {/* Image de couverture ou placeholder neutre */}
        <div className="w-full lg:w-44 h-28 rounded-xl border-2 border-black bg-gray-100 overflow-hidden flex-shrink-0 relative shadow-[2px_2px_0px_#000000]">
          {featuredEvent.cover_image ? (
            <img
              src={featuredEvent.cover_image}
              alt={featuredEvent.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black/30 bg-[#F8FAFC]">
              <Activity size={28} />
            </div>
          )}
        </div>

        {/* Infos de l'événement */}
        <div className="flex-1 min-w-0">
          <h2 className="font-sans font-extrabold text-xl text-black truncate mb-1">
            {featuredEvent.name}
          </h2>
          {featuredEvent.tagline && (
            <p className="text-[#64748B] text-xs italic mb-2 font-medium">
              "{featuredEvent.tagline}"
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-xs font-mono text-black/70 font-bold">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-[#0E1AD4]" /> {formatDate(featuredEvent.date_time)} à {formatTime(featuredEvent.date_time)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-[#0E1AD4]" /> {featuredEvent.city}, {featuredEvent.location_name}
            </span>
          </div>

          {/* Jauge de Remplissage : UPLIFT Neo-Gauge */}
          <div className="mt-4 max-w-xl">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="font-sans text-black">jauge de remplissage ({fillPct}%)</span>
              <span className="font-mono text-black/75">{featuredEvent.registered_count} / {featuredEvent.capacity} places</span>
            </div>

            {/* Structure de la jauge */}
            <div
              className="h-7 w-full bg-[#F8FAFC] border-2 border-black rounded-lg relative cursor-pointer shadow-[2px_2px_0px_#000000]"
              style={{ overflow: 'visible' }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {/* Remplissage hachuré avec motif oblique noir et fond bleu cobalt clair */}
              <div
                className="h-full rounded-l-md border-r-2 border-black transition-all duration-700 ease-out motion-reduce:transition-none"
                style={{
                  width: `${Math.min(100, fillPct)}%`,
                  backgroundColor: '#E0E7FF',
                  backgroundImage: 'repeating-linear-gradient(45deg, #000000 0px, #000000 2px, transparent 2px, transparent 10px)'
                }}
              />

              {/* Macaron circulaire overlapping qui dépasse par le haut en bleu cobalt */}
              <div
                className="absolute top-0 -translate-y-1/2 bg-[#0E1AD4] text-white border-2 border-black rounded-full w-9 h-9 flex items-center justify-center shadow-[2px_2px_0px_#000000] font-mono text-[10px] font-extrabold hover:scale-105 active:scale-95 transition-transform duration-150"
                style={{
                  left: `calc(${Math.min(100, fillPct)}% - 18px)`,
                  zIndex: 10
                }}
              >
                {fillPct}%
              </div>

              {/* Info-bulle (Tooltip) au survol */}
              {showTooltip && (
                <div
                  className="absolute bottom-full mb-3 bg-black text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border-2 border-black shadow-[3px_3px_0px_#000000] animate-fade-in"
                  style={{
                    left: `${Math.min(100, fillPct)}%`,
                    transform: 'translateX(-50%)',
                    zIndex: 20
                  }}
                >
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                  {featuredEvent.registered_count} réservés / {featuredEvent.capacity} places max
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bouton d'édition rapide */}
        <div className="flex-shrink-0">
          <Link
            href="/admin/events"
            className="inline-block bg-white border-2 border-black px-4 py-2 text-xs font-bold rounded-lg shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
          >
            éditer l'événement vedette
          </Link>
        </div>

      </div>
    </div>
  );
}
