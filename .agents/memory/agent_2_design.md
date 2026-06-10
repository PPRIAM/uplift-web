# Rapport du Directeur Design - UPLIFT 2.0

Ce rapport définit la direction visuelle, le système de jetons de design (tokens), l'élément signature et les structures de mise en page pour le déploiement de l'interface d'UPLIFT 2.0.

---

## 1. Direction Design (Une phrase)

Une ambiance professionnelle et dynamique concrétisée par un contraste fort entre le bleu cobalt et les tons ardoise, ciblant les professionnels et décideurs haïtiens avec l'intention ferme de structurer et d'élever l'écosystème numérique local.

---

## 2. Système de Tokens de Design

Ce système applique les jetons requis tout en garantissant un contraste conforme aux normes d'accessibilité (WCAG AA).

### Couleurs (Color Palette)
*   `--bg-base` : `#F8FAFC` (Gris très clair, base propre et moderne pour les zones de lecture claire)
*   `--bg-surface-dark` : `#334155` (Ardoise foncé, utilisé pour les sections sombres et les cartes contrastées)
*   `--bg-surface-light` : `#FFFFFF` (Blanc pur pour les surfaces de cartes claires)
*   `--text-primary` : `#0F172A` (Bleu nuit très foncé pour un contraste de lecture maximal sur fond clair)
*   `--text-muted` : `#64748B` (Ardoise moyen, pour les descriptions et états secondaires)
*   `--text-light` : `#FFFFFF` (Blanc pur, utilisé pour la lisibilité sur fond ardoise foncé)
*   `--brand-accent` : `#0E1AD4` (Bleu cobalt pur, utilisé pour guider les interactions principales)
*   `--brand-primary` : `#64748B` (Ardoise moyen, pour les éléments structurels)
*   `--brand-secondary` : `#334155` (Ardoise foncé)
*   `--border-color` : `#0F172A` (Bleu nuit foncé, définissant des bordures franches et marquées de 1.5px ou 2px)

### Typographie & Échelles (Typography)
*   `--font-display` : `'The Bold Font', sans-serif` (Réservé aux titres héroïques et accroches majeures, tracking resserré à -0.03em)
*   `--font-heading` : `'Geoform', sans-serif` (En-têtes de sections et titres de cartes)
*   `--font-body` : `'Outfit', sans-serif` (Corps de texte, formulaires et éléments de navigation)
*   **Tailles de police (Font sizes)** :
    *   `h1` (titres héroïques) : `88px` (`text-[88px]`) sur grand écran (clamp maximum respectant la limite de 96px).
    *   `h2` (titres de sections) : `44px` (`text-[44px]`).
    *   `body-intro` (manifeste / accroche courte) : `28px` (`text-[28px]`).
    *   `body-standard` (lecture dense) : `16px` (`text-base`).
    *   `ui-label` (boutons / formulaires) : `14px` (`text-sm`).

### Espacements (Spacing & Rhythm)
*   `--spacing-section-gap` : `96px` à `120px` (Rythme vertical aéré entre les sections majeures)
*   `--spacing-grid-gap` : `24px` (Espacement régulier pour la grille asymétrique)
*   `--spacing-card-padding` : `32px` (Espace respirant à l'intérieur des conteneurs)

### Arrondis (Border-radius)
*   `--radius-input` : `6px` (`rounded-[6px]`) pour les champs de saisie.
*   `--radius-button` : `12px` (`rounded-[12px]`) pour les boutons d'action.
*   `--radius-card` : `16px` (`rounded-2xl`) pour les cartes et conteneurs de services (évite l'excès de courbure).

### Boutons Primaires (Primary Buttons)
*   **Sur fond ardoise / sombre** : Fond blanc (`#FFFFFF`) avec texte Bleu Cobalt (`#0E1AD4`) pour un contraste fort.
*   **Sur fond clair** : Fond Bleu Cobalt (`#0E1AD4`) avec texte Blanc (`#FFFFFF`).

---

## 3. Élément Signature : Le Solar Spine

L'élément signature d'UPLIFT 2.0 est le **Solar Spine** (colonne solaire). 

*   **Description** : Un axe visuel vertical asymétrique de 2px de large en bleu cobalt, excentré sur le côté gauche de la mise en page. Lors du défilement ou du survol, des micro-marqueurs cinétiques cobalt se déplacent le long de cette ligne de force, s'illuminant au niveau des points de pivot et des en-têtes de sections.
*   **Risque esthétique** : Ce composant rompt la symétrie classique et introduit une tension visuelle verticale continue qui pourrait distraire ou fragmenter la mise en page si elle était surchargée.
*   **Justification** : Il ancre visuellement l'identité structurelle d'UPLIFT et matérialise l'idée d'ascension (le terme anglais "uplift"). Il sert de fil conducteur physique tout au long de la page, reliant de manière fluide les sections claires et sombres sans dépendre des dégradés blobs génériques du web.

---

## 4. Wireframes ASCII

### Navbar (Hauteur : 72px)
```
+--------------------------------------------------------------------------------------------------+
|  [Logo UPLIFT]      Evénements    Speakers    A Propos    My Reservations       [S'enregistrer]  |
+--------------------------------------------------------------------------------------------------+
```
*Note : Entièrement sur une seule ligne à l'échelle desktop, hauteur fixe, alignement simple.*

### Hero Section (Asymétrique, tient dans le viewport initial)
```
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   LE FUTUR NUMERIQUE                                / \                                          |
|   DE L'ECOSYSTEME HAITIEN.                       /   *   \     [ Illustration Filaire : ]        |
|                                                /     |     \   [ Cercles concentriques ]         |
|   Unir et structurer l'énergie professionnelle |     o     |   [ dynamiques cobalt     ]         |
|   pour propulser le développement local.       \     |     /                                     |
|                                                  \   *   /                                       |
|   [ Rejoindre l'Elan ]  [ En savoir plus ]          \ /                                          |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```
*Note : Le titre principal (H1) à gauche est structuré sur 2 lignes maximum. Le sous-texte respecte la limite de 20 mots. Les boutons d'action sont visibles sans défilement.*

### Section Contenu : Grille de Services Asymétrique (Inspirée du style Positivus)
```
  [ Titre Section: Services ]
  |
  +-- (Solar Spine - Axe cobalt vertical 2px traversant la section)
  |
  +--- [ Carte A - Style Ardoise Foncé ] --------------------+  +--- [ Carte B - Style Blanc Lumineux ] -------------+
  |    |                                                     |  |                                                     |
  |    |  [ Badge : Developpement ]                          |  |  [ Badge : Infrastructures ]                         |
  |    |                                                     |  |                                                     |
  |    |  Formations intensives et ateliers                  |  |  Solutions cloud locales et                         |
  |    |  techniques pour developpeurs.                      |  |  infrastructures de communication.                  |
  |    |                                                     |  |                                                     |
  |    |                                                     |  |                                                     |
  |    |  (o) -> Lire la suite    [ Illustration Filaire ]   |  |  (o) -> Lire la suite    [ Illustration Filaire ]   |
  |    +-----------------------------------------------------+  +-----------------------------------------------------+
  |
  |
  +--- [ Carte C - Style Blanc Lumineux ] -------------------+  +--- [ Carte D - Style Ardoise Foncé ] ----------------+
  |    |                                                     |  |                                                     |
  |    |  [ Badge : Incubation ]                             |  |  [ Badge : Evenements ]                             |
  |    |                                                     |  |                                                     |
  |    |  Accompagnement de startups et                      |  |  Organisation de meetups et                         |
  |    |  projets locaux innovants.                          |  |  conferences techniques.                            |
  |    |                                                     |  |                                                     |
  |    |                                                     |  |                                                     |
  |    |  (o) -> Lire la suite    [ Illustration Filaire ]   |  |  (o) -> Lire la suite    [ Illustration Filaire ]   |
  |    +-----------------------------------------------------+  +-----------------------------------------------------+
```
*Note : Alternance des couleurs de cartes (sombre ardoise et claire blanche). Chaque carte présente un badge de titre surligné, un lien d'action en bas à gauche symbolisé par un cercle contenant une flèche, et un schéma filaire technique à droite.*

### Footer (Pied de page structuré)
```
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   [Logo UPLIFT]                     [ Inscription a la Newsletter ]                              |
|                                     Votre adresse e-mail : [ Saisir e-mail   ] [ S'abonner ]     |
|   Nous structurons l'avenir                                                                      |
|   numerique haitien.                                                                             |
|                                                                                                  |
|   --------------------------------------------------------------------------------------------   |
|   (c) 2026 UPLIFT. Tous droits reserves.                        Conditions  -  Confidentialite   |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```
*Note : Formulaire Resend simple intégré de manière nette. Pas d'informations superflues ou de widgets de météo.*
