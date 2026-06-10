# Questions de Cadrage du Tableau de Bord d'Administration — Agent 2 Brainstorm

Ce document regroupe les questions clés rédigées à l'intention de l'utilisateur pour valider la structure, les fonctionnalités et les comportements attendus sur le nouveau tableau de bord d'administration d'UPLIFT 2.0.

---

## 1. Hero / Événement Vedette (Featured Event)
* **Type de données à afficher** : Quelles sont les informations précises de l'événement vedette qui doivent être mises en avant dans cette section (ex. titre, date, lieu, statut d'inscription, jauge de remplissage, image de couverture) ?
* **Édition directe** : L'événement vedette doit-il être modifiable directement depuis cette bannière (via un bouton "Éditer" ou un raccourci rapide), ou s'agit-il d'un affichage purement informatif ?
* **Comportement de repli (Fallback)** : Si aucun événement n'est marqué comme vedette (`is_featured = true`) ou actif dans la base de données, quel comportement de repli préférez-vous ?
  1. Afficher automatiquement le prochain événement chronologique à venir.
  2. Afficher un état vide (placeholder) invitant l'administrateur à définir un événement vedette.
  3. Masquer complètement la section.

---

## 2. Widgets de Statistiques (Stats Widgets)
* **Choix des métriques** : Quelles sont les 4 métriques clés à afficher en priorité dans les widgets colorés de style Bento ? Par exemple :
  1. Nombre total d'inscriptions/réservations.
  2. Chiffre d'affaires / Revenus de billetterie.
  3. Nombre d'événements actifs/à venir.
  4. Nombre d'intervenants confirmés.
* **Sources de données** : Confirmez-vous que les sources de données pour ces métriques doivent être directement calculées à partir des tables Supabase existantes (`reservations`, `events`, `speakers`, `tickets`) ?
* **Présentation et mini-graphiques** : Souhaitez-vous intégrer de petits indicateurs visuels ou graphiques à l'intérieur de ces widgets (ex. mini-graphiques en barres, sparklines néo-brutalistes, ou pourcentage d'évolution), ou de simples chiffres volumineux avec des icônes/boutons d'action circulaires (comme sur la référence) suffisent-ils ?

---

## 3. Calendrier Latéral & Timeline (Sidebar Calendar / Timeline)
* **Bibliothèque de composants** : Avez-vous une préférence ou une contrainte sur la bibliothèque à utiliser pour le calendrier mensuel interactif du panneau latéral droit (ex. `react-calendar`, le composant Calendar de `shadcn-ui`, ou un calendrier natif personnalisé) ?
* **Niveau de détail de la timeline** : Comment la timeline quotidienne ("Schedule") située sous le calendrier doit-elle se comporter ? Doit-elle lister uniquement les sessions de l'événement vedette pour le jour sélectionné, ou toutes les sessions de tous les événements de la journée ?
* **Interaction et panneau de détails** : Au clic sur une session dans la timeline, quelle action doit être déclenchée ?
  * L'ouverture d'un panneau latéral de détails (Drawer / Slide-over) affichant les détails de la session, la salle, et l'intervenant.
  * Une redirection vers la page de gestion des sessions (`/admin/sessions`).
  * Une simple infobulle / tooltip informative.

---

## 4. Recherche Globale & Filtres par Catégorie (Global Search & Category Filters)
* **Périmètre de la recherche globale** : La barre de recherche en haut du tableau de bord doit-elle effectuer une recherche fédérée (multi-tables) retournant des résultats pour les inscrits, les événements, les intervenants et les billets simultanément, ou doit-elle être configurable par l'utilisateur ?
* **Comportement des puces de filtres (Category Chips)** : Sur quels critères précis ces puces horizontales doivent-elles filtrer les données de la liste principale du tableau de bord (ex. filtrer les réservations par statut : "Tout", "En attente", "Approuvé", "Rejeté") ?
* **Action au clic sur une ligne** : Dans la liste principale sous la barre de recherche (ex. liste des réservations récentes), le clic sur une ligne doit-il ouvrir une vue détaillée de la réservation (ex. tiroir latéral ou modal de validation/paiement) ?

---

## 5. Barre Latérale Restructurée (Restructured Sidebar)
* **Sections et organisation** : La restructuration proposée de la Sidebar en deux blocs majeurs ("Gestion" et "Outils") vous convient-elle ?
  * **Gestion** : Tableau de bord, Événements, Réservations, Sessions, Intervenants, Billets.
  * **Outils** : Boîte d'envoi d'emails, Campagnes, Modèles d'emails, Scanner de billets.
* **Contrôle d'accès et rôles** : Existe-t-il des rôles d'utilisateurs restreints à gérer dans la sidebar (ex. masquer des onglets financiers ou des outils d'emailing pour un utilisateur ayant uniquement le rôle de "Scanner/Validateur" ou "Modérateur") ?
* **Comportement réactif (Collapsibility)** : La sidebar doit-elle pouvoir être rétractée (repliée avec uniquement les icônes visibles) pour maximiser l'espace de travail sur les écrans intermédiaires, ou doit-elle rester statique et visible en permanence ?
