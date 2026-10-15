# profil : le participant modifie ses informations

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## Ta mission

Une personne connectée peut changer son nom, prénom, téléphone, photo et mot de passe. Tu écris `profil/php/profil.php` (affichage **et** enregistrement). Tu es indépendant de la page connexion : utilise `exigerParticipant()` et l'outil `php/dev/connecter-test.php?participant=771000001`.

## Déjà fait

La **barre du haut** (photo de profil en haut à droite, barre de navigation du bas Accueil / Profil / Déconnexion, partagée avec `espace/`) et le lien « Accueil » vers `/espace/`.

`index.html` (formulaire, œil sur les mots de passe, aperçu photo), `js/profil.js` (vérifications, remplissage du formulaire depuis `CONFIG.PROFIL_ENDPOINT`, message « mot de passe temporaire » si l'URL contient `?mdp_temporaire=1`).
Le formulaire envoie déjà en POST vers `php/profil.php` (ton dossier).

## Mode démo actuel (important)

Aujourd'hui ce formulaire **passe sans PHP ni base de données** : après les vérifications du navigateur, il mène directement à un message « Modifications enregistrées (mode démo) » : rien n'est sauvegardé. C'est voulu, pour pouvoir naviguer dans tout le site avant la partie 2.
**Remplacer ce comportement par du vrai est ton travail.** Quand ton PHP fonctionne :

1. Dans `shared/js/config.js`, passe **ta** ligne `DEMO.profil` à `false` (c'est la seule ligne à toucher) : le formulaire envoie alors vraiment les données à ton script PHP.
2. Quand tout est testé, supprime la ligne `brancherDemo(...)` à la fin de `js/profil.js` : le mode démo n'a plus de raison d'exister pour ta page.

## Étapes

1. Environnement prêt. Ouvre `http://localhost:8000/php/dev/connecter-test.php?participant=771000001`.
2. **GET** `profil.php?action=lire` → JSON `{nom, prenom, telephone, role, sous_departement, photo}` du participant connecté (jamais de mot de passe). Dans `shared/js/config.js`, `PROFIL_ENDPOINT` doit valoir `"php/profil.php?action=lire"` (une seule ligne, voir l'exception dans `docs/contrat-commun.md`). Résultat : le formulaire se remplit tout seul.
3. **POST** `profil.php` pour enregistrer :
   1. `exigerParticipant()` ;
   2. vérifier le **mot de passe actuel** (`password_verify`) : sinon refus ;
   3. revalider nom, prénom, téléphone (mêmes règles que l'inscription : voir `docs/guide-inscription.md`) ;
   4. si un **nouveau mot de passe** est donné : 8 à 30 caractères, confirmation identique, `password_hash`, et mettre `mot_de_passe_temporaire = 0` ;
   5. si une **nouvelle photo** est envoyée : mêmes contrôles que l'inscription (`getimagesize`, taille, nom aléatoire), puis supprimer l'ancienne photo ;
   6. `UPDATE participant SET ... WHERE telephone = :ancien` (requête préparée).
4. **Changement de téléphone** : c'est la clé de la personne. La base a `ON UPDATE CASCADE`, les liens avec `association` suivent. Vérifie que le nouveau numéro n'existe pas déjà, et mets à jour `$_SESSION['participant_telephone']`.
5. **Ce qui ne se modifie pas** : le rôle et l'option (ça fausserait le tirage). Ne lis jamais `role`/`sous_departement` dans `$_POST`.
6. Si le tirage est **déjà fait** (il existe des lignes dans `association`), pense à ce que le changement de photo/nom reste possible : ce sont de simples colonnes.

## Pièges

- Ne renvoie **jamais** le champ `mot_de_passe` dans le JSON.
- Ajoute un **jeton CSRF** : génère-le en session, mets-le dans un champ caché, compare avec `hash_equals` (`docs/contrat-commun.md`).
- Le bouton « Se déconnecter » est un lien vers la connexion : la vraie déconnexion (`session_destroy`) est dans la page connexion ; demande à son auteur le chemin de `deconnexion.php`.

## Mots à rechercher

`php UPDATE PDO prepared`, `php $_SESSION`, `php csrf token`, `php unlink supprimer fichier`, `mysql ON UPDATE CASCADE`.

## C'est terminé quand…

- [ ] Connecté en `771000001`, le formulaire se remplit avec les bonnes valeurs.
- [ ] Changer le nom avec le bon mot de passe actuel fonctionne ; avec un mauvais, refus.
- [ ] Changer de mot de passe : on peut se reconnecter avec le nouveau, plus avec l'ancien.
- [ ] Changer de photo remplace le fichier dans `uploads/` (ancien supprimé).
- [ ] Impossible de changer son rôle ou son option, même en trafiquant le formulaire.
- [ ] Accès sans session : redirection vers la connexion.
- [ ] Tu n'as modifié que `profil/`.
