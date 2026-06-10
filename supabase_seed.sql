-- UPLIFT 2.0 Database SEED for Supabase PostgreSQL
-- Run this in the Supabase SQL Editor AFTER running supabase_schema.sql

-- 1. Insert Event
INSERT INTO public.events (id, name, tagline, description, date_time, timezone, location_name, location_details, city, capacity, registered_count, featured, tags, published)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'UPLIFT 2.0',
    'Leve ansanm, Briye ansanm',
    'UPLIFT 2.0 est un espace de réflexion, de partage et d''action pour la jeunesse haïtienne. Face au chaos sociopolitique et à la désillusion collective, comment peut-on encore espérer, se projeter et agir ? À travers une conférence principale et des ateliers pratiques animés par des voix engagées, UPLIFT 2.0 invite les jeunes à se lever ensemble — Leve ansanm, Briye ansanm.',
    '2026-04-25 14:00:00-04',
    'America/Port-au-Prince',
    'Centre d''accueil Salve Regina',
    'Ancien local du Chachou HOTEL',
    'Gonaïves',
    300,
    0,
    true,
    ARRAY['Jeunesse', 'Leadership', 'Engagement', 'Haïti', 'Société'],
    true
) ON CONFLICT (id) DO UPDATE SET 
    capacity = EXCLUDED.capacity, 
    registered_count = EXCLUDED.registered_count;

-- 2. Insert Speakers
INSERT INTO public.speakers (id, full_name, role, bio, profile_image)
VALUES 
(
    'e5f67a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
    'Stéphanie Sophie LOUIS',
    'Présidente du gouvernement Jeunesse d''Haïti',
    'Stéphanie Sophie Louis est politologue et Présidente du gouvernement Jeunesse d''Haïti. Engagée dans la promotion de la participation civique des jeunes, elle œuvre pour que la jeunesse haïtienne devienne un acteur central du changement politique et social dans un contexte de crise profonde.',
    '/images/speakers/stephanie.jpg'
),
(
    'c1d2e3f4-a5b6-c7d8-e9f0-1a2b3c4d5e6f',
    'Joacina ORIVAL',
    'Étudiante finissante en sociologie',
    'Joacina Orival est étudiante finissante en sociologie au Centre Haïtien de Leadership et de Communication (CHCL). Passionnée par les dynamiques sociales qui façonnent l''identité des jeunes en période de rupture, elle s''intéresse aux mécanismes de désorientation et de résilience collective.',
    '/images/speakers/joacina.jpg'
),
(
    'b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e',
    'Wilnise JACQUES',
    'Avocate & Maîtresse de cérémonie',
    'Wilnise Jacques est avocate, maîtresse de cérémonie et enseignante, membre actif du collectif Entre Femmes Haïti. Elle consacre son engagement à l''éveil de la conscience citoyenne chez les jeunes, convaincue que l''indifférence est le premier obstacle au changement social.',
    '/images/speakers/wilnise.jpg'
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Sessions
INSERT INTO public.sessions (id, event_id, title, description, type, start_time)
VALUES 
(
    '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Conférence principale',
    'Entre chaos sociopolitique, désillusion collective, et fatigue mentale : comment la jeunesse haïtienne peut-elle encore se projeter, espérer et agir dans une société qui fragilise ses repères et son avenir ?',
    'conference',
    '2026-04-25 14:00:00-04'
),
(
    '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Désorientés',
    'Quand la jeunesse avance sans repères dans une société en rupture.',
    'workshop',
    '2026-04-25 16:00:00-04'
),
(
    '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'De l''indifférence à l''engagement',
    'Réveiller la conscience citoyenne des jeunes.',
    'workshop',
    '2026-04-25 17:00:00-04'
) ON CONFLICT (id) DO NOTHING;

-- 4. Map Sessions to Speakers
INSERT INTO public.session_speakers (session_id, speaker_id)
VALUES 
    ('1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6', 'e5f67a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'),
    ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'c1d2e3f4-a5b6-c7d8-e9f0-1a2b3c4d5e6f'),
    ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e')
ON CONFLICT (session_id, speaker_id) DO NOTHING;
