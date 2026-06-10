// lib/mockData.ts
export type EventStatus = 'upcoming' | 'ongoing' | 'past';
export type TicketType = 'general' | 'vip' | 'early_bird' | 'student';
export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled';
export type SessionType = 'conference' | 'workshop' | 'break';

// ─── INTERFACES ───────────────────────────────────────────────────────────────

export interface Speaker {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  twitter?: string;
  linkedin?: string;
  company: string;
  topics: string[];
  sessionIds?: string[];
}

export interface Session {
  id: string;
  eventId: string;
  type: SessionType;
  title: string;
  description: string;
  speakerId: string;
  order: number;
}

export interface ScheduleItem {
  id: string;
  eventId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  speakerId?: string;
  type: 'keynote' | 'talk' | 'workshop' | 'break' | 'panel';
  room?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  type: TicketType;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  benefits: string[];
  available: boolean;
}

export interface Event {
  id: string;
  title: string;
  tagline: string;
  description: string;
  organizers?: string;
  location: string;
  city?: string;
  street?: string;
  venue: string;
  venueDetails?: string;
  startDate: string;
  endDate: string;
  time?: string;
  timezone?: string;
  coverImage: string;
  tags: string[];
  status: EventStatus;
  published: boolean;
  speakerIds: string[];
  sessionIds?: string[];
  capacity: number;
  registeredCount: number;
  featured: boolean;
}

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ticketId: string;
  eventId: string;
  eventTitle: string;
  ticketType: TicketType;
  quantity: number;
  totalAmount: number;
  status: ReservationStatus;
  paymentIntentId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'attendee' | 'admin';
  avatar?: string;
  createdAt: string;
}

// ─── SPEAKERS ────────────────────────────────────────────────────────────────
// Real UPLIFT 2.0 speakers first

export const speakers: Speaker[] = [
  // ── UPLIFT 2.0 Real Speakers ──────────────────────────────────────────────
  {
    id: 'spk-uplift-1',
    name: 'Stéphanie Sophie LOUIS',
    title: 'Présidente du gouvernement Jeunesse d\'Haïti',
    company: 'Gouvernement Jeunesse d\'Haïti',
    bio: "Stéphanie Sophie Louis est politologue et Présidente du gouvernement Jeunesse d'Haïti. Engagée dans la promotion de la participation civique des jeunes, elle œuvre pour que la jeunesse haïtienne devienne un acteur central du changement politique et social dans un contexte de crise profonde.",
    avatar: '/images/speakers/stephanie.jpg',
    topics: ['Politique', 'Jeunesse', 'Gouvernance', 'Engagement civique'],
    sessionIds: ['ses-uplift-1'],
  },
  {
    id: 'spk-uplift-2',
    name: 'Joacina ORIVAL',
    title: 'Étudiante finissante en sociologie',
    company: 'CHCL',
    bio: "Joacina Orival est étudiante finissante en sociologie au Centre Haïtien de Leadership et de Communication (CHCL). Passionnée par les dynamiques sociales qui façonnent l'identité des jeunes en période de rupture, elle s'intéresse aux mécanismes de désorientation et de résilience collective.",
    avatar: '/images/speakers/joacina.jpg',
    topics: ['Sociologie', 'Jeunesse', 'Identité', 'Résilience sociale'],
    sessionIds: ['ses-uplift-2'],
  },
  {
    id: 'spk-uplift-3',
    name: 'Wilnise JACQUES',
    title: 'Avocate & Maîtresse de cérémonie',
    company: 'Entre Femmes Haïti',
    bio: "Wilnise Jacques est avocate, maîtresse de cérémonie et enseignante, membre actif du collectif Entre Femmes Haïti. Elle consacre son engagement à l'éveil de la conscience citoyenne chez les jeunes, convaincue que l'indifférence est le premier obstacle au changement social.",
    topics: ['Droit', 'Engagement citoyen', 'Éducation', 'Leadership féminin'],
    avatar: '/images/speakers/wilnise.jpg',
    sessionIds: ['ses-uplift-3'],
  },
];

// ─── SESSIONS ─────────────────────────────────────────────────────────────────

export const sessions: Session[] = [
  {
    id: 'ses-uplift-1',
    eventId: 'evt-uplift',
    type: 'conference',
    title: 'Conférence principale',
    description:
      "Entre chaos sociopolitique, désillusion collective, et fatigue mentale : comment la jeunesse haïtienne peut-elle encore se projeter, espérer et agir dans une société qui fragilise ses repères et son avenir ?",
    speakerId: 'spk-uplift-1',
    order: 1,
  },
  {
    id: 'ses-uplift-2',
    eventId: 'evt-uplift',
    type: 'workshop',
    title: 'Désorientés',
    description: "Quand la jeunesse avance sans repères dans une société en rupture.",
    speakerId: 'spk-uplift-2',
    order: 2,
  },
  {
    id: 'ses-uplift-3',
    eventId: 'evt-uplift',
    type: 'workshop',
    title: "De l'indifférence à l'engagement",
    description: "Réveiller la conscience citoyenne des jeunes.",
    speakerId: 'spk-uplift-3',
    order: 3,
  },
];

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export const events: Event[] = [
  // ── THE REAL EVENT ────────────────────────────────────────────────────────
  {
    id: 'evt-uplift',
    title: 'UPLIFT 2.0',
    tagline: 'Leve ansanm, Briye ansanm',
    organizers: 'AYIBUZZ MEDIA × UCLUB',
    description:
      "UPLIFT 2.0 est un espace de réflexion, de partage et d'action pour la jeunesse haïtienne. Face au chaos sociopolitique et à la désillusion collective, comment peut-on encore espérer, se projeter et agir ? À travers une conférence principale et des ateliers pratiques animés par des voix engagées, UPLIFT 2.0 invite les jeunes à se lever ensemble — Leve ansanm, Briye ansanm.",
    location: 'Gonaïves, Haïti',
    city: 'Gonaïves',
    street: 'Avenue des Dattes',
    venue: "Centre d'accueil Salve Regina",
    venueDetails: "Ancien local du Chachou HOTEL",
    startDate: '2026-04-25T14:00:00',
    endDate: '2026-04-25T18:00:00',
    time: '14:00',
    timezone: 'America/Port-au-Prince',
    coverImage: '/images/events/uplift2.jpg',
    tags: ['Jeunesse', 'Leadership', 'Engagement', 'Haïti', 'Société'],
    status: 'upcoming',
    published: true,
    speakerIds: ['spk-uplift-1', 'spk-uplift-2', 'spk-uplift-3'],
    sessionIds: ['ses-uplift-1', 'ses-uplift-2', 'ses-uplift-3'],
    capacity: 300,
    registeredCount: 0,
    featured: true,
  },
];

// ─── TICKETS ─────────────────────────────────────────────────────────────────

export const tickets: Ticket[] = [
  // UPLIFT 2.0 — Free Admission
  {
    id: 'tkt-uplift-1',
    eventId: 'evt-uplift',
    type: 'general',
    name: 'Admission Gratuite',
    price: 0,
    quantity: 300,
    sold: 0,
    benefits: [
      'Accès complet à la conférence',
      'Accès aux 2 ateliers',
      'Certificat de participation',
      'Networking',
    ],
    available: true,
  },
];

// ─── SCHEDULE (kept for legacy compatibility) ─────────────────────────────────

export const schedule: ScheduleItem[] = [
  {
    id: 'sch-uplift-1',
    eventId: 'evt-uplift',
    title: 'Accueil & Enregistrement',
    description: 'Bienvenue aux participants. Distribution des badges.',
    startTime: '2026-04-25T13:30:00',
    endTime: '2026-04-25T14:00:00',
    type: 'break',
    room: 'Hall principal',
  },
  {
    id: 'sch-uplift-2',
    eventId: 'evt-uplift',
    title: 'Conférence principale',
    description: "Entre chaos sociopolitique, désillusion collective, et fatigue mentale : comment la jeunesse haïtienne peut-elle encore se projeter ?",
    startTime: '2026-04-25T14:00:00',
    endTime: '2026-04-25T15:30:00',
    speakerId: 'spk-uplift-1',
    type: 'keynote',
    room: 'Salle principale',
  },
  {
    id: 'sch-uplift-3',
    eventId: 'evt-uplift',
    title: 'Atelier : Désorientés',
    description: "Quand la jeunesse avance sans repères dans une société en rupture.",
    startTime: '2026-04-25T15:45:00',
    endTime: '2026-04-25T16:30:00',
    speakerId: 'spk-uplift-2',
    type: 'workshop',
    room: 'Salle A',
  },
  {
    id: 'sch-uplift-4',
    eventId: 'evt-uplift',
    title: "Atelier : De l'indifférence à l'engagement",
    description: "Réveiller la conscience citoyenne des jeunes.",
    startTime: '2026-04-25T16:30:00',
    endTime: '2026-04-25T17:15:00',
    speakerId: 'spk-uplift-3',
    type: 'workshop',
    room: 'Salle B',
  },
  {
    id: 'sch-uplift-5',
    eventId: 'evt-uplift',
    title: 'Clôture & Networking',
    description: 'Questions, échanges et réseautage entre participants.',
    startTime: '2026-04-25T17:15:00',
    endTime: '2026-04-25T18:00:00',
    type: 'break',
    room: 'Hall principal',
  },
];

// ─── RESERVATIONS ────────────────────────────────────────────────────────────

export const reservations: Reservation[] = [];

// ─── USERS ───────────────────────────────────────────────────────────────────

export const users: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@uplift.io', role: 'admin', createdAt: '2024-01-01T00:00:00' },
];

// ─── ANALYTICS SUMMARY ───────────────────────────────────────────────────────

export const analyticsData = {
  totalRevenue: 0,
  totalReservations: 0,
  totalAttendees: 0,
  upcomingEvents: 1,
  revenueByMonth: [
    { month: 'Jan', revenue: 0 },
    { month: 'Fév', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Avr', revenue: 0 },
  ],
  ticketTypeBreakdown: [
    { type: 'Gratuit', count: 0, percent: 0 },
  ],
  topEvents: [
    { id: 'evt-uplift', title: 'UPLIFT 2.0', registeredCount: 0, capacity: 300, revenue: 0 },
  ],
};
