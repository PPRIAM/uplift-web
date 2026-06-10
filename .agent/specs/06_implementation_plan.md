# UPLIFT 2.0 Code Clean Plan
**Goal:** Nettoyer la base de code d'uplift-web en supprimant le code mort, en décomposant `HomePageClient.tsx` en composants réutilisables à responsabilité unique, et en ajoutant des commentaires explicatifs détaillés en français sans modifier le rendu visuel ni le comportement.

**Architecture:** Le composant massif `HomePageClient.tsx` sera décomposé en 6 sous-composants dans un nouveau dossier `components/home/` : `HeroSection.tsx`, `StatsBar.tsx`, `SessionsSection.tsx`, `SpeakersSection.tsx`, `WhyUpliftSection.tsx` et `CtaBanner.tsx`. Les fichiers obsolètes (scripts de correctifs et migrations temporaires à la racine) seront nettoyés.

**Tech Stack:** Next.js App Router (React 19), Tailwind CSS, GSAP, Supabase Client SDK, Lucide Icons.

---

## Refactoring Roadmap

### Phase 1: Décomposition de HomePageClient.tsx
- [ ] **Task 1.1: Créer le composant `HeroSection.tsx`**
  - **Fichier**: Créer: `components/home/HeroSection.tsx`
  - Contient la section d'en-tête (Hero) avec animations d'apparition rapides, informations sur l'événement phare, compteur d'inscrits, boutons d'action et icônes.
- [ ] **Task 1.2: Créer le composant `StatsBar.tsx`**
  - **Fichier**: Créer: `components/home/StatsBar.tsx`
  - Contient la barre de statistiques horizontales (participants, sessions, date, gratuité).
- [ ] **Task 1.3: Créer le composant `SessionsSection.tsx`**
  - **Fichier**: Créer: `components/home/SessionsSection.tsx`
  - Contient la liste des sessions vedettes, le mapping des intervenants et le bouton vers le détail de l'événement.
- [ ] **Task 1.4: Créer le composant `SpeakersSection.tsx`**
  - **Fichier**: Créer: `components/home/SpeakersSection.tsx`
  - Contient la section présentant les voix engagées (intervenants) sous forme de grille.
- [ ] **Task 1.5: Créer le composant `WhyUpliftSection.tsx`**
  - **Fichier**: Créer: `components/home/WhyUpliftSection.tsx`
  - Contient la grille Bento des points forts d'UPLIFT (Conférences, Ateliers, Communauté, Gratuit).
- [ ] **Task 1.6: Créer le composant `CtaBanner.tsx`**
  - **Fichier**: Créer: `components/home/CtaBanner.tsx`
  - Contient la bannière de fin avec le slogan "Leve ansanm, Briye ansanm" et le bouton d'inscription.
- [ ] **Task 1.7: Réécrire `HomePageClient.tsx` pour orchestrer les sections**
  - **Fichier**: Modifier: `components/HomePageClient.tsx`
  - Le fichier importera les 6 sections, transmettra les props et contiendra les initialisations GSAP.

### Phase 2: Nettoyage des fichiers obsolètes et code mort
- [ ] **Task 2.1: Organiser les fichiers SQL essentiels dans un dossier `supabase/`**
  - Déplacer `supabase_schema.sql`, `supabase_seed.sql` et `seed_supabase.mjs` dans un nouveau dossier `supabase/` pour désencombrer la racine, ou les maintenir organisés.
- [ ] **Task 2.2: Supprimer les scripts obsolètes de la racine**
  - Supprimer les migrations déjà appliquées et les scripts temporaires (ex. `fix.js`, `refactor_api.js`, `remove_white*`, `unzip*`, `test-email.mjs`, `test-raw.mjs`, `test-security.mjs`, `verify-fix.mjs`, `verify-layout.mjs`, `verify-speaker-app.mjs`, etc.).
  - Veiller à conserver les scripts utiles de diagnostic : `diagnose-admin.sql`, `debug-supabase.mjs`, `diagnose-reservations.mjs`, `test-supabase.mjs`.

### Phase 3: Uniformisation du nommage et documentation en français
- [ ] **Task 3.1: Documenter les blocs de logique non évidents**
  - Parcourir les fichiers d'authentification (`store/authStore.ts`, `middleware.ts`, `utils/supabase/`) et composants principaux pour ajouter des explications en français.
  - S'assurer que tous les caractères `'` bruts dans JSX sont correctement échappés ou convertis pour éviter les warnings d'ESLint (ex: `&apos;` ou `{"'"}`).
- [ ] **Task 3.2: Vérifier la compilation de l'application**
  - Exécuter la compilation de production avec `npm run build` et vérifier l'absence d'erreurs.
