# Journal de Refonte des Styles - UPLIFT 2.0
**Auteur :** Styles Engineer Agent (Agent 4)  
**Date :** 10 Juin 2026  
**Projet :** Google Antigravity - UPLIFT 2.0 (uplift-web)

Ce document retrace les actions de refonte des styles réalisées conformément aux directives de design de l'Agent 2 et aux exigences d'accessibilité et de performance.

---

## 1. Intégration de Tailwind v4 & Configuration du Thème
*   **Importation v4 :** Remplacement complet de l'ancien système par la directive `@import "tailwindcss";` au sommet de `app/globals.css`.
*   **Bloc `@theme` :** Déclaration de tous les jetons (tokens) visuels d'UPLIFT 2.0 :
    *   **Couleurs :** Mappage des variables de base : `background` (`#F8FAFC`), `text-primary` (`#0F172A`), `accent` (`#0E1AD4` - Bleu Cobalt), `primary` (`#64748B`), `secondary` (`#334155`).
    *   **Polices de caractères :** Association des familles `--font-display`, `--font-heading`, `--font-body` pour faire le lien avec les polices locales de Next.js (`layout.tsx`).
    *   **Arrondis :** Définition de `input` (`6px`), `button` (`12px`), et `card` (`16px`) pour respecter la douceur visuelle exigée.
*   **Compatibilité :** Déclaration explicite des variables CSS dans `:root` pour assurer la résolution des appels `var(--...)` existants dans les composants (tels que `Navbar` et `Footer`).

---

## 2. Élément Signature : Le Solar Spine
*   **Structure CSS :** Implémentation des classes de positionnement et de style pour le Solar Spine :
    *   `.solar-spine-container` : Barre verticale de 2px de large en bleu cobalt translucide, positionnée de façon asymétrique à gauche (à 24px du bord) et affichée uniquement sur grand écran (`xl`) pour éviter de surcharger les écrans mobiles (approche mobile-first).
    *   `.solar-spine-track` : Piste active qui progresse lors du défilement avec une transition fluide de hauteur (`will-change: height`).
    *   `.solar-spine-indicator` : Marqueur circulaire cobalt qui glisse le long de la ligne, avec un effet d'alignement au pixel près et un léger rayonnement lumineux.
    *   `.solar-spine-ticker` : Ticker vertical textuel affichant l'élan d'UPLIFT (« LEVE ANSANM · BRIYE ANSANM ») tourné à 180° le long de la ligne.

---

## 3. Composants Communs & Alternance
*   **Cartes Swiss-Print / Néo-brutalistes :** 
    *   Création de la classe `.card` avec une bordure nette de 1.5px (`#0F172A`) et une ombre portée décalée non floutée de 4px (`box-shadow: 4px 4px 0px #0F172A`), imitant le style de design suisse imprimé.
    *   **Alternance automatique :** Configuration pour que les cartes paires (`:nth-child(even)`) adoptent automatiquement le style sombre (`#334155`) avec texte blanc clair pour un contraste saisissant, conformément au style Positivus préconisé.
*   **Boutons (CTA) :**
    *   `.btn-primary` : Bouton dynamique cobalt avec texte clair, doté d'une ombre plate de 3px. S'inverse sur fond sombre pour un contraste optimal.
    *   `.btn-secondary` : Bouton sobre avec bordure nette et ombre.
    *   `.btn-ghost` : Bouton de lien sans bordure pour les interactions tertiaires de la Navbar.
    *   Intégration d'un effet tactile d'enfoncement physique au clic (`active:translate(1px, 1px)` avec réduction de l'ombre).

---

## 4. Motion Design & Interactions
*   **Entrées progressives :** Implémentation de keyframes CSS (`fadeInUp`, `fadeIn`, `float`, `pulseGlow`) pour animer les orbes d'arrière-plan et le contenu sans bloquer les performances de rendu critique.
*   **Micro-interactions au survol :**
    *   Élévation physique des cartes au survol (`translateY(-4px)` et accroissement de l'ombre).
    *   Élévation des boutons de 2px.
*   **Transitions matérielles :** Utilisation de courbes d'accélération et décélération naturelles (`cubic-bezier(0.2, 0.8, 0.2, 1)`) avec des délais échelonnés.

---

## 5. Accessibilité & Normes WCAG AA
*   **Respect du mouvement réduit :** Utilisation de la règle `@media (prefers-reduced-motion: reduce)` pour forcer les durées d'animation et de transition à zéro, éliminer les translations physiques au survol, tout en préservant le design statique net.
*   **Contraste des textes :** Ajustement des niveaux de gris et des couleurs de texte pour garantir que toutes les associations (texte noir sur fond gris clair, texte blanc sur fond ardoise foncé) respectent et dépassent le ratio de contraste de 4.5:1 requis par la norme WCAG AA.
*   **Légibilité :** Optimisation du rendu des textes avec `optimizeLegibility` et `-webkit-font-smoothing`.
