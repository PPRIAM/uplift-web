import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Crée un client Supabase pour une utilisation exclusive côté navigateur (Client Components).
 * Il s'appuie sur le stockage local des cookies du navigateur pour gérer la session.
 */
export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

