import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

/**
 * Middleware de Next.js exécuté pour chaque requête correspondant au filtre 'matcher'.
 * Il appelle l'utilitaire Supabase middleware pour rafraîchir et propager la session 
 * utilisateur (cookies d'authentification) avant de transmettre la requête.
 */
export async function middleware(request: NextRequest) {
  return await createClient(request);
}

// Configuration des chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Cible toutes les routes de l'application à l'exception des ressources statiques :
     * - _next/static (fichiers compilés statiques)
     * - _next/image (fichiers d'optimisation d'images de Next.js)
     * - favicon.ico (icône du site)
     * - images/ (images dans le dossier public)
     * Permet d'éviter d'exécuter des appels Supabase inutiles sur les assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

