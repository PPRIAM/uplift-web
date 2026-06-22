-- Création de la table des sponsors
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Politique d'accès en lecture publique pour tout le monde
DROP POLICY IF EXISTS "Allow public read access to sponsors" ON public.sponsors;
CREATE POLICY "Allow public read access to sponsors" 
ON public.sponsors FOR SELECT USING (true);

-- Politique d'accès en écriture/modification pour les administrateurs connectés
DROP POLICY IF EXISTS "Allow admin to manage sponsors" ON public.sponsors;
CREATE POLICY "Allow admin to manage sponsors" 
ON public.sponsors FOR ALL TO authenticated 
USING (public.is_admin() = true) 
WITH CHECK (public.is_admin() = true);
