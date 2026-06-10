# Rapport d'Analyse Globale du Tableau de Bord d'Administration — UPLIFT 2.0

Ce rapport présente une analyse exhaustive de l'espace d'administration du projet **UPLIFT 2.0 (uplift-web)**, une déconstruction visuelle détaillée de l'image de référence (style *Intelly*) et une carte d'écart (gap mapping) identifiant les opportunités d'adaptation et d'intégration esthétique pour la plateforme.

---

## 1. Analyse 1A — Codebase & Features (Espace Admin)

### Stack Technique de l'Espace Admin
L'architecture de la section d'administration s'appuie sur les technologies suivantes :
*   **Framework & Rendu** : Next.js App Router (v16.2.2) s'exécutant sur React 19 et exploitant des composants hybrides (Serveur/Client).
*   **Sécurité et Contrôle d'Accès** : L'authentification et le contrôle d'accès sont gérés via Supabase SSR (`@supabase/ssr`). Le fichier `app/admin/layout.tsx` sert de garde d'accès (Guard) : il vérifie la session Supabase au montage de la page et redirige les utilisateurs non autorisés (sans le rôle `admin`) vers `/auth/login`. Le middleware Edge (`middleware.ts`) valide également les tokens de session pour sécuriser les routes sensibles.
*   **Gestion d'État Local** : Zustand (`store/authStore.ts`) est utilisé pour hydrater et partager l'état de l'utilisateur connecté (`useAuthStore`) à travers toute la zone d'administration.
*   **Interactions et Formulaires** : Formulaires réactifs construits avec des hooks React standard connectés directement au client Supabase pour le CRUD.

### Structure des Composants et Routage
Toutes les vues d'administration sont regroupées sous la route parente `/admin/` dans l'arborescence de l'App Router.
Le fichier `app/admin/layout.tsx` sert de squelette commun. Il intègre :
1.  **Une barre latérale (Sidebar) responsive** : affichant le logo d'Ayibuzz Media, des raccourcis groupés par fonction, le profil de l'administrateur connecté et le bouton de déconnexion.
2.  **Un en-tête d'action (Header)** : avec un message de bienvenue personnalisé et un bouton d'actualisation manuelle doté d'une animation rotative (`lucide-react/RefreshCw`).
3.  **Un conteneur principal** : qui applique des espacements fluides et injecte les pages enfants dans le flux de mise en page.

### Liste Exhaustive des Fonctionnalités Existantes
Toutes les pages administratives ont été auditées au niveau du code. Le statut de chaque fonctionnalité est le suivant :

| Fonctionnalité | Chemin d'accès | Description | Statut |
| :--- | :--- | :--- | :--- |
| **Tableau de Bord Principal** | `app/admin/page.tsx` | Vue d'ensemble affichant les métriques clés (inscriptions, réservations, événements en cours) et des aperçus rapides des derniers inscrits et événements à venir. | ✅ Fonctionnel |
| **Gestion des Événements** | `app/admin/events/page.tsx` | CRUD complet pour les événements. Gestion de l'image de couverture (Supabase Storage bucket `event-covers`), publication et drapeaux `is_featured` / `is_live` avec contrainte d'unicité vedette. | ✅ Fonctionnel |
| **Gestion des Réservations** | `app/admin/reservations/page.tsx` | Inscriptions et paiements. Actions d'approbation et de rejet avec envoi automatique de courriels (Resend API) avec code QR de billet personnalisé et suppression automatique des preuves de paiement. Export CSV. | ✅ Fonctionnel |
| **Gestion des Intervenants** | `app/admin/speakers/page.tsx` | CRUD des intervenants. Téléversement de portraits (Supabase Storage bucket `speakers`), toggle de visibilité publique et liens vers les réseaux sociaux. | ✅ Fonctionnel |
| **Gestion des Billets** | `app/admin/tickets/page.tsx` | Configuration des types de billets. Gestion des stocks d'allocation (Standard, Partagé, Étendu) et support des grilles de prix multiples (Pricing Tiers). | ✅ Fonctionnel |
| **Candidatures Intervenants** | `app/admin/speaker-applications/` | Traitement des propositions. L'approbation d'une candidature (`promoteToSpeaker`) crée automatiquement un profil d'intervenant et génère les liaisons BDD. | ✅ Fonctionnel |
| **Inbox & Brouillons Mail** | `app/admin/emails/page.tsx` | Boîte de réception des emails envoyés et des brouillons d'envoi. Intègre la recherche par sujet. | ✅ Fonctionnel |
| **Gestion des Campagnes** | `app/admin/emails/campaigns/` | Assistant pas-à-pas (Wizard) pour concevoir et planifier des campagnes d'emailing ciblant des événements spécifiques ou des types d'audience. | ✅ Fonctionnel |
| **Modèles d'Emails** | `app/admin/emails/templates/` | Éditeur HTML de gabarits d'emails. Détection automatique des jetons de personnalisation (`{{full_name}}`, `{{qr_code}}`, etc.). | ✅ Fonctionnel |
| **Scanner de Billets** | `app/admin/scanner/page.tsx` | Interface de validation en temps réel à l'entrée de l'événement. Utilise l'API `/api/tickets/validate` pour vérifier et marquer le billet comme utilisé. | ✅ Fonctionnel |
| **Planification des Sessions** | `app/admin/sessions/page.tsx` | Gestion de l'agenda horaire. Permet d'associer des conférences/ateliers à un événement et à un intervenant. | ✅ Fonctionnel |

### Carte des Fichiers d'Administration
```
uplift-web/app/admin/
├── layout.tsx                      # Layout admin global, garde d'accès (Guard) et Sidebar
├── page.tsx                        # Dashboard d'accueil (statistiques et activités récentes)
├── analytics/
│   └── page.tsx                    # Rapports financiers et statistiques de billetterie
├── emails/
│   ├── page.tsx                    # Interface de boîte mail principale (Inbox)
│   ├── campaigns/
│   │   └── page.tsx                # Assistant de gestion et d'envoi de campagnes groupées
│   ├── compose/
│   │   └── page.tsx                # Compositeur HTML riche avec jetons personnalisés
│   └── templates/
│   │   └── page.tsx                # Gestionnaire de gabarits d'emails et tokens
├── events/
│   └── page.tsx                    # Gestion des événements (CRUD, upload, featured/live)
├── reservations/
│   └── page.tsx                    # Liste des inscrits, modération des paiements et export
├── scanner/
│   └── page.tsx                    # Validateur de code QR pour l'entrée aux événements
├── sessions/
│   └── page.tsx                    # Programmation horaire (sessions de l'agenda)
└── speaker-applications/
    ├── actions.ts                  # Actions serveur d'approbation et de promotion
    └── page.tsx                    # Modération des candidatures d'intervenants
```

---

## 2. Analyse 1B — Image de Référence (Style Intelly)

L'image de référence présente un tableau de bord à l'esthétique néo-brutaliste adoucie (style *Intelly*), caractérisé par un contraste marqué, une palette pastel/vibrante et des contours graphiques affirmés.

### Palette de Couleurs Identifiée
*   **Fond de l'interface (Base)** : Crème doux (`#F5F0E8`). Il remplace le blanc clinique traditionnel pour donner une vibe plus chaleureuse et rétro-moderne.
*   **Fond de la barre latérale (Sidebar)** : Noir profond (`#000000`), créant un bloc de contraste vertical asymétrique très puissant à gauche.
*   **Accents des widgets (Fills)** :
    *   Jaune vif : `#F5D547`
    *   Rose doux : `#F4A7B9`
    *   Vert olive frais : `#8FAF6A`
    *   Violet lavande : `#C9B8E8`
*   **Bordures et contours** : Noir pur (`#000000`), d'une épaisseur marquée (2px) pour asseoir le style graphique "flat design" et néo-brutaliste.

### Structure de la Sidebar
*   **Style** : Fond noir intégral, occupant toute la hauteur à gauche.
*   **Organisation** : Divisée en groupes de navigation clairs (ex. *General*, *Tools*).
*   **Visuels** : Les liens de navigation sont accompagnés d'icônes filaires épurées (Outline) d'une grande finesse.
*   **Bas de page** : Un widget de profil utilisateur minimaliste et un bouton de déconnexion ("Log out") rouge contrasté y sont solidement ancrés.

### Système de Widgets Colorés
*   **Nombre** : 4 widgets principaux disposés en grille Bento dans la partie supérieure de la zone de contenu.
*   **Style visuel** :
    *   Fonds de couleurs unies alternées (Jaune, Rose, Vert, Violet).
    *   Bordures noires épaisses (2px) bien définies.
    *   Coins arrondis prononcés (environ 16px à 20px).
    *   Titres textuels en noir pur avec des graisses lourdes.
    *   Chaque widget présente une métrique claire à gauche et une icône ou un bouton circulaire d'action à droite.

### Layout Principal de l'Interface
*   **En-tête de bienvenue** : Situé en haut à gauche, présentant un message d'accueil amical ("Good morning, Dr. ...") écrit en police géométrique grasse, suivi d'une phrase d'état.
*   **Zone de recherche et filtres** :
    *   Une barre de recherche globale flanquée d'une icône de loupe.
    *   Des puces de filtres horizontales (Category chips) permettant de basculer rapidement entre différents types de contenus.
*   **Grille de contenu (Bento)** : La partie supérieure accueille les widgets colorés.
*   **Liste de données principale** : Située sur la partie gauche/centrale, sous forme de tableau épuré (ex. liste de patients). Les lignes sont aérées, intégrant des avatars circulaires, des données claires, des badges de statut arrondis et des boutons d'action d'ouverture de dossier.
*   **Panneau latéral droit (Sidebar d'Agenda)** : Un bloc vertical dédié sur le côté droit, comprenant :
    *   Un widget de calendrier minimaliste et épuré.
    *   Une timeline chronologique ("Schedule") détaillant les activités prévues de la journée avec des puces temporelles et des blocs d'événements colorés.

---

## 3. Analyse 1C — Carte des Features Manquantes & Proposition d'Adaptation pour UPLIFT 2.0

Le tableau suivant dresse une comparaison entre l'espace d'administration actuel d'UPLIFT 2.0 (style "Élan Violet") et le design de référence "Intelly", et propose des pistes d'adaptation réalistes pour enrichir l'expérience utilisateur de la plateforme.

| Composant / Feature | État actuel dans UPLIFT 2.0 | Présent dans le Design Intelly | Intérêt et proposition d'adaptation pour UPLIFT 2.0 |
| :--- | :--- | :--- | :--- |
| **Couleur de fond globale** | Gris très clair (`#F8FAFC`). | Crème chaud (`#F5F0E8`). | **Adaptation recommandée** : Adopter le ton Crème pour l'arrière-plan de l'espace admin afin d'adoucir l'interface et de faire ressortir les widgets bento avec plus de contraste. |
| **Style des widgets et cartes** | Cartes minimalistes blanches (`#FFFFFF`) avec ombres légères et sans bordures visibles. | Cartes de couleurs unies (jaune, rose, vert, violet) avec bordures noires de 2px. | **Adaptation esthétique** : Remplacer les cartes blanches par des widgets aux couleurs pastel de la palette Intelly, encadrés de bordures noires de 2px pour affirmer un style néo-brutaliste professionnel et punchy. |
| **Calendrier et Timeline intégrés** | Aucun calendrier ou timeline chronologique sur la page d'accueil administrateur (page `/admin/sessions` séparée). | Panneau latéral droit avec calendrier mensuel interactif et timeline quotidienne. | **Opportunité d'intégration** : Ajouter un panneau latéral à droite sur le tableau de bord d'accueil (`/admin`), regroupant un calendrier compact et une timeline des sessions de l'événement vedette de la journée. |
| **Recherche globale unifiée** | Barres de recherche locales sur chaque sous-page de gestion (ex. recherche d'un inscrit ou d'un intervenant séparément). | Barre de recherche globale au sommet du tableau de bord. | **Opportunité d'intégration** : Créer un champ de recherche unifié dans l'en-tête de la page d'accueil pour effectuer une recherche transverse instantanée (inscrits, intervenants, billets). |
| **Boutons de filtres par catégorie** | Filtres sous forme de sélecteurs classiques (select dropdowns) ou boutons d'options. | Puces de filtres horizontales (Chips) fluides et interactives. | **Adaptation UX** : Implémenter des filtres horizontaux sous forme de puces (chips) néo-brutalistes (contour noir 2px) pour basculer facilement entre les statuts de réservations ou catégories d'événements. |
| **Sidebar Admin** | Fond gris sombre/surface avec logo Ayibuzz Media coloré et profil en bas de page. | Fond noir pur contrasté, séparation claire des modules (*General/Tools*). | **Adaptation recommandée** : Passer le fond de la sidebar admin au noir pur, restructurer les éléments avec des icônes filaires blanches et classer la navigation sous les sections *Gestion* et *Outils*. |
