# Journal de Refonte Visuelle Néo-Brutaliste — Dashboard Admin (Agent 6)

Ce journal documente les choix esthétiques, d'animation et de mise en page réalisés dans le cadre de la refonte du tableau de bord d'administration d'**UPLIFT 2.0** (page `app/admin/page.tsx` et `app/admin/layout.tsx`), conformément aux spécifications de l'utilisateur et aux directives de l'Agent 3.

---

## 1. Objectifs de la Refonte Esthétique (Charte UPLIFT 2.0)

1.  **Harmonisation de la mise en page** : Application du style néo-brutaliste adouci d'UPLIFT 2.0 sur tous les blocs de contenu : contours noirs marqués de `2px` (`border-2 border-black`) et ombres solides de `4px` sans flou (`shadow-[4px_4px_0px_0px_#000000]`).
2.  **Couleurs de la charte UPLIFT 2.0** :
    *   **Background principal (`bg-main`)** : `#F8FAFC` (remplace le crème rétro `#F5F0E8`).
    *   **Text / Primary** : `#0F172A` (Bleu nuit/Slate très sombre).
    *   **Accent (Cobalt Blue)** : `#0E1AD4`.
    *   **Secondary** : `#334155` / `#64748B`.
3.  **Refonte de la Sidebar** : La couleur sombre de fond de la barre latérale gauche a été migrée de `#0D0D11` à `#0F172A` (bleu nuit profond d'UPLIFT).
4.  **Widgets Bento aux couleurs de la marque** : Remplacement des teintes pastel d'Intelly par les couleurs de la charte UPLIFT 2.0 :
    *   **Widget 1 (Participants)** : Cobalt clair (`bg-[#E0E7FF]` et texte cobalt `#0E1AD4`).
    *   **Widget 2 (Réservations)** : Ardoise moyenne (`bg-[#F1F5F9]` et texte ardoise foncée `#334155`).
    *   **Widget 3 (Événements)** : Ardoise foncée (`bg-[#E2E8F0]` et texte ardoise très foncée).
    *   **Widget 4 (Candidatures)** : Blanc pur (`bg-[#FFFFFF]`) avec accentuation cobalt.
5.  **Élément Signature "UPLIFT Neo-Gauge"** : Remplacement du jaune d'Intelly par les teintes UPLIFT :
    *   Barre de progression remplie en bleu cobalt clair (`#E0E7FF`) avec motif géométrique de hachures obliques noires à 45°.
    *   Macaron de pourcentage overlapping en bleu cobalt pur (`bg-[#0E1AD4]` et texte blanc) qui dépasse verticalement par le haut (`top-0 -translate-y-1/2`).
    *   Bulle d'aide (tooltip) tactile contrastée noire avec triangle d'indication.
6.  **Animations Cinétiques & Accessibilité** :
    *   Effet de *count-up* dynamique pour les indicateurs chiffrés des widgets.
    *   Apparition progressive décalée (*staggered fade-in/fade-slide-up*) des cartes et conteneurs.
    *   Respect strict de `prefers-reduced-motion` : transition instantanée et saut du count-up en cas de mouvement réduit activé chez l'utilisateur.

---

## 2. Détails d'Implémentation & Ajustements de Cohérence

### A. Intégration du Store Partagé
*   La recherche fédérée de `page.tsx` est abonnée à `searchQuery` de `useAdminLayoutStore`.
*   Le filtrage des réservations récentes est synchronisé sur l'état `activeFilter` de l'en-tête global.
*   Les chips de filtres ont été harmonisés aux couleurs sobres d'UPLIFT 2.0 (Gris ardoise clair, cobalt clair pour le filtre actif, etc.).

### B. Calendrier & Timeline
*   **Calendrier** : La pastille du jour sélectionné a été modifiée en bleu cobalt vif (`bg-[#0E1AD4]`) avec texte blanc. Les points indicateurs de session ont été passés en cobalt.
*   **Timeline** : Les puces temporelles de timeline utilisent désormais le bleu cobalt UPLIFT. Les blocs de sessions ont été transformés en boîtes blanches néo-brutalistes à contours et ombres plates noirs.

### C. Modals et Tiroirs (Drawers)
*   Tous les éléments d'interaction (modal de confirmation, tiroir de détails de session) utilisent le fond de page `#F8FAFC` et des accents bleu cobalt pour les boutons primaires d'action.
