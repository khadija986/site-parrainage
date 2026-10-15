# espace : l'accueil de l'utilisateur connecté

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## À ne pas confondre

- `inscription-…/accueil/` : la page d'accueil **avant** l'inscription (une par classe).
- **`espace/` : l'accueil de l'utilisateur APRÈS son inscription ou sa connexion.** C'est son interface, comme une application mobile : avatar en haut à droite (menu *Mon profil* / *Se déconnecter*), puis **uniquement son propre parrainage**. Il ne voit jamais les résultats des autres : la liste complète est réservée à l'admin (`resultats/`).

## Ce que voit l'utilisateur

| Situation | Affichage |
|---|---|
| Tirage pas encore fait | Carte « Parrainage pas encore effectué » |
| Filleul, tirage fait | « Ton parrain » ou « Ta marraine » : photo, prénom, nom, option, bouton WhatsApp |
| Parrain / marraine, tirage fait | « Tes filleuls » (un ou plusieurs) avec le même détail, ou « Aucun filleul cette année » |

## Ta mission

Écrire `espace/php/api.php`, qui renvoie en JSON les informations de **l'utilisateur connecté et de lui seul**. Pour travailler sans la page de connexion : `http://localhost:8000/php/dev/connecter-test.php?participant=771000001`.

## Déjà fait

`index.html`, `css/espace.css`, `js/espace.js` (affichage des trois situations), et la barre du haut partagée (`shared/css/espace.css`, `shared/js/espace.js`, avatar + menu).

## Mode démo actuel (important)

Aujourd'hui la page affiche un **utilisateur fictif** : ajoute `?demo=avant`, `?demo=filleul` ou `?demo=parrain` à l'adresse pour voir les trois situations. **Brancher le vrai PHP est ton travail** :

1. Écris `espace/php/api.php` (étapes ci-dessous).
2. Dans `shared/js/config.js` : `ESPACE_ENDPOINT: "php/api.php"` et `DEMO.espace` à `false` (ta ligne uniquement).

## Format JSON à produire

```json
{
  "role": "filleul",
  "sous_departement": "INF",
  "prenom": "Awa", "nom": "Diop", "photo": "uploads/abc.jpg",
  "tirage_effectue": true,
  "parrain": { "prenom": "Mariama", "nom": "Sy", "photo": "uploads/def.jpg", "telephone": "771234567", "sous_departement": "INF", "role": "marraine" }
}
```

Pour un parrain / marraine : `"filleuls": [ { prenom, nom, photo, telephone, sous_departement, role }, … ]` à la place de `parrain` (tableau vide s'il n'a aucun filleul).
`tirage_effectue = false` : pas de `parrain` ni de `filleuls`.

## Étapes

1. `$telephone = exigerParticipant();` en première ligne (voir `docs/contrat-commun.md`).
2. Lis l'utilisateur : `SELECT prenom, nom, photo, role, sous_departement FROM participant WHERE telephone = :tel`.
3. **Tirage fait ?** Il l'est quand tous les filleuls de **son option** ont une ligne dans `association` (nombre de filleuls sans association = 0 et au moins un filleul). Utilise un `LEFT JOIN ... IS NULL` (voir `resultats/README.md`, étape 2).
4. Si l'utilisateur est un **filleul** : son parrain est
   ```sql
   SELECT p.prenom, p.nom, p.photo, p.telephone, p.sous_departement, p.role
   FROM association a JOIN participant p ON p.telephone = a.telephone_parrain
   WHERE a.telephone_filleul = :tel
   ```
5. Si c'est un **parrain / marraine** : ses filleuls sont
   ```sql
   SELECT f.prenom, f.nom, f.photo, f.telephone, f.sous_departement, f.role
   FROM association a JOIN participant f ON f.telephone = a.telephone_filleul
   WHERE a.telephone_parrain = :tel
   ```
6. `header('Content-Type: application/json; charset=utf-8'); echo json_encode(...)`. Sans session : `401` et `{"erreur": "..."}`.

## Pièges

- **Un utilisateur ne doit voir QUE son parrainage** : n'accepte aucun paramètre `?telephone=` ; utilise toujours le numéro de la **session**.
- Le téléphone du correspondant n'est renvoyé que pour le bouton WhatsApp : ne le renvoie jamais pour d'autres personnes.
- Les noms sont affichés par le JS avec `textContent` (sûr) ; garde cette règle si tu ajoutes du HTML.

## Mots à rechercher

`php json_encode`, `mysql JOIN exemple`, `php session`, `mysql LEFT JOIN IS NULL`.

## C'est terminé quand…

- [ ] Connecté en filleul de test avec une association en base : sa marraine / son parrain s'affiche avec sa photo.
- [ ] Connecté en parrain de test : ses filleuls s'affichent ; sans filleul : « Aucun filleul cette année ».
- [ ] Sans association pour tous les filleuls : « Parrainage pas encore effectué ».
- [ ] Sans session : `401`, aucune donnée.
- [ ] Impossible de voir le parrainage d'un autre en changeant l'URL.
- [ ] Tu n'as modifié que `espace/` (+ ta ligne dans `shared/js/config.js`).
