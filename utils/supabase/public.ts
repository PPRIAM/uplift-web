import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Crée un client Supabase public léger (non SSR, s'appuyant uniquement sur l'URL et la clé anonyme).
 * Pratique pour les requêtes publiques rapides côté serveur qui ne requièrent pas de session utilisateur ou de cookies (ex. listes d'événements publics).
 */
export const createPublicClient = () => {
  return createClient(supabaseUrl!, supabaseKey!);
};

