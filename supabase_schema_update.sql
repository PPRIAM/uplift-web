-- Migration schema update for featured and live events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_is_live ON public.events(is_live);
