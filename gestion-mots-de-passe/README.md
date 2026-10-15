# gestion-mots-de-passe : mots de passe oubliés (admin)

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## Ta mission

Remplacer le stockage temporaire (`localStorage`) par la table **`demande_mot_de_passe`**, et faire en sorte que l'envoi d'un mot de passe temporaire **change vraiment** le mot de passe du participant. Tu écris `gestion-mots-de-passe/php/api.php`. Session admin de test : `/php/dev/connecter-test.php?admin=770000000`.

## Comment ça se passe pour l'utilisateur

1. Un participant oublie son mot de passe → page `mot-de-passe-oublie` : WhatsApp s'ouvre vers l'admin, et une demande est enregistrée (autre dev).
2. L'admin ouvre **cette page** : il voit la demande, un **mot de passe temporaire aléatoire** est proposé (modifiable).
3. Il clique **« Envoyer sur WhatsApp »** : le navigateur ouvre WhatsApp vers l'utilisateur avec le message prêt (déjà fait). **En même temps**, ton PHP enregistre le nouveau mot de passe.
4. L'utilisateur se connecte avec le mot de passe temporaire et est invité à le changer dans son profil.

## Déjà fait

`index.html`, `css/`, `js/gestion-mots-de-passe.js` : liste des demandes, génération du mot de passe, bouton WhatsApp, compteurs, ajout manuel par numéro (quelqu'un qui appelle l'admin au téléphone).

## Mode démo actuel (important)

Les demandes sont gardées **dans le navigateur** (`localStorage`) et aucun mot de passe n'est réellement changé.
**Remplacer cela par du vrai (PHP + base) est ton travail** : les étapes ci-dessous t'expliquent comment, dans l'ordre.

## Étapes

1. Environnement prêt (`donnees-de-test.sql` contient une demande pour `773000001`).
2. Crée `gestion-mots-de-passe/php/api.php`, **protégé** par `exigerAdmin();`. Actions JSON :
   | Action | Ce que ça fait |
   |---|---|
   | `lister` (GET) | Demandes + nom/prénom du participant (`JOIN participant`), triées : en attente d'abord |
   | `ajouter` (POST `telephone`) | Crée une demande si le numéro existe |
   | `reinitialiser` (POST `telephone`, `mot_de_passe`) | `UPDATE participant SET mot_de_passe = :hash, mot_de_passe_temporaire = 1`, puis `UPDATE demande_mot_de_passe SET traitee = 1` |
   | `supprimer` (POST `id`) | Supprime la demande |
3. Dans le JS : remplace `chargerDemandes` / `sauvegarder` par des `fetch`. Dans `envoyerWhatsApp`, **appelle d'abord** `reinitialiser` (attends la réponse OK), **puis** ouvre WhatsApp. Si le serveur refuse, n'ouvre rien et affiche l'erreur.
   Astuce : les navigateurs bloquent `window.open` après un `await`. Ouvre la fenêtre tout de suite (`const fenetre = window.open('', '_blank')`), puis une fois la réponse reçue : `fenetre.location = lien`, ou `fenetre.close()` en cas d'erreur.
4. Le mot de passe temporaire : 8 caractères minimum, **haché** (`password_hash`) en base ; en clair seulement dans le message WhatsApp.
5. Après réinitialisation, l'utilisateur doit être forcé à le changer : la colonne `mot_de_passe_temporaire = 1` est lue par la page connexion (autre dev) ; rien d'autre à faire ici.

## Pièges

- Vérifie que le numéro existe avant de réinitialiser (sinon `UPDATE` ne fait rien sans erreur).
- Ne jamais logger ni renvoyer en JSON le mot de passe temporaire après l'envoi.
- `exigerAdmin()` sur toutes les actions + CSRF.

## Mots à rechercher

`mysql JOIN exemple`, `javascript fetch async await`, `javascript window.open popup bloqué après await`, `php password_hash`.

## C'est terminé quand…

- [ ] La demande de `773000001` s'affiche avec son nom.
- [ ] « Envoyer sur WhatsApp » change le hash en base, met `mot_de_passe_temporaire = 1` et `traitee = 1`.
- [ ] Après cela, `773000001` peut se connecter avec le mot de passe temporaire (teste avec la page connexion si elle existe, sinon avec `password_verify` dans un petit script).
- [ ] Sans session admin : refus.
- [ ] Tu n'as modifié que `gestion-mots-de-passe/`.
