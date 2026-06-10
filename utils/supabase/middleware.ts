import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// URL et clé anon de Supabase provenant des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Liste des routes nécessitant impérativement une authentification active
const PROTECTED_ROUTES = ['/live', '/replay'];

/**
 * Initialise le client Supabase Server dans le contexte du Middleware Next.js.
 * Il assure le rafraîchissement automatique des cookies de session (JWT)
 * et bloque l'accès aux routes protégées si l'utilisateur n'est pas connecté.
 */
export const createClient = async (request: NextRequest) => {
  // Crée une réponse de base non modifiée pour NextJS
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Création du client serveur Supabase avec configuration des cookies
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          // Récupère tous les cookies de la requête entrante
          getAll() {
            return request.cookies.getAll()
          },
          // Propage les cookies de session mis à jour vers la requête et la réponse
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      },
    );

    // IMPORTANT : Cet appel valide et rafraîchit le cookie JWT si nécessaire
    const { data: { user } } = await supabase.auth.getUser();

    // ── Barrière d'authentification pour les routes protégées ─────────────────
    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );

    // Si la route est protégée et qu'aucun utilisateur n'est authentifié,
    // redirection vers /auth/login en conservant l'URL cible dans le paramètre 'redirect'
    if (isProtected && !user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (err) {
    // En cas d'échec de la vérification (ex. Supabase indisponible), on laisse passer la requête
    console.error('Supabase Middleware Error:', err);
  }

  return supabaseResponse;
};

