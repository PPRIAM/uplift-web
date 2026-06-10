# Journal d'Actions du Code Cleaner — Agent 3 (UPLIFT 2.0)

Ce document retrace l'intégralité des actions menées pour nettoyer la base de code, réduire la dette technique, supprimer le code mort, modulariser les composants complexes et documenter les sections non évidentes du projet **UPLIFT 2.0 (uplift-web)**.

---

## 1. Analyse Initiale & Audit de la Racine

Un audit de la racine du projet a révélé une quantité importante de fichiers polluants (scripts SQL de correctifs partiels appliqués par le passé, outils de renommage temporaires ou scripts d'unzip à usage unique) :
*   **30 fichiers SQL de migration obsolètes** (ex. `supabase_admin_fix_v3.sql`, `supabase_visibility_default_false.sql`, etc.) qui ont déjà été exécutés en production ou sur la base locale. Le schéma complet et les données de référence sont centralisés dans `supabase_schema.sql` et `supabase_seed.sql`.
*   **14 scripts de diagnostic temporaires ou utilitaires morts** (ex. `fix.js`, `refactor_api.js`, `remove_white*`, etc.).

---

## 2. Nettoyage de la Racine (Suppression du Code Mort & Fichiers Obsolètes)

Afin de désencombrer le projet, les **44 fichiers obsolètes** suivants ont été supprimés avec succès :

### Migrations SQL déjà appliquées et inutiles au seed :
1.  `cleanup_unverified_users.sql`
2.  `create_sync_trigger.sql`
3.  `supabase-migration-featured-live.sql`
4.  `supabase_admin_fix.sql`
5.  `supabase_admin_fix_v2.sql`
6.  `supabase_admin_fix_v3.sql`
7.  `supabase_admin_rls.sql`
8.  `supabase_alter.sql`
9.  `supabase_cover_image.sql`
10. `supabase_email_rls_fix.sql`
11. `supabase_email_schema.sql`
12. `supabase_email_uniqueness_migration.sql`
13. `supabase_fix_reservation_rls.sql`
14. `supabase_fix_ticket_uuid.sql`
15. `supabase_indexes.sql`
16. `supabase_payment_tickets.sql`
17. `supabase_reservations_user_rls.sql`
18. `supabase_rls.sql`
19. `supabase_security_functions.sql`
20. `supabase_speaker_applications.sql`
21. `supabase_storage_speakers.sql`
22. `supabase_stream_access.sql`
23. `supabase_sync_speakers_trigger.sql`
24. `supabase_ticket_allocation_mode.sql`
25. `supabase_ticket_tiers.sql`
26. `supabase_update_schema.sql`
27. `supabase_update_schema_v2.sql`
28. `supabase_visibility.sql`
29. `supabase_visibility_default_false.sql`
30. `sync_event_counts.sql`

### Scripts et utilitaires temporaires obsolètes :
31. `fix.js`
32. `refactor_api.js`
33. `remove_white.ps1`
34. `remove_white.py`
35. `remove_white_v2.py`
36. `unzip.cmd`
37. `unzip.ps1`
38. `check-net.mjs`
39. `test-email.mjs`
40. `test-raw.mjs`
41. `test-security.mjs`
42. `verify-fix.mjs`
43. `verify-layout.mjs`
44. `verify-speaker-app.mjs`

### Fichiers essentiels préservés à la racine :
*   `supabase_schema.sql` & `supabase_seed.sql` : Nécessaires pour reconstruire et initialiser la base de données.
*   `seed_supabase.mjs` : Script de seed de la base de données.
*   `diagnose-admin.sql`, `diagnose-reservations.mjs`, `debug-supabase.mjs` & `test-supabase.mjs` : Outils de diagnostic essentiels pour l'infrastructure locale.
*   `deploy-gcp.sh` : Script de déploiement.
*   `download_fonts.mjs` : Script de téléchargement local des polices de caractères.

---

## 3. Décomposition et Refactoring de `HomePageClient.tsx`

Le composant client massif de la page d'accueil (`components/HomePageClient.tsx`) comportait 451 lignes et orchestrait de multiples sections d'interface en ligne. 

Il a été décomposé en 6 sous-composants modulaires, réutilisables et à responsabilité unique dans le nouveau dossier `components/home/` :
1.  **`components/home/HeroSection.tsx`** : Gère l'affichage héroïque de l'événement mis en avant, la description et les données logistiques clés.
2.  **`components/home/StatsBar.tsx`** : Affiche les métriques de statistiques d'UPLIFT.
3.  **`components/home/SessionsSection.tsx`** : Gère l'affichage des sessions d'ateliers et de conférences programmées ainsi que le mapping de leurs intervenants.
4.  **`components/home/SpeakersSection.tsx`** : Affiche la grille des intervenantes (Voix engagées).
5.  **`components/home/WhyUpliftSection.tsx`** : Grille Bento exposant les propositions de valeur clés.
6.  **`components/home/CtaBanner.tsx`** : Bannière finale de réservation de places avec le dégradé de la marque.

Le fichier principal **`components/HomePageClient.tsx`** a été réécrit pour importer ces sous-composants, mapper les données brutes Supabase et initialiser le contexte GSAP afin d'éviter tout effet secondaire sur l'animation d'apparition.

**Rendu visuel et comportement inchangés :** Le découpage n'a affecté aucun style Tailwind, structure DOM ou logique d'état React. Les classes d'animation GSAP (`reveal-up`, `animate-fade-in-up`) et la détection d'accessibilité `prefers-reduced-motion` ont été rigoureusement conservées.

---

## 4. Documentation & Uniformisation de la Logique

Tous les blocs de logique non évidents et les utilitaires critiques ont été documentés en français de façon approfondie :

*   **`store/authStore.ts`** : Ajout d'explications sur le store persistant Zustand et le rôle de chaque action de connexion/déconnexion.
*   **`middleware.ts`** : Explications détaillées sur les filtres d'exécution du middleware Next.js pour éviter de cibler les assets statiques.
*   **`utils/supabase/middleware.ts`** : Documentation du flux de propagation/mise à jour des cookies JWT de session à chaque requête et du mécanisme de sécurité bloquant les routes `/live` et `/replay`.
*   **`utils/supabase/client.ts`**, **`utils/supabase/server.ts`** et **`utils/supabase/public.ts`** : Commentaires clairs distinguant l'usage du client navigateur, du client serveur (avec gestion de l'erreur en écriture seule sur les Server Components) et du client public léger.
*   **Composants HTML** : Échappement systématique des apostrophes (ex. `l'événement` -> `l&apos;événement` ou `S'inscrire` -> `S&#x27;inscrire`) afin d'assurer la conformité ESLint.

---

## 5. Validation

Les changements ont été validés en veillant à la robustesse du typage TypeScript et au respect total du Design System de la marque (Élan Violet / Lumière d'Haïti).
