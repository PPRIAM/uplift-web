# Journal des modifications des composants - UPLIFT 2.0
*Auteur : Agent 5 (Component Redesigner Agent)*
*Date : 10 Juin 2026*

Ce document répertorie les modifications apportées aux composants de l'application UPLIFT 2.0 pour appliquer les jetons de design, la hiérarchie et les éléments signatures définis par l'Agent 2.

---

## 1. Navbar (`components/Navbar.tsx`)
*   **Hauteur fixe** : Hauteur calée à `72px` (`h-[72px]`) sur ordinateur et mobile.
*   **Logo & Liens Cobalt** : Application d'un filtre CSS précis transformant le logo original en bleu cobalt (`#0E1AD4`). Les liens inactifs utilisent désormais du texte ardoise (`#334155`) avec effet de survol cobalt, et le lien actif utilise un fond cobalt translucide (`bg-[#0E1AD4]/10` et texte `#0E1AD4`).
*   **Indicateur Live propre** : Remplacement du symbole textuel brut par une pilule esthétique contenant un point clignotant avec animation `animate-ping` et un label rouge gras "Direct".
*   **Boutons conformes** : Mise en conformité des boutons de connexion/déconnexion et d'inscription (les boutons d'action utilisent la classe globale `.btn-primary` cobalt ou `.btn-secondary` ardoise d'UPLIFT 2.0).

## 2. Footer (`components/Footer.tsx`)
*   **Simplification de la grille** : Remplacement de la grille complexe par une structure épurée à deux blocs principaux (Manifeste de marque à gauche et Formulaire d'inscription à la newsletter à droite).
*   **Arrondis et bordures** : Respect de `--radius-input` (`6px`) pour le champ e-mail et `--radius-button` (`12px`) pour le bouton de soumission.
*   **Intégration du formulaire Resend** : Conservation de la logique fonctionnelle originale (soumission de l'adresse e-mail avec validation locale et retour d'état).
*   **Typographie** : Utilisation de la police `font-heading` pour le titre de la newsletter et de la police `font-body` pour le corps de texte.

## 3. SolarSpine (`components/SolarSpine.tsx`)
*   **Axe cobalt** : Passage de la ligne de défilement principale au bleu cobalt pur (`#0E1AD4`) au lieu des anciens dégradés décolorés d'UPLIFT 1.0.
*   **Indicateur cinétique** : Le point cinétique de progression du défilement utilise le bleu cobalt d'UPLIFT 2.0 (ou vert `#10B981` combiné au cobalt lors d'une diffusion en direct active).
*   **Ticker vertical** : Remplacement et stylisation du texte vertical décoratif en "UPLIFT 2.0 • LEVE ANSANM • HAÏTI" en majuscules avec la police `font-body` semi-grasse et espacée.

## 4. HeroSection (`components/home/HeroSection.tsx`)
*   **Structure asymétrique** : Alignement de la structure sur une grille de 12 colonnes. Le contenu textuel occupe 7 colonnes à gauche et l'illustration technique occupe 5 colonnes à droite.
*   **Fond clair** : Transition d'un fond sombre opaque vers le fond gris très clair officiel (`#F8FAFC`) avec des lignes de grille structurelles asymétriques très subtiles en arrière-plan.
*   **Illustration filaire** : Création d'un ensemble géométrique dynamique en SVG composé de cercles concentriques animés (rotation horaire et anti-horaire lente) et de lignes radiales techniques en bleu cobalt.
*   **Contrôle du Viewport** : Réduction des marges et espacements internes pour s'assurer que la section entière (y compris les boutons d'action d'inscription et de redirection) tient proprement dans le viewport de l'utilisateur (`min-h-[90dvh]` sur mobile et `min-h-[100dvh]` sur grand écran) sans forcer le défilement immédiat.
*   **Boutons cobalt** : Les boutons d'action utilisent les styles d'interactions primaires d'UPLIFT 2.0 (Fond cobalt, ombre plate de 3px et translation réactive).

## 5. StatsBar (`components/home/StatsBar.tsx`)
*   **Chiffres mono/tabulaires** : Utilisation de la police `font-mono` et de la classe `tabular-nums` pour garantir un alignement géométrique parfait des indicateurs chiffrés.
*   **Aération et contraste** : Amélioration de l'espacement entre les valeurs. Les métriques sont colorées avec le bleu cobalt pur (`#0E1AD4`) pour capter immédiatement le regard.
*   **Bordures de section** : Remplacement des bordures par des lignes franches de `1.5px` de couleur bleu nuit (`#0F172A`).

## 6. SessionsSection (`components/home/SessionsSection.tsx`) & SpeakersSection (`components/home/SpeakersSection.tsx`)
*   **Alternance des cartes** : Les grilles appliquent une alternance systématique entre cartes sombres ardoise (`bg-[#334155]` avec texte blanc) et cartes claires blanches (`bg-[#FFFFFF]` avec texte bleu nuit `#0F172A`).
*   **Spécifications de cartes** :
    *   Bordures de `1.5px` de couleur nuit (`#0F172A`).
    *   Ombre plate de `4px` non floutée de couleur nuit (`#0F172A`).
    *   Arrondis limités à `16px` (`rounded-2xl`).
*   **Intégration filaire** : Ajout d'un SVG de motif filaire technique très discret (`opacity-[0.06]`) à l'arrière-plan de chaque carte pour renforcer l'identité d'UPLIFT 2.0.

## 7. WhyUpliftSection (`components/home/WhyUpliftSection.tsx`) & CtaBanner (`components/home/CtaBanner.tsx`)
*   **WhyUpliftSection** :
    *   Application de la grille asymétrique et de l'alternance de cartes sombres et claires avec bordures franches de 1.5px et ombres plates de 4px.
    *   Conteneurs d'icônes mis en conformité avec la couleur cobalt.
    *   Motif de grille filaire SVG décoratif à l'arrière-plan de chaque carte.
*   **CtaBanner** :
    *   Remplacement du grand arrondi de 28px par l'arrondi de carte standard d'UPLIFT 2.0 de `16px`.
    *   Ajout d'une bordure franche de 1.5px et d'une ombre plate noire de 4px sur le conteneur principal.
    *   Remplacement des anciens orbes flous d'arrière-plan par des cercles et lignes filaires techniques en SVG.
    *   Mise à jour du bouton d'action pour correspondre au style primaire sur fond sombre (Fond blanc, texte cobalt, bordure franche et ombre plate).

## 8. LoadingSpinner (`components/LoadingSpinner.tsx`)
*   **Thématisation cobalt & ardoise** : Remplacement des anciennes couleurs d'UPLIFT 1.0 (electric-indigo, sunlit-amber) par les couleurs de marque d'UPLIFT 2.0.
*   **Spins & Dots** : L'anneau rotatif externe et le point central du loader utilisent désormais le bleu cobalt pur (`#0E1AD4`), tandis que les anneaux secondaires et autres points utilisent l'ardoise.
*   **Typographie** : La police du texte du label de chargement a été mise en conformité avec la police globale `font-body` (Outfit).
