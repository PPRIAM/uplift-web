# MEMORY

## Project: Sponsor Management Panel (Admin UI)
- **Phase:** done
- **Decisions:**
  - Création des server actions dans `app/actions/sponsor-actions.ts` pour la gestion des sponsors (lecture, création, modification, suppression et bascule de l'état actif/inactif) via le client Supabase Service Role.
  - Implémentation du tableau de bord d'administration à `app/admin/sponsors/page.tsx` avec une grille de cartes au style néobrutaliste, formulaires d'ajout/modification en modal, recherche en temps réel et confirmations de suppression conformes au style premium d'UPLIFT 2.0.
  - Enregistrement de la navigation vers la page Sponsors dans le menu latéral d'administration `app/admin/layout.tsx` avec l'icône `Heart` de `lucide-react`.
  - Ajout du modèle `Sponsor` au schéma Prisma `prisma/schema.prisma` pour maintenir la synchronisation des modèles de base de données.
  - Création d'un script de migration SQL `supabase_sponsors.sql` à la racine pour permettre l'initialisation de la table `sponsors` et la configuration des politiques RLS directement depuis l'éditeur SQL de Supabase.
  - Résolution de l'erreur d'hôte d'image non configuré (`Invalid src prop`) en whitelistant `localhost` et `127.0.0.1` sur le port 3000 dans `next.config.ts`.
  - Création d'un utilitaire `sanitizeImageUrl` dans `utils/image.ts` pour convertir les URLs locales absolues en chemins relatifs.
  - Respect strict de la consigne d'écriture des commentaires de code uniquement en français.
  - Validation de la compilation TypeScript du projet avec `npx tsc --noEmit`.
  - Intégration d'un sélecteur d'image moderne hybride (Drag & Drop + URL manuelle) avec conversion Base64 client et style néobrutaliste dans `app/admin/sponsors/page.tsx`.
  - Suppression du caractère obligatoire de l'URL du site web du sponsor dans Prisma (`String?`) et dans les Server Actions Supabase.
- **Task Registry:**
  - Créer app/actions/sponsor-actions.ts -> DONE
  - Créer app/admin/sponsors/page.tsx -> DONE
  - Mettre à jour prisma/schema.prisma -> DONE
  - Mettre à jour app/admin/layout.tsx -> DONE
  - Créer supabase_sponsors.sql -> DONE
  - Configurer next.config.ts pour localhost -> DONE
  - Créer utils/image.ts et intégrer la sanitization -> DONE
  - Intégrer l'image uploader/dropper dans le formulaire -> DONE
  - Rendre le site web du sponsor optionnel -> DONE
  - Valider la compilation TypeScript -> DONE
- **Pending:** Aucun. Le Boss effectue les vérifications manuelles finales.
- **Session:** 2026-06-22
