# gestion-utilisateurs : tableau de bord admin (CRUD des participants)

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## Ta mission

Remplacer le stockage temporaire du navigateur (`localStorage`) par la **vraie base** : lister, ajouter, modifier, supprimer des parrains/marraines et filleuls, avec leur photo, et gérer la case « peut recevoir plusieurs filleuls ». Tu écris `gestion-utilisateurs/php/api.php`. Pour travailler sans la page de connexion admin : `http://localhost:8000/php/dev/connecter-test.php?admin=770000000`.

## Déjà fait

`html/gestion-utilisateurs.html` + `css/` + `js/gestion-utilisateurs.js` : barre latérale, compteurs, recherche, 4 colonnes (parrains INF, filleuls INF, parrains TR, filleuls TR), fenêtre d'ajout / modification (nom, prénom, téléphone, photo, rôle, option, case « plusieurs filleuls »). Tout fonctionne en démo dans le navigateur.

## Étapes

1. Environnement prêt, session admin de test ouverte.
2. Crée `gestion-utilisateurs/php/api.php`, **protégé** dès la première ligne par `exigerAdmin();`. Il répond en JSON et gère ces actions (`?action=...`) :
   | Action | Méthode | Ce que ça fait |
   |---|---|---|
   | `lister` | GET | Tous les participants (sans `mot_de_passe`) |
   | `ajouter` | POST | Insère un participant (mot de passe provisoire aléatoire haché, voir 5) |
   | `modifier` | POST | Met à jour nom, prénom, téléphone, photo, rôle, option, `accepte_plusieurs` |
   | `supprimer` | POST | Supprime (les associations liées partent en cascade) |
3. Adapte `js/gestion-utilisateurs.js` : remplace les lectures/écritures `localStorage` par des `fetch('../php/api.php?action=...')`. Garde l'affichage tel quel. **L'ordre conseillé** : d'abord `lister` (affichage), puis `ajouter`, puis `modifier`, puis `supprimer`.
4. Rôles dans la base : `parrain`, `marraine`, `filleul` (en minuscules). Le JS actuel utilise `Parrain` / `Filleul` : à convertir proprement (une seule fonction de conversion). Un menu « Marraine » peut être ajouté dans le formulaire.
5. Mot de passe d'un utilisateur ajouté par l'admin : génère-en un aléatoire (`bin2hex(random_bytes(4))`), enregistre son hash, mets `mot_de_passe_temporaire = 1`, et montre-le **une seule fois** à l'admin pour qu'il le transmette.
6. Photo : mêmes contrôles que l'inscription (`docs/guide-inscription.md`, étape 4). Si pas de photo : `uploads/defaut.svg`.
7. **Refuse** de supprimer ou de changer le rôle/l'option d'un participant **après le tirage** s'il a déjà une association (renvoie une erreur claire) : sinon les résultats deviennent faux. Propose à la place « Réinitialiser le tirage » (page `tirage`).
8. Case « peut recevoir plusieurs filleuls » (colonne `accepte_plusieurs`) : uniquement utile pour parrains/marraines ; elle sert au tirage.

## Pièges

- `exigerAdmin()` sur **chaque** action, pas seulement `lister`.
- Ajoute un jeton CSRF pour les actions qui modifient (`docs/contrat-commun.md`).
- Nettoie le téléphone (9 chiffres) et vérifie qu'il n'existe pas déjà (erreur MySQL 1062).
- Les noms affichés par le JS passent par `textContent` : garde cette habitude (jamais `innerHTML` avec une donnée utilisateur).

## Mots à rechercher

`php CRUD PDO exemple`, `javascript fetch POST FormData`, `php json_encode`, `php $_FILES upload`, `mysql DELETE CASCADE`.

## C'est terminé quand…

- [ ] Le tableau se remplit avec les participants de `donnees-de-test.sql`.
- [ ] Ajouter, modifier, supprimer fonctionnent et se voient dans phpMyAdmin, après rechargement de la page.
- [ ] Sans session admin, `api.php` renvoie 401/403 et aucune donnée.
- [ ] Impossible de modifier/supprimer quelqu'un déjà associé sans message d'avertissement.
- [ ] Aucun mot de passe (même haché) renvoyé au navigateur.
- [ ] Tu n'as modifié que `gestion-utilisateurs/`.

## Barre latérale

Elle est écrite en HTML dans chaque page admin. Si vous voulez la mutualiser plus tard, créez `php/includes/admin-sidebar.php` : demandez d'abord au groupe (fichier partagé).
