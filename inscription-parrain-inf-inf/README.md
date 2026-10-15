# inscription-parrain-inf-inf : inscription des parrains et marraines, option Informatique

> Avant de commencer : lis `docs/php-pour-debutants.md`, installe XAMPP avec `docs/xampp.md` et respecte `docs/contrat-commun.md`.
> Le code complet à adapter se trouve dans **`docs/guide-inscription.md`** : ce README t'explique quoi faire, dans quel ordre.

## Ta mission en une phrase

Écrire **un seul fichier PHP** (`inscription-parrain-inf-inf/php/inscription.php`) qui reçoit le formulaire de cette page et enregistre la personne dans la base, **uniquement comme parrain de l'option INF**.

## Ce qui est déjà fait (ne pas refaire)

- `accueil/index.html` : page d'accueil de **cette** classe (badge « Parrain / Marraine · Option Informatique » pour éviter de se tromper de formulaire).
- `inscription/index.html` : le formulaire (nom, prénom, téléphone, mot de passe, confirmation, photo, choix Parrain / Marraine). Il envoie en POST vers `../php/inscription.php`.
- `js/` : vérifications dans le navigateur, aperçu de la photo, transmission du code d'accès.

## Ce que tu dois faire

1. **Prépare ton environnement** (`docs/xampp.md`) : XAMPP démarré, base `site_de_parrainage` importée, `php/config/db.php` et `php/config/codes.php` créés, serveur lancé avec `php -S localhost:8000`.
2. **Crée le dossier** `inscription-parrain-inf-inf/php/` et le fichier `inscription.php` à partir du squelette de `docs/guide-inscription.md`.
3. **Règle les 3 constantes** en haut du fichier :
   - `OPTION = 'INF'`
   - `ROLES_AUTORISES = ['parrain', 'marraine']`
   - `CLE_CODE = 'parrain-INF'`
4. **Comprends chaque bloc** du squelette (code d'accès, validations, photo, insertion) : tu dois pouvoir l'expliquer. Lance-le morceau par morceau (`var_dump($_POST); exit;` est ton ami au début).
5. **Teste avec la checklist** du guide (bon code, mauvais code, doublon, triche sur le rôle, mauvaise photo).
6. Ouvre ta pull request vers `develop` (branche `inscription-parrain-inf-inf`), en décrivant ce que tu as testé.

## Règles importantes pour cette page

- Le rôle et l'option viennent **de ton PHP**, jamais du formulaire : même si quelqu'un modifie le HTML, il ne doit pas pouvoir s'inscrire ailleurs que dans parrain INF.
- Sans le bon **code d'accès** (`?code=...` dans le lien de la classe), l'inscription est refusée.
- Le mot de passe est enregistré **haché** (`password_hash`). Le téléphone est enregistré en **9 chiffres**.

## Mots à rechercher

`php $_POST`, `php $_FILES upload`, `php PDO prepare execute`, `php password_hash`, `php hash_equals`, `php header Location`, `php.ini upload_max_filesize`.

## C'est terminé quand…

- [ ] Une inscription correcte crée une ligne `participant` avec `role` ∈ ['parrain', 'marraine'] et `sous_departement = 'INF'`.
- [ ] Mauvais ou absent code d'accès : refus (403), rien en base.
- [ ] Modifier le formulaire dans le navigateur (F12) ne change ni le rôle ni l'option enregistrés.
- [ ] Numéro déjà inscrit, mot de passe trop court, mauvaise photo : message clair, aucune photo orpheline dans `uploads/`.
- [ ] Aucun secret commité (`php/config/db.php`, `php/config/codes.php`, `uploads/`).
- [ ] Tu n'as modifié que le dossier `inscription-parrain-inf-inf/`.

## Tu n'as pas à t'occuper de

La connexion, le profil, l'admin, le tirage. Après l'inscription tu rediriges simplement vers `../../connexion/?inscrit=1` ; cette page sera faite par quelqu'un d'autre.
