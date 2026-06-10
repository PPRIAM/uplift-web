# Rapport de Direction Artistique & Design — Dashboard Admin UPLIFT 2.0

Ce document définit la charte graphique, les tokens de design, les structures de mise en page (wireframes ASCII) et les règles d'intégration pour le nouveau tableau de bord d'administration d'**UPLIFT 2.0** en s'inspirant de la référence *Intelly* (style néo-brutaliste adouci).

---

## 1. Direction Design (Le Parti Pris Visuel)

> **"Un néo-brutalisme éditorial chaleureux et structuré (style Intelly) qui allie le punch de contrastes marqués (contours noirs de 2px, typographie géométrique) à la douceur d'un arrière-plan crème (#F5F0E8) et de widgets pastel thématiques."**

---

## 2. Système de Tokens de Design

Afin de préserver la cohérence visuelle et d'assurer une mise en œuvre impeccable, les jetons (tokens) suivants doivent être strictement appliqués dans tout l'espace d'administration.

### 2.A Palette Chromatique de Base
*   **Fond principal de l'application (`bg-main`)** : `Cream` | Hex : `#F5F0E8`
    *   *Usage* : Arrière-plan général de l'interface, des pages et de la zone de contenu principal. Remplace le blanc classique pour donner un aspect papier chaud rétro-moderne.
*   **Fond de la barre latérale (`bg-sidebar`)** : `Deep Black` | Hex : `#0D0D11`
    *   *Usage* : Fond de la barre latérale gauche (Sidebar). Offre un contraste asymétrique fort avec la zone centrale.
*   **Texte et contours (`border-ink` / `text-ink`)** : `Pure Black` | Hex : `#000000`
    *   *Usage* : Contours de cartes, textes de titres principaux, icônes de la zone de travail et bordures interactives.
*   **Surfaces des cartes internes (`bg-card-default`)** : `White` | Hex : `#FFFFFF`
    *   *Usage* : Cartes de tableaux ordinaires ou blocs de données neutres (toujours avec contour de 2px).

### 2.B Contours et Ombres Néo-Brutalistes (Hard Borders & Shadows)
*   **Bordures (`border-brutal`)** : `2px solid #000000` (`border-2 border-black`)
    *   *Usage* : Indispensable sur tous les widgets, boutons, cartes, inputs et modals. Aucun contour léger ou dégradé n'est autorisé.
*   **Ombres portées (`shadow-flat`)** : Ombres plates et pleines (sans flou).
    *   *Widget/Bouton actif* : `shadow-[4px_4px_0px_0px_#000000]`
    *   *Bouton au survol / focus* : `shadow-[2px_2px_0px_0px_#000000] translate-x-[2px] translate-y-[2px]` (simule l'écrasement mécanique).
    *   *Badge de statut* : `shadow-[1px_1px_0px_#000000]`

### 2.C Arrondis et Spécifications Géométriques (Border Radius)
*   **Arrondis de widgets et cartes (`rounded-brutal-lg`)** : `16px` à `20px` (`rounded-2xl` / `rounded-[18px]`)
    *   *Usage* : Widgets Bento du dashboard, panneaux principaux et images d'événements.
*   **Arrondis d'éléments interactifs (`rounded-brutal-sm`)** : `8px` (`rounded-lg`)
    *   *Usage* : Champs de saisie (inputs), boutons ordinaires, puces de filtre (Chips) et modals de validation.
*   **Badges et Étiquettes (`rounded-full`)** : Arrondi total (pilule).
    *   *Usage* : Badges de statut de réservation, jetons de tags.

### 2.D Choix Typographiques
*   **Police de Titres & Affichage (Display & Headings)** : `Cabinet Grotesk` ou `Satoshi` (Sans-serif géométrique lourd).
    *   *Configuration Tailwind* : `font-sans font-extrabold tracking-tight text-black`
*   **Police de Corps de Texte (Body text)** : `Satoshi` ou `Inter Tight`.
    *   *Configuration Tailwind* : `text-black leading-relaxed font-normal`
*   **Police de Données & Code (Numbers & Monospace)** : `Geist Mono` ou `JetBrains Mono`.
    *   *Configuration Tailwind* : `font-mono text-black` (utilisée pour toutes les valeurs chiffrées, heures, jauges et dates).

---

## 3. Palette de Widgets Bento (Les 4 Couleurs Pastel)

Chaque widget de la grille Bento supérieure possède une couleur de fond unique héritée de la référence Intelly, associée à une statistique spécifique calculée en temps réel depuis Supabase :

| # | Métrique | Couleur Pastel | Code Hex | Classe CSS / Variable |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Participants Confirmés** | Jaune Vif (*Bright Yellow*) | `#F5D547` | `bg-[#F5D547] text-black` |
| **2** | **Réservations Totales** | Rose Doux (*Soft Rose*) | `#F4A7B9` | `bg-[#F4A7B9] text-black` |
| **3** | **Événements à Venir** | Vert Olive (*Olive Green*) | `#8FAF6A` | `bg-[#8FAF6A] text-black` |
| **4** | **Candidatures Intervenants** | Violet Lavande (*Lavender*) | `#C9B8E8` | `bg-[#C9B8E8] text-black` |

---

## 4. Règles Typographiques (Nombres et Libellés)

Pour éviter l'effet "généré par IA" et structurer l'information de manière ultra-qualitative, les règles suivantes s'imposent :

1.  **Formatage des Nombres** :
    *   Tous les nombres (statistiques, montants en $, pourcentages, capacités de salle) doivent obligatoirement utiliser la police de caractères **monospace** (`font-mono`).
    *   Graisse minimale : `font-semibold` or `font-bold` pour asseoir la présence des données clés.
    *   Pas de nombres décimaux inutiles pour les décomptes physiques (ex: `410` confirmés et non `410.0`). Les revenus financiers sont formatés en euros/dollars arrondis sans centimes (ex: `$45,200`).
2.  **Formatage des Libellés et Légendes** :
    *   Les titres de widgets doivent être écrits en minuscules ou capitalisation de phrase standard (ex: `inscriptions validées`, `chiffre d'affaires`) pour contrecarrer l'automatisme des Kickers en majuscules spammés par l'IA.
    *   Graisse des libellés : `font-medium` ou `font-bold`.
    *   Couleur : Toujours noir pur `#000000` sur fonds pastel ou crème.

---

## 5. Élément Signature : "UPLIFT Neo-Gauge"

L'élément signature de ce tableau de bord est la **UPLIFT Neo-Gauge** (Jauge de Remplissage Brutaliste). Elle est intégrée dans le bloc du **Hero / Événement Vedette** pour indiquer la jauge de réservation en cours.

### Description Technique & Visuelle
*   **Design** : Une barre de progression insérée dans un cadre noir de 2px. La portion remplie utilise un motif géométrique de hachures obliques noires et blanches (`repeating-linear-gradient` incliné à 45 degrés en noir et blanc) sur fond de couleur pastel dynamique (la couleur du widget associé, par exemple `#F5D547` ou `#8FAF6A`).
*   **Dépassement Asymétrique (Signature)** : L'indicateur numérique de pourcentage est affiché dans un macaron circulaire jaune qui dépasse physiquement de la bordure supérieure de la jauge (décalage vertical négatif `translate-y-[-50%]`), créant un décrochage asymétrique typique du style Intelly.
*   **Effet Tactile** : Au survol de la jauge, une bulle d'aide (tooltip) néo-brutaliste noire apparaît, révélant en temps réel le décompte exact (`410 / 500 places réservées`).

---

## 6. Wireframes ASCII Détaillés

Les schémas ci-dessous décrivent la structure et l'ordonnancement des blocs du tableau de bord.

### 6.A Vue Générale avec Sidebar Dépliée (Écran Large)

```
+-------------------------------------------------------------------------------------------------------------------------------------------------------+
| GESTION [<-]                  | RECHERCHE GLOBALE TRANSVERSE & FILTRES                                                                                |
| [Logo Ayibuzz]                | [ Q  Rechercher un inscrit, un evenement, un billet...                     ] [Chips: Tout (x)] [Paye ( )] [En attente ( )]    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| GESTION                       | Good morning, Administrator!                                                             [Mardi 10 Juin 2026] [Actualiser (CW)] |
| [x] Tableau de Bord           |                                                                                                                       |
| [ ] Evenements                | +-- HERO / EVENEMENT VEDETTE ---------------------------------------------------------------------------------------+ |
| [ ] Reservations              | | +-------------------+  Titre : UPLIFT Main Conference 2026                    Statut : [  Featured Live  ]        | |
| [ ] Sessions                  | | |                   |  Date  : 15 Juillet 2026 à 09:00                                                             | |
| [ ] Intervenants              | | | Image             |  Lieu  : Port-au-Prince, Haiti                                                               | |
| [ ] Tickets                   | | | Couverture        |  Jauge de Remplissage (82%) :                                         [ 82% ]                | |
|                               | | |                   |  +--------------------------------------------------------------------+                      | |
| OUTILS                        | | +-------------------+  |//////////////////////////////////////////////////////..............|                      | |
| [ ] Boite d'envoi             | |                        +--------------------------------------------------------------------+                      | |
| [ ] Campagnes                 | |                        [ Editer l'evenement vedette (Bouton Contour 2px) ]                                         | |
| [ ] Modeles d'emails          | +-------------------------------------------------------------------------------------------------------------------+ |
| [ ] Scanner de billets        |                                                                                                                       |
| ----------------------------- | +-- WIDGETS BENTO (STATS GRID) -------------------------------------------------------------------------------------+ |
| [Avatar]                      | | [1. CONFIRMES (#F5D547)]  | [2. RESERVATIONS (#F4A7B9)]  | [3. A VENIR (#8FAF6A)]     | [4. CANDIDATURES (#C9B8E8)]  | |
| Administrator (admin)         | | 410 Participants          | $45,200 Cumules              | 3 Evenements Planifies     | 12 Dossiers a Traiter        | |
| [ Se deconnecter ]            | | Graph: [---__---]         | Graph: [__---^^^]            | Graph: (Icones + Calend)   | Graph: [!!!!!!!...]          | |
|                               | +---------------------------+------------------------------+----------------------------+------------------------------+ |
|                               |                                                                                                                       |
|                               | +-- LISTE PRINCIPALE DES INSCRIPTIONS RECENTES ---------------+ +-- BLOC LATERAL DROIT : AGENDA (SHADCN-UI) --------+ |
|                               | | [Avatar] Jean-Pierre Noel  | Regular Ticket  | [ Confirme ] | |           <<        Juin 2026        >>            | |
|                               | | [Avatar] Marie Guerline    | VIP Pass        | [ Confirme ] | |  Di   Lu   Ma   Me   Je   Ve   Sa                  | |
|                               | | [Avatar] Fritznel Alcindor | Shared Bundle   | [ En Attente] | |        1    2    3    4    5    6                  | |
|                               | | [Avatar] Widline Celestin  | Extended Access | [ Rejete ]   | |   7    8    9  [10]  11   12   13                  | |
|                               | |                                                             | |  14   15   16   17   18   19   20                  | |
|                               | | [ Action : Valider / Ouvrir la liste complete ]             | |  -------------------------------------------------  | |
|                               | +-------------------------------------------------------------+ | TIMELINE DES SESSIONS (Clic -> Drawer / Hover -> TT) | |
|                               |                                                                 | 09:00 - Intro Keynote (Conf. A)  [Details]           | |
|                               |                                                                 | 11:00 - Atelier Next.js 16 (Salle B) [Details]        | |
|                               |                                                                 | 14:00 - Panel Supabase & Scale (Conf. A) [Details]    | |
|                               |                                                                 +------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------------------------------------------------------+
```

### 6.B Vue Latérale avec Sidebar Repliée (Écran Intermédiaire)

Lorsque l'administrateur clique sur le bouton de réduction (`[<-]`), la barre latérale se replie pour ne laisser visibles que les icônes filaires, maximisant la largeur de la zone de travail.

```
+-----+-------------------------------------------------------------------------------------------------------------------------------------------------+
| [*] | RECHERCHE GLOBALE TRANSVERSE & FILTRES                                                                                                          |
| --- | [ Q  Rechercher un inscrit, un evenement, un billet...                     ] [Chips: Tout (x)] [Paye ( )] [En attente ( )]                      |
| (x) | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| (E) | Good morning, Administrator!                                                             [Mardi 10 Juin 2026] [Actualiser (CW)]                   |
| (R) |                                                                                                                                                 |
| (S) | +-- HERO / EVENEMENT VEDETTE -----------------------------------------------------------------------------------------------------------------+ |
| (I) | | +-------------------+  Titre : UPLIFT Main Conference 2026                    Statut : [  Featured Live  ]                                  | |
| (T) | | |                   |  Date  : 15 Juillet 2026 à 09:00                                                                                       | |
|     | | | Image             |  Lieu  : Port-au-Prince, Haiti                                                                                         | |
| (B) | | | Couverture        |  Jauge de Remplissage (82%) :                                         [ 82% ]                                          | |
| (C) | | |                   |  +--------------------------------------------------------------------+                                                | |
| (M) | | +-------------------+  |//////////////////////////////////////////////////////..............|                                                | |
| (S) | |                        +--------------------------------------------------------------------+                                                | |
| --- | |                        [ Editer l'evenement vedette ]                                                                                        | |
| [A] | +---------------------------------------------------------------------------------------------------------------------------------------------+ |
| [x] | (Le reste du contenu s'adapte de facon fluide en grille CSS responsive).                                                                        |
+-----+-------------------------------------------------------------------------------------------------------------------------------------------------+
```

---

## 7. Comportements d'Interaction & Micro-Animations (Motion Guide)

*   **Réduction de la Sidebar** : Transition CSS fluide de largeur (`transition-[width] duration-300 ease-out-expo`).
*   **Bouton d'Actualisation (Header)** : Animation rotative infinie lors du rechargement des données, avec arrêt net sur l'angle initial (`animate-spin` temporaire contrôlé par l'état Supabase).
*   **Tiroir de Détails (Drawer Sessions)** : Glissement depuis la droite (`translate-x`) avec effet d'attraction ressort (`type: "spring", stiffness: 300, damping: 30`).
*   **Bouton Néo-Brutaliste** : Écrasement visuel tactile (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000000]`).
