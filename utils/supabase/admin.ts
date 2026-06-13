import { createClient } from '@supabase/supabase-js';

/**
 * Crée ou retourne un client Supabase standard (public) basé sur la clé anonyme.
 * Gère le cas particulier de la phase de build de production Next.js où les variables d'environnement ne sont pas requises.
 */
const fetchOptions = {
  global: {
    fetch: (url: any, options: any) => fetch(url, { ...options, cache: 'no-store' })
  }
};

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key || url.includes('dummy') || key === 'dummy') {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return createClient(url || 'https://dummy.supabase.co', key || 'dummy');
    }
    throw new Error('CONFIG_ERROR : La variable d\'environnement NEXT_PUBLIC_SUPABASE_URL ou la clé anonyme est manquante ou invalide.');
  }
  return createClient(url, key, fetchOptions);
}

/**
 * Crée ou retourne un client Supabase avec les privilèges Administrateur (Service Role).
 * Utilisé pour contourner les politiques RLS lors d'actions administratives (ex: validation et émission de billets).
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key || url.includes('dummy') || key === 'dummy') {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return createClient(url || 'https://dummy.supabase.co', key || 'dummy');
    }
    throw new Error('CONFIG_ERROR : La variable d\'environnement SUPABASE_SERVICE_ROLE_KEY est manquante. Les actions administratives échoueront.');
  }
  return createClient(url, key, fetchOptions);
}
