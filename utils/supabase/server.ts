import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Crée un client Supabase pour une utilisation côté serveur (Server Components, Server Actions ou Route Handlers).
 * Permet de lire et d'écrire de manière sécurisée dans les cookies de la requête Next.js.
 */
export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        // Renvoie tous les cookies disponibles côté serveur
        getAll() {
          return cookieStore.getAll()
        },
        // Enregistre les nouveaux cookies (ex: après authentification)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            // Cette erreur peut se produire si setAll est appelé depuis un Server Component (lecture seule).
            // Elle peut être ignorée en toute sécurité si le middleware se charge déjà du rafraîchissement.
          }
        },
      },
    },
  );
};

