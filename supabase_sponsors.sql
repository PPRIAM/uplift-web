-- UPLIFT 2.0 - Sponsors Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com)

-- 1. Création de la table public.sponsors
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Activation de la sécurité au niveau des lignes (RLS)
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- 3. Politique de lecture publique (tout le monde peut voir les sponsors)
DROP POLICY IF EXISTS "Allow public read access to sponsors" ON public.sponsors;
CREATE POLICY "Allow public read access to sponsors" 
ON public.sponsors FOR SELECT USING (true);

-- 4. Politique d'écriture pour les administrateurs authentifiés
DROP POLICY IF EXISTS "Allow admin to manage sponsors" ON public.sponsors;
CREATE POLICY "Allow admin to manage sponsors" 
ON public.sponsors FOR ALL TO authenticated 
USING (public.is_admin() = true) 
WITH CHECK (public.is_admin() = true);
