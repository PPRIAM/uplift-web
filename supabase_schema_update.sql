-- Migration schema update for featured and live events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_is_live ON public.events(is_live);

-- Create event_speakers table
CREATE TABLE IF NOT EXISTS public.event_speakers (
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    speaker_id UUID REFERENCES public.speakers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, speaker_id)
);

-- Indices for performance optimization
CREATE INDEX IF NOT EXISTS idx_event_speakers_event_id ON public.event_speakers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_speakers_speaker_id ON public.event_speakers(speaker_id);

-- Enable RLS and setup policies
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to event_speakers" ON public.event_speakers;
CREATE POLICY "Allow public read access to event_speakers" 
ON public.event_speakers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin to manage event_speakers" ON public.event_speakers;
CREATE POLICY "Allow admin to manage event_speakers" 
ON public.event_speakers FOR ALL TO authenticated 
USING (public.is_admin() = true) 
WITH CHECK (public.is_admin() = true);
