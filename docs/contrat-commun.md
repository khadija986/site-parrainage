# Contrat commun : travailler chacun dans son coin

Chaque personne a **une page** (un dossier). Tout le monde peut avancer en même temps, sans attendre ni casser les autres, à condition de respecter ces règles.

## Règles d'indépendance

1. **Tu ne modifies que ton dossier** (`index.html`, `css/`, `js/` — ou `accueil/` et `inscription/` pour les inscriptions — et un sous-dossier **`php/`** à créer dans ton dossier pour ton code serveur). Les actions des formulaires pointent déjà vers `../php/<fichier>.php` quand c'est le cas.
2. **Fichiers partagés en lecture seule** : `shared/*`, `php/config/*`, `php/includes/auth.php`, `database/*.sql`. **Exception** : dans `shared/js/config.js`, tu peux remplir **uniquement la ligne d'endpoint de ta page** (ex. `PROFIL_ENDPOINT`). Besoin d'un autre changement ? Ouvre une demande (issue / pull request séparée, petite et ciblée) et préviens le groupe. Ne modifie pas ces fichiers au passage dans la branche de ta page.
3. **Pas de `require` vers le dossier d'une autre page.** Ton PHP ne dépend que de `php/config/db.php` et `php/includes/auth.php`.
4. **Tu testes avec les données de test** (`database/donnees-de-test.sql`) et l'outil `php/dev/connecter-test.php` : tu n'as besoin ni de la page d'inscription, ni de la connexion, ni de l'admin pour travailler.
5. **Une branche par page**, créée depuis `develop` et nommée comme le dossier (ex. `profil`). Pull request vers `develop`. Une PR = une page.
6. Si tu as besoin d'une colonne ou d'une table en plus : demande-le (le schéma est **validé**), ne le change pas toi-même.

## Contrat de session (la seule chose partagée entre pages)

| Clé de session | Posée par | Lue par |
|---|---|---|
| `$_SESSION['participant_telephone']` | page `connexion` **et** les 4 inscriptions (après création du compte) | `espace`, `profil` |
| `$_SESSION['admin_telephone']` | page `admin-login` | `gestion-utilisateurs`, `gestion-mots-de-passe`, `tirage`, `resultats` |

Dans ton PHP, utilise seulement :

```php
require __DIR__ . '/../../php/includes/auth.php';
$telephone = exigerParticipant();   // redirige vers la connexion si pas connecté
$telephone = exigerAdmin();         // idem pour l'admin
```

Le téléphone est l'identifiant partout (clé de `participant`, `association`, `administrateur`).
**Format de stockage : 9 chiffres sans indicatif ni espace** (ex. `771234567`). Le JS et les liens WhatsApp ajoutent `221` quand il le faut. Toute page qui reçoit un numéro le normalise ainsi avant de chercher ou d'écrire en base.

## Contrat JSON (pages qui parlent à du JS)

- `profil` : `GET` → `{ nom, prenom, telephone, role, sous_departement, photo }` (brancher l'URL dans `shared/js/config.js` → `PROFIL_ENDPOINT`).
- `espace` : `GET` → `{ role, sous_departement, prenom, nom, photo, tirage_effectue, parrain: {…} | filleuls: [{…}] }` — **uniquement l'utilisateur de la session** (`ESPACE_ENDPOINT`). Détail dans `espace/README.md`.
- `resultats` (**page admin**, `exigerAdmin()`) : `GET` → `{ termine: bool, parrains: [{ nom, prenom, sous_departement, photo, filleuls: [{ nom, prenom, photo }] }] }` (`RESULTATS_ENDPOINT`). Jamais de mot de passe ; les téléphones sont permis ici car la page est réservée à l'admin.
- `mot-de-passe-oublie` : `POST telephone` → enregistre une demande (`DEMANDE_MDP_ENDPOINT`).
- Réponses d'erreur : code HTTP adapté (400, 401, 403, 404, 500) + `{ "erreur": "message lisible" }`. Ne jamais afficher une erreur SQL à l'utilisateur.

## Règles de sécurité valables pour toutes les pages

- Requêtes **préparées PDO** uniquement, jamais de variable collée dans le SQL.
- Mots de passe : `password_hash()` / `password_verify()`. Jamais en clair, jamais renvoyés au navigateur.
- Tout ce qui vient du navigateur est **revalidé côté serveur** (le JS n'est qu'un confort). Longueurs max : nom/prénom 50, téléphone 20, mot de passe 30.
- Affichage d'une donnée dans du HTML : `htmlspecialchars($valeur, ENT_QUOTES, 'UTF-8')`.
- Photos : voir `docs/guide-inscription.md` (type MIME réel, taille, nom aléatoire).
- Formulaires qui modifient des données : jeton CSRF (`random_bytes`, stocké en session, vérifié à l'envoi).
- Ne jamais commiter `php/config/db.php`, `php/config/codes.php` ni le dossier `uploads/`.

## Conventions

- Fichiers PHP : `declare(strict_types=1);`, noms en `snake_case` ou `kebab-case` comme les dossiers, une responsabilité par fichier.
- Messages à l'utilisateur en français, ton simple et tutoiement (comme les pages).
- Commits : `feat: …`, `fix: …`, `docs: …` (voir le README racine).
