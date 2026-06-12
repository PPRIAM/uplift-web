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
  location_details?: string | null;
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
  eventSessions?: any[] | null;
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
  eventSessions,
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

  // Définition des valeurs pour l'événement vedette UPLIFT 2.0, ou Ayibuzz Media si null
  const isAyibuzzMedia = !featuredEvent;
  const fallbackEventId = featuredEvent?.id || '';
  const organizerName = featuredEvent?.organizer || (isAyibuzzMedia ? 'Agence' : 'AYIBUZZ MEDIA × UCLUB');
  const cityName = featuredEvent?.city || (isAyibuzzMedia ? 'Port-au-Prince, Haïti' : 'Gonaïves, Haïti');
  const eventName = featuredEvent?.name || (isAyibuzzMedia ? 'AYIBUZZ MEDIA' : 'UPLIFT 2.0');
  const eventDescription = featuredEvent?.description || (isAyibuzzMedia ? "Ayibuzz Media est une agence de communication et de médias axée sur la promotion des initiatives positives en Haïti. Nous créons du contenu engageant et des événements marquants pour inspirer la jeunesse." : "Unir et structurer l'énergie professionnelle pour propulser le développement local. Rejoignez l'élan d'UPLIFT 2.0.");
  const eventDateText = featuredEvent?.date_time ? formatDate(featuredEvent.date_time) : '';
  const locationName = featuredEvent?.location_name || '';
  const inscritsCount = featuredEvent?.registered_count ?? 0;
  const totalSpots = featuredEvent?.capacity ?? 0;
  const placesRestantes = featuredEvent ? Math.max(0, totalSpots - inscritsCount) : 0;
  const tagline = featuredEvent?.tagline || (isAyibuzzMedia ? 'Inspirer. Créer. Connecter.' : 'Leve ansanm, Briye ansanm');

  // Deserialize metadata from location_details if available
  let eventMetadata = null;
  if (featuredEvent?.location_details) {
    try {
      eventMetadata = JSON.parse(featuredEvent.location_details);
    } catch (e) {
      // ignore parsing error
    }
  }

  // Transformation des données brutes de sessions provenant de Supabase en objets UI (ou fallback)
  const activeSessions = eventSessions && eventSessions.length > 0
    ? eventSessions.map((ev, idx) => {
        const sp = ev.session_speakers && ev.session_speakers.length > 0 && ev.session_speakers[0].speakers
          ? ev.session_speakers[0].speakers
          : null;
        return {
          id: ev.id,
          type: ev.type || (idx === 0 ? 'Conférence' : 'Atelier'),
          name: ev.title || ev.name,
          description: ev.description || (idx === 0 ? 'Conférence principale' : 'Atelier pratique'),
          speaker: {
            name: sp ? sp.full_name : (idx === 0 ? 'Stéphanie Sophie LOUIS' : idx === 1 ? 'Joacina ORIVAL' : 'Wilnise JACQUES'),
            role: sp ? sp.role : (idx === 0 ? "Présidente du gouvernement Jeunesse d'Haïti" : idx === 1 ? 'Étudiante finissante en sociologie' : 'Avocate & Maîtresse de cérémonie'),
            image: sp && sp.profile_image ? sp.profile_image : (idx === 0 ? '/images/speakers/stephanie.jpg' : idx === 1 ? '/images/speakers/joacina.jpg' : '/images/speakers/wilnise.jpg')
          }
        };
      })
    : defaultSessions;

  // Extraire les speakers réels du featured event
  const eventSpeakers = eventSessions && eventSessions.length > 0
    ? eventSessions
        .map(ev => ev.session_speakers?.[0]?.speakers)
        .filter(sp => sp != null)
    : [];

  // Transformation des intervenantes provenant de Supabase en objets UI (ou fallback)
  const actualSpeakersToDisplay = eventSpeakers.length > 0 ? eventSpeakers : featuredSpeakers;

  const activeSpeakers = actualSpeakersToDisplay && actualSpeakersToDisplay.length > 0
    ? actualSpeakersToDisplay.slice(0, 3).map((sp) => ({
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
        isAyibuzzMedia={isAyibuzzMedia}
      />

      {/* 2. SECTION STATS BAR */}
      <StatsBar totalEvents={totalEvents} featuredEvent={featuredEvent} />

      {/* 3. SECTION SESSIONS */}
      <SessionsSection 
        tagline={tagline}
        activeSessions={activeSessions}
        fallbackEventId={fallbackEventId}
        hasFeaturedEvent={!!featuredEvent}
      />

      {/* 4. SECTION INTERVENANTS (SPEAKERS) */}
      <SpeakersSection activeSpeakers={activeSpeakers} hasFeaturedEvent={!!featuredEvent} fallbackEventId={fallbackEventId} />

      {/* 5. SECTION BENTO GRID "POURQUOI UPLIFT" */}
      <WhyUpliftSection hasFeaturedEvent={!!featuredEvent} eventMetadata={eventMetadata} />

      {/* 6. BANNIÈRE D'APPEL À L'ACTION (CTA) */}
      <CtaBanner fallbackEventId={fallbackEventId} hasFeaturedEvent={!!featuredEvent} />

    </div>
  );
}
