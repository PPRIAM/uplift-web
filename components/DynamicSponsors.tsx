import React from 'react';
import { getActiveSponsors } from '@/app/actions/sponsor-actions';
import FeaturedSponsor, { Sponsor } from './FeaturedSponsor';
import SponsorMarquee from './SponsorMarquee';
import { sanitizeImageUrl } from '@/utils/image'; // Utilitaire de nettoyage des URLs locales de logos

/**
 * Composant wrapper DynamicSponsors (Server Component)
 * Récupère les sponsors actifs depuis la base de données et gère le rendu conditionnel :
 * - 0 sponsor : n'affiche rien.
 * - 1 sponsor : affiche la carte vedette FeaturedSponsor.
 * - Plus de 1 sponsor : affiche le ruban défilant SponsorMarquee.
 */
export default async function DynamicSponsors() {
  // Récupération des sponsors actifs via l'action serveur avec cache
  const activeSponsors = await getActiveSponsors();

  // Filtrage de sécurité pour garantir la présence d'un logo (requis pour Next/Image)
  const validSponsors: Sponsor[] = (activeSponsors || [])
    .filter((s) => s.logo_url !== null && s.logo_url !== undefined)
    .map((s) => ({
      id: s.id,
      name: s.name,
      logo_url: sanitizeImageUrl(s.logo_url!),
      website_url: s.website_url || undefined,
      // Les colonnes suivantes ne sont pas dans le schéma minimal de la base mais gérées dans l'interface
      description: (s as any).description || undefined,
      tier: (s as any).tier || undefined,
      is_featured: (s as any).is_featured || false,
    }));

  if (validSponsors.length === 0) {
    return null;
  }

  if (validSponsors.length === 1) {
    return (
      <div className="w-full py-12 px-6 bg-slate-50/30 dark:bg-slate-900/10 border-t border-slate-200/50 dark:border-slate-800/30">
        <div className="max-w-[1200px] mx-auto">
          <FeaturedSponsor sponsor={validSponsors[0]} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <SponsorMarquee sponsors={validSponsors} />
    </div>
  );
}
