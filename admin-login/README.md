# admin-login : connexion de l'administrateur

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## Ta mission

Écrire `admin-login/php/connexion.php` : vérifier téléphone + mot de passe de l'admin (table `administrateur`) et poser **`$_SESSION['admin_telephone']`**. Tu es la seule personne à écrire cette clé. C'est une page **indépendante** de la connexion des participants (autre table, autre clé de session).

## Déjà fait

`index.html` (téléphone + mot de passe, rose admin) qui envoie en POST vers `php/connexion.php` (ton dossier).

## Mode démo actuel (important)

Aujourd'hui ce formulaire **passe sans PHP ni base de données** : après les vérifications du navigateur, il mène directement à le tableau de bord (`../gestion-utilisateurs/`), sans vérifier aucun mot de passe. C'est voulu, pour pouvoir naviguer dans tout le site avant la partie 2.
**Remplacer ce comportement par du vrai est ton travail.** Quand ton PHP fonctionne :

1. Dans `shared/js/config.js`, passe **ta** ligne `DEMO.adminLogin` à `false` (c'est la seule ligne à toucher) : le formulaire envoie alors vraiment les données à ton script PHP.
2. Quand tout est testé, supprime la ligne `brancherDemo(...)` à la fin de `js/login.js` : le mode démo n'a plus de raison d'exister pour ta page.

## Étapes

1. Environnement prêt. Admin de test : `770000000` / `admin1234` (dans `donnees-de-test.sql`).
2. Écris `admin-login/php/connexion.php` en suivant le modèle de `connexion/README.md` (même logique), avec ces différences :
   - tu lis la table **`administrateur`** (colonnes `telephone`, `mot_de_passe`) ;
   - tu poses `$_SESSION['admin_telephone']` (jamais `participant_telephone`) ;
   - succès → redirection vers `../../gestion-utilisateurs/`.
3. Crée `admin-login/php/deconnexion.php` (détruit la session) et demande aux auteurs des pages admin de pointer le bouton « Déconnexion » de la barre latérale dessus.
4. **Créer le vrai compte admin** (le jour J) : génère le hash puis insère-le.
   ```bash
   php -r "echo password_hash('MotDePasseLongEtUnique', PASSWORD_DEFAULT), PHP_EOL;"
   ```
   ```sql
   INSERT INTO administrateur (telephone, mot_de_passe) VALUES ('77XXXXXXX', '<le hash>');
   ```
   Supprime ensuite le compte de test `770000000`.
5. Protège contre les essais répétés (5 essais puis pause de quelques minutes).
6. Bonus : fais en sorte que les pages admin refusent l'accès sans session : c'est `exigerAdmin()` dans `php/includes/auth.php` (déjà écrit), utilisé par les autres pages ; vérifie qu'il redirige bien vers ta page.

## Pièges

- Même message d'erreur pour « numéro inconnu » et « mauvais mot de passe ».
- `session_regenerate_id(true)` après connexion.
- Ne mets jamais le mot de passe admin dans le code ni dans git.

## Mots à rechercher

`php session login tutoriel`, `php password_hash password_verify`, `php brute force`, `php session_destroy logout`.

## C'est terminé quand…

- [ ] `770000000` / `admin1234` ouvre le tableau de bord ; un participant (`771000001`) ne passe **pas**.
- [ ] Ouvrir directement `gestion-utilisateurs/` sans être connecté admin ne donne accès à aucune donnée (les données viennent du PHP protégé par `exigerAdmin()`).
- [ ] La déconnexion détruit la session.
- [ ] Tu n'as modifié que `admin-login/`.
