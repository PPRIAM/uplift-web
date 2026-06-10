import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmkwhseqfbhrbzqldvcm.supabase.co';
const supabaseKey = 'sb_publishable_quKA2sUvLiryhd4jr4y_LQ_aOMHEOGZ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding UPLIFT 2.0 data...");
  
  // 1. Insert Event
  const { data: event, error: errEvent } = await supabase.from('events').upsert({
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'UPLIFT 2.0',
    tagline: 'Leve ansanm, Briye ansanm',
    description: "UPLIFT 2.0 est un espace de réflexion, de partage et d'action pour la jeunesse haïtienne. Face au chaos sociopolitique et à la désillusion collective, comment peut-on encore espérer, se projeter et agir ? À travers une conférence principale et des ateliers pratiques animés par des voix engagées, UPLIFT 2.0 invite les jeunes à se lever ensemble — Leve ansanm, Briye ansanm.",
    date_time: '2026-04-25T18:00:00.000Z',
    timezone: 'America/Port-au-Prince',
    location_name: "Centre d'accueil Salve Regina",
    location_details: "Ancien local du Chachou HOTEL",
    city: 'Gonaïves',
    capacity: 500,
    registered_count: 0,
    featured: true,
    tags: ['Jeunesse', 'Leadership', 'Engagement', 'Haïti', 'Société'],
    published: true
  }).select().single();
  if (errEvent) console.error("Event Insert Error:", errEvent);

  // 2. Insert Speakers
  const { error: errSpeakers } = await supabase.from('speakers').upsert([
    {
        id: 'e5f67a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
        full_name: 'Stéphanie Sophie LOUIS',
        role: "Présidente du gouvernement Jeunesse d'Haïti",
        bio: "Stéphanie Sophie Louis est politologue et Présidente du gouvernement Jeunesse d'Haïti. Engagée dans la promotion de la participation civique des jeunes, elle œuvre pour que la jeunesse haïtienne devienne un acteur central du changement politique et social dans un contexte de crise profonde.",
        profile_image: '/images/speakers/stephanie.jpg'
    },
    {
        id: 'c1d2e3f4-a5b6-c7d8-e9f0-1a2b3c4d5e6f',
        full_name: 'Joacina ORIVAL',
        role: "Étudiante finissante en sociologie",
        bio: "Joacina Orival est étudiante finissante en sociologie au Centre Haïtien de Leadership et de Communication (CHCL). Passionnée par les dynamiques sociales qui façonnent l'identité des jeunes en période de rupture, elle s'intéresse aux mécanismes de désorientation et de résilience collective.",
        profile_image: '/images/speakers/joacina.jpg'
    },
    {
        id: 'b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e',
        full_name: 'Wilnise JACQUES',
        role: "Avocate & Maîtresse de cérémonie",
        bio: "Wilnise Jacques est avocate, maîtresse de cérémonie et enseignante, membre actif du collectif Entre Femmes Haïti. Elle consacre son engagement à l'éveil de la conscience citoyenne chez les jeunes, convaincue que l'indifférence est le premier obstacle au changement social.",
        profile_image: '/images/speakers/wilnise.jpg'
    }
  ]);
  if (errSpeakers) console.error("Speakers Insert Error:", errSpeakers);

  // 3. Insert Sessions
  const { error: errSessions } = await supabase.from('sessions').upsert([
    {
        id: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6',
        event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        title: 'Conférence principale',
        description: 'Entre chaos...',
        type: 'conference',
        start_time: '2026-04-25T18:00:00.000Z'
    },
    {
        id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        title: 'Désorientés',
        description: 'Quand la jeunesse...',
        type: 'workshop',
        start_time: '2026-04-25T20:00:00.000Z'
    },
    {
        id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        title: "De l'indifférence à l'engagement",
        description: 'Réveiller la conscience...',
        type: 'workshop',
        start_time: '2026-04-25T21:00:00.000Z'
    }
  ]);
  if (errSessions) console.error("Sessions Insert Error:", errSessions);

  // 4. Insert Session Speakers (join)
  const { error: errJoin } = await supabase.from('session_speakers').upsert([
      { session_id: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6', speaker_id: 'e5f67a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b' },
      { session_id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', speaker_id: 'c1d2e3f4-a5b6-c7d8-e9f0-1a2b3c4d5e6f' },
      { session_id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', speaker_id: 'b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e' }
  ]);
  if (errJoin) console.error("Join Insert Error:", errJoin);

  console.log("Seeding complete!");
}
seed();
