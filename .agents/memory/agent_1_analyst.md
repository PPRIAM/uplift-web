# Rapport d'Analyse Globale & Audit Technique — UPLIFT 2.0

Ce document répertorie l'analyse d'architecture, l'audit technique de la base de code, l'application du nouveau design system et l'extraction visuelle de l'image de référence pour le projet **UPLIFT 2.0 (uplift-web)**.

---

## 1. Stack Technique, Structure des Composants et Approche CSS

### Stack Technique
*   **Framework & Runtime** : [Next.js](file:///D:/UPLIFT20/uplift-web/package.json#L23) `v16.2.2` (React `19.2.4` / React DOM `19.2.4`) avec l'**App Router**.
*   **Base de Données & Auth** : Intégration [Supabase SSR](file:///D:/UPLIFT20/uplift-web/package.json#L14) (`@supabase/ssr` `0.10.0` et `@supabase/supabase-js` `2.101.1`) avec gestion de cookies à la périphérie (Edge) et clients d'API typés.
*   **Base de Données Locale & ORM** : Prisma (`v6.19.3`) définie comme dépendance de développement avec un schéma [prisma/schema.prisma](file:///D:/UPLIFT20/uplift-web/prisma/schema.prisma).
*   **Gestion d'État** : [Zustand](file:///D:/UPLIFT20/uplift-web/package.json#L30) `v5.0.12` pour l'état d'authentification (`store/authStore.ts`).
*   **Formulaires & Validation** : [React Hook Form](file:///D:/UPLIFT20/uplift-web/package.json#L27) (`7.72.0`), [Zod](file:///D:/UPLIFT20/uplift-web/package.json#L29) (`4.3.6`) et `@hookform/resolvers`.
*   **Animations & Transitions** : [GSAP](file:///D:/UPLIFT20/uplift-web/package.json#L20) (`3.15.0`) et `@gsap/react` pour les effets de défilement (ScrollTrigger) et d'apparition.

### Structure des Composants
Le projet adopte une séparation nette des responsabilités :
1.  **Pages Serveur & API Routes (Dossier `app/`)** : Exécution des requêtes Supabase côté serveur et gestion des points d'accès (REST API).
2.  **Composants Clients (Dossier `components/`)** : Composants interactifs autonomes contenant la logique d'état et les déclencheurs GSAP (ex. `HomePageClient.tsx`, `StreamPlayer.tsx`).
3.  **Utilitaires & Services (Dossiers `lib/` et `utils/`)** : Données fictives (`defaults.ts`), helpers de date et instanciation des clients Supabase.

### Approche CSS Actuelle
*   **Tailwind CSS v4** + PostCSS (via `@tailwindcss/postcss`).
*   > [!WARNING]
    > **Anomalie critique détectée** : Le fichier principal [app/globals.css](file:///D:/UPLIFT20/uplift-web/app/globals.css) est actuellement **complètement vide**. Dans Tailwind v4, l'absence de la directive `@import "tailwindcss";` dans le fichier d'entrée empêche la compilation de toutes les classes utilitaires et l'injection des styles personnalisés (comme `.btn-primary` ou `.card`), ce qui casse l'intégralité du rendu visuel en production.

---

## 2. Patrons de Design Actuels (Aesthetic Design System)

Actuellement documenté dans [DESIGN.md](file:///D:/UPLIFT20/uplift-web/DESIGN.md) sous le nom d'**"Élan Violet"** :
*   **Couleurs** : 
    *   *Obsidian Night (Base Sombre)* : `#08090E` / `#0A0A0E` (utilisé pour le Hero et la section vidéo).
    *   *Lavender Dawn (Base Claire)* : `#F5F6FA` / `#F3F2FC` / `#F9F9FB` (utilisé pour les formulaires et grilles Bento).
    *   *Sunlit Amber* (Brand Primary originel) : `#FFAC00` (remplacé par le bleu cobalt dans les récents audits).
    *   *Cobalt Blue* (Nouveau Brand Primary) : `#0E1AD4`.
    *   *Electric Indigo* (Brand Secondary) : `#5A45FF`.
*   **Typographie** :
    *   *Display/Heading* : `Satoshi` ou `The Bold Font` (local/Google fonts) avec un tracking resserré (`-0.03em`) et des graisses lourdes.
    *   *Body/UI* : `Outfit` ou `Geist` avec une hauteur de ligne par défaut à `1.6`.
*   **Espacements & Marges** : 
    *   Rythme vertical important (`96px` à `120px` sur desktop).
    *   Composants de cartes organisés avec des grilles Bento asymétriques à espaces modérés (`16px` à `24px`).
*   **Layout & Bordures** : 
    *   Bordures des conteneurs à grands rayons (`rounded-[28px]` ou `rounded-3xl` pour les sections, `rounded-2xl` / `16px` pour les cartes individuelles).
    *   Mouvements interactifs réactifs (`translateY(-4px)` au survol avec transitions fluides).

---

## 3. Problèmes de Code, Dette Technique et Code Mort

### ⚠️ Problèmes Majeurs
1.  **Fichier `globals.css` vide** : Nécessite la ré-introduction immédiate des directives d'importation de Tailwind CSS v4 et la redéfinition des variables de thème CSS.
2.  **Redondance ORM (Prisma)** : Le projet conserve `prisma/schema.prisma` et dépend de Prisma CLI, mais toutes les requêtes de données actives utilisent le SDK de Supabase client. Prisma est actuellement un "code mort" conceptuel qui alourdit les dépendances.
3.  **Redondance de page de Login** : `app/login/page.tsx` n'est qu'un wrapper de redirection vers `app/auth/login/page.tsx`. C'est une bonne pratique de rétrocompatibilité, mais cela crée une complexité évitable.
4.  **Avertissements de Dépendances de Hooks React (9 Avertissements)** :
    *   Dans `components/HomePageClient.tsx` (missing `fetchLiveStatus`).
    *   Dans `app/events/page.tsx` (missing `supabase`).
    *   Dans les contrôles administrateurs (ex. `LiveControlClient.tsx`).
5.  **Entités HTML non échappées** : Présence de caractères `'` bruts dans les balises de plusieurs composants JSX (ex. `S'inscrire` ou des textes d'explications), ce qui peut provoquer des erreurs de build selon les configurations d'ESLint.
6.  **Sécurité & CVEs (9 vulnérabilités)** :
    *   `axios` (vulnérabilités SSRF et Prototype Pollution - CVE-2025-62718).
    *   `next` (vulnérabilité DoS sur les composants serveur et contournements XSS de nonces).

---

## 4. Carte des Fichiers Clés

```
uplift-web/
├── app/
│   ├── globals.css                # Style global (Actuellement vide - BUG)
│   ├── layout.tsx                 # Layout principal, imports de polices, métadonnées
│   ├── page.tsx                   # Page d'accueil (Serveur - Fetch de Supabase)
│   ├── about/                     # Page À Propos (Layout + Page client)
│   ├── auth/                      # Routes d'authentification (Login, Register)
│   ├── admin/                     # Tableaux de bord d'administration (Tickets, Events, Speakers)
│   ├── api/                       # Points de terminaison d'API REST
│   └── my-reservations/           # Espace utilisateur pour voir les réservations
├── components/
│   ├── HomePageClient.tsx         # Présentation de l'accueil, logique GSAP
│   ├── Navbar.tsx                 # Barre de navigation fixe (72px)
│   ├── Footer.tsx                 # Pied de page informatif avec formulaire Resend
│   ├── StreamPlayer.tsx           # Lecteur vidéo HLS interactif
│   └── SolarSpine.tsx             # Composant d'ancrage asymétrique (Solar Spine)
├── lib/
│   ├── constants/defaults.ts      # Valeurs par défaut et fixtures de repli
│   ├── dateUtils.ts               # Formateurs de dates
│   └── ticketUtils.ts             # Utilitaires de calculs pour les tickets
├── store/
│   └── authStore.ts               # État d'authentification Zustand
└── utils/
    └── supabase/                  # Initialisation des clients Supabase (client, server, middleware)
```

---

## 5. Application des Jetons (Tokens) du Nouveau Design System

Pour aligner l'application avec les directives de la marque **UPLIFT 2.0 (audience haïtienne, énergie professionnelle medium)**, les jetons suivants doivent être injectés dans le thème CSS global :

### Couleurs
*   `--bg-base` : `#F8FAFC` (Gris très clair, propre et moderne)
*   `--text-primary` : `#0F172A` (Bleu nuit très foncé pour un contraste maximal)
*   `--brand-accent` : `#0E1AD4` (Bleu Cobalt pur)
*   `--brand-primary` : `#64748B` (Ardoise moyen, pour les éléments structurels)
*   `--brand-secondary` : `#334155` (Ardoise foncé)

### Typographie & Tailles
*   `--font-display` : `'The Bold Font', sans-serif` (Pour les titres héroïques et accroches principales)
*   `--font-heading` : `'Geoform', sans-serif` (Pour les en-têtes de sections et sous-titres)
*   `--font-body` : `'Outfit', sans-serif` (Pour la lecture courante et les formulaires)
*   **Tailles de police** :
    *   `h1` (titres héroïques) : `88px` (`text-[88px]`) sur grand écran.
    *   `h2` (titres de sections) : `44px` (`text-[44px]`).
    *   `body` (corps de texte) : `28px` (`text-[28px]`) — *Note : 28px est très grand pour du texte de corps standard, cela doit être utilisé pour du texte de paragraphe de type manifeste ou introductif, avec un repli à des échelles plus lisibles pour les données denses.*

### Arrondis (Border-radius)
*   `--radius-input` : `6px` (`rounded-[6px]`) pour les champs de formulaire et inputs.
*   `--radius-button` : `12px` (`rounded-[12px]`) pour les boutons interactifs.

### Boutons Primaires
*   **Fond** : Blanc (`#FFFFFF`)
*   **Texte** : Bleu Cobalt (`#0E1AD4`)
*   *Note d'implémentation* : Ce bouton à fond blanc et texte cobalt doit se détacher sur des sections de fond sombre ou de couleur primaire ardoise (`#334155`) pour préserver un contraste accessible.

---

## 6. Analyse de l'Image de Référence (WizardZ / Style Positivus)

L'image de référence montre un design moderne inspiré du style graphique *Positivus* :

1.  **Structure du Layout & Grille** :
    *   Mise en page épurée sur fond clair (`#F8FAFC`).
    *   Une section **Hero** asymétrique avec un titre imposant à gauche et une illustration 3D simplifiée avec des cercles concentriques à droite.
    *   Une section **Services** structurée sous forme de grille compacte `2x2`.
    *   Une section **CTA** ("Let's make things happen") occupant toute la largeur du conteneur avec une mascotte filaire flottante à droite.
    *   Une section **Étude de cas (Case Studies)** unifiée dans une grande carte sombre divisée en 3 colonnes par des lignes de séparation fines.
2.  **Hiérarchie Visuelle & Surlignage** :
    *   Utilisation systématique de badges de titres surlignés avec une couleur d'accent (vert lime dans la référence).
    *   Alternance de couleurs de cartes : les cartes blanches ont un badge d'accent vert lime et un texte noir, tandis que les cartes sombres ont un badge blanc et un texte blanc.
3.  **Traitement des Cartes de Services** :
    *   Bordures noires fortes et bien définies (`1px` ou `2px solid black`).
    *   Coins arrondis prononcés (environ `30px` à `40px`).
    *   Logique de lien "Learn more" en bas à gauche de chaque carte avec une flèche directionnelle logée dans un cercle.
    *   Une illustration minimaliste de type schéma technique filaire est placée à droite dans chaque carte.
4.  **Adaptation pour UPLIFT 2.0** :
    *   Remplacer l'accent vert lime par le bleu cobalt (`#0E1AD4`) ou par les couleurs ardoise du design system.
    *   Conserver l'alternance asymétrique (cartes claires et cartes ardoise foncé `#334155`) avec des bordures marquées.
    *   Appliquer les boutons avec les rayons de courbure spécifiés (`12px` pour les boutons, `6px` pour les formulaires).
