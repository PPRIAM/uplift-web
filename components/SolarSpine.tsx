'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

// Composant SolarSpine d'UPLIFT 2.0 - Ligne de force verticale asymétrique
export default function SolarSpine() {
  const [isLive, setIsLive] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calcul de la progression du scroll pour le marqueur cinétique
    const handleScroll = () => {
      if (!trackRef.current) return;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = window.scrollY / totalScroll;
      trackRef.current.style.transform = `scaleY(${progress})`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Vérification du statut "En direct" dans Supabase
    const checkLiveStatus = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('events')
          .select('is_live')
          .eq('published', true)
          .eq('is_live', true)
          .limit(1);
        setIsLive(!!data && data.length > 0);
      } catch (e) {
        console.error(e);
      }
    };
    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 30000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="solar-spine-container" aria-hidden="true">
      <div className="w-full h-full relative">
        {/* Rail de défilement actif en cobalt pur */}
        <div 
          ref={trackRef}
          className="solar-spine-track absolute top-0 left-0 w-full"
          style={{ 
            background: isLive 
              ? 'linear-gradient(to bottom, #10B981 0%, #0E1AD4 100%)' 
              : '#0E1AD4',
            boxShadow: isLive 
              ? '0 0 10px rgba(16, 185, 129, 0.5)' 
              : '0 0 10px rgba(14, 26, 212, 0.3)'
          }}
        >
          {/* Marqueur cinétique cobalt */}
          <div 
            className="solar-spine-indicator"
            style={{
              background: isLive ? '#10B981' : '#0E1AD4',
              boxShadow: isLive 
                ? '0 0 8px #10B981, 0 0 16px #10B981' 
                : '0 0 8px #0E1AD4, 0 0 16px #0E1AD4'
            }}
          />
        </div>
        
        {/* Ticker vertical signature d'UPLIFT 2.0 */}
        <div className="solar-spine-ticker font-semibold text-xs tracking-widest text-[#0E1AD4]">
          {isLive ? '🔴 DIRECT EN COURS' : 'UPLIFT 2.0 • LEVE ANSANM • HAÏTI'}
        </div>
      </div>
    </div>
  );
}

