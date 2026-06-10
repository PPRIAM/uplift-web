'use client';

import { useEffect, useRef } from 'react';
import { formatDate } from '@/lib/dateUtils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { defaultSessions, defaultSpeakers } from '@/lib/constants/defaults';

// Importation des sous-composants modularisés de la page d'accueil
import HeroSection from './home/HeroSection';
import StatsBar from './home/StatsBar';
import SessionsSection from './home/SessionsSection';
import SpeakersSection from './home/SpeakersSection';
import WhyUpliftSection from './home/WhyUpliftSection';
import CtaBanner from './home/CtaBanner';

// Enregistrement du plugin ScrollTrigger de GSAP uniquement côté client (dans le navigateur)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Déclaration des interfaces TypeScript pour typer rigoureusement les données d'entrée
interface UpcomingEvent {
  id: string;
  name: string;
  description?: string;
  type?: string;
  speaker_name?: string;
  speaker_role?: string;
  speaker_image?: string;
}

interface FeaturedSpeaker {
  id: string;
  full_name: string;
  role?: string;
  profile_image?: string;
}

interface FeaturedEvent {
  id?: string;
  name?: string;
  description?: string;
  organizer?: string;
  city?: string;
  date_time?: string;
  location_name?: string;
  registered_count?: number;
  capacity?: number;
  tagline?: string;
}

interface HomePageClientProps {
  upcomingEvents: UpcomingEvent[] | null;
  featuredSpeakers: FeaturedSpeaker[] | null;
  totalEvents: number | null;
  totalSpeakers: number | null;
  featuredEvent: FeaturedEvent | null;
}

/**
 * Composant HomePageClient.
 * Orchestre les différentes sections de la page d'accueil.
 * Gère le mapping des données de la base de données vers des formats UI et l'initialisation GSAP.
 */
export default function HomePageClient({
  upcomingEvents,
  featuredSpeakers,
  totalEvents,
  featuredEvent,
}: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Désactiver les animations si l'utilisateur a configuré une réduction des mouvements au niveau du système
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Contexte GSAP pour encapsuler et nettoyer automatiquement les sélecteurs et triggers au démontage
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Définition des valeurs de repli (fallbacks) pour l'événement vedette UPLIFT 2.0
  const fallbackEventId = featuredEvent?.id || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  const organizerName = featuredEvent?.organizer || 'AYIBUZZ MEDIA × UCLUB';
  const cityName = featuredEvent?.city || 'Gonaïves, Haïti';
  const eventName = featuredEvent?.name || 'UPLIFT 2.0';
  const eventDescription = featuredEvent?.description || "Unir et structurer l'énergie professionnelle pour propulser le développement local. Rejoignez l'élan d'UPLIFT 2.0.";
  const eventDateText = featuredEvent?.date_time ? formatDate(featuredEvent.date_time) : '25 avril 2026 · 14:00';
  const locationName = featuredEvent?.location_name || "Centre d'accueil Salve Regina, Gonaïves";
  const inscritsCount = featuredEvent?.registered_count ?? 400;
  const totalSpots = featuredEvent?.capacity ?? 400;
  const placesRestantes = featuredEvent ? Math.max(0, totalSpots - inscritsCount) : 0;
  const tagline = featuredEvent?.tagline || 'Leve ansanm, Briye ansanm';

  // Transformation des données brutes de sessions provenant de Supabase en objets UI (ou fallback)
  const activeSessions = upcomingEvents && upcomingEvents.length > 0 
    ? upcomingEvents.slice(0, 3).map((ev, idx) => ({
        id: ev.id,
        type: ev.type || (idx === 0 ? 'Conférence' : 'Atelier'),
        name: ev.name,
        description: ev.description || (idx === 0 ? 'Conférence principale' : 'Atelier pratique'),
        speaker: {
          name: ev.speaker_name || (idx === 0 ? 'Stéphanie Sophie LOUIS' : idx === 1 ? 'Joacina ORIVAL' : 'Wilnise JACQUES'),
          role: ev.speaker_role || (idx === 0 ? "Présidente du gouvernement Jeunesse d'Haïti" : idx === 1 ? 'Étudiante finissante en sociologie' : 'Avocate & Maîtresse de cérémonie'),
          image: ev.speaker_image || (idx === 0 ? '/images/speakers/stephanie.jpg' : idx === 1 ? '/images/speakers/joacina.jpg' : '/images/speakers/wilnise.jpg')
        }
      }))
    : defaultSessions;

  // Transformation des intervenantes provenant de Supabase en objets UI (ou fallback)
  const activeSpeakers = featuredSpeakers && featuredSpeakers.length > 0
    ? featuredSpeakers.slice(0, 3).map((sp) => ({
        id: sp.id,
        name: sp.full_name,
        role: sp.role || 'Intervenante',
        image: sp.profile_image || '/images/speakers/stephanie.jpg'
      }))
    : defaultSpeakers;

  return (
    <div ref={containerRef} className="bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* 1. SECTION HERO */}
      <HeroSection 
        eventName={eventName}
        eventDescription={eventDescription}
        organizerName={organizerName}
        cityName={cityName}
        tagline={tagline}
        fallbackEventId={fallbackEventId}
        eventDateText={eventDateText}
        locationName={locationName}
        inscritsCount={inscritsCount}
        placesRestantes={placesRestantes}
      />

      {/* 2. SECTION STATS BAR */}
      <StatsBar totalEvents={totalEvents} />

      {/* 3. SECTION SESSIONS */}
      <SessionsSection 
        tagline={tagline}
        activeSessions={activeSessions}
        fallbackEventId={fallbackEventId}
      />

      {/* 4. SECTION INTERVENANTS (SPEAKERS) */}
      <SpeakersSection activeSpeakers={activeSpeakers} />

      {/* 5. SECTION BENTO GRID "POURQUOI UPLIFT" */}
      <WhyUpliftSection />

      {/* 6. BANNIÈRE D'APPEL À L'ACTION (CTA) */}
      <CtaBanner fallbackEventId={fallbackEventId} />

    </div>
  );
}
