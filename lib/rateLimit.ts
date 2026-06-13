/**
 * lib/rateLimit.ts
 *
 * Limiteur de débit en mémoire utilisant une simple Map — sans dépendance externe.
 * Limite chaque IP à MAX_REQUESTS dans une fenêtre de WINDOW_MS millisecondes.
 *
 * Attention : l'état est réinitialisé à chaque redémarrage du serveur / démarrage à froid.
 * Pour les déploiements multi-instances ou edge, le remplacer par Upstash Redis ou
 * un compteur basé sur Supabase.
 */

const MAX_REQUESTS = 5;           // nombre maximal de tentatives par fenêtre
const WINDOW_MS    = 60 * 1000;   // 60 secondes

interface RateLimitEntry {
  count:   number;
  resetAt: number; // temps epoch ms
}

// Magasin au niveau du module — persiste d'une requête à l'autre au sein du même processus
const store = new Map<string, RateLimitEntry>();

/** Nettoie périodiquement les entrées expirées pour éviter l'accumulation en mémoire */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // toutes les 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
}

export interface RateLimitResult {
  allowed:            boolean;
  remaining:          number; // requêtes restantes dans la fenêtre actuelle
  retryAfterSeconds:  number; // 0 si autorisé
}

/**
 * Vérifie et enregistre une requête pour l'identifiant donné (généralement une adresse IP).
 * Appelez cette fonction au tout début de votre gestionnaire de route.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  let entry = store.get(identifier);

  // Fenêtre expirée — on recommence à zéro
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    // Toujours dans la fenêtre de blocage
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    store.set(identifier, entry);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  store.set(identifier, entry);

  return {
    allowed:           true,
    remaining:         MAX_REQUESTS - entry.count,
    retryAfterSeconds: 0,
  };
}
