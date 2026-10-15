# Site de parrainage 2026-2027

Tirage au sort en direct qui associe chaque filleul à un parrain du même département (INF ou TR), avec photos et suspense.
Cahier des charges complet : [docs/cahier-des-charges.pdf](docs/cahier-des-charges.pdf).

> État actuel : **partie 1 terminée (HTML / CSS / JS statiques)**. Aucune page n'est encore reliée à PHP ni à la base de données.

## Structure

Un dossier par page, chacun séparé en `html/`, `css/`, `js/`.

| Dossier | Page | Branche d'origine |
|---|---|---|
| `inscription-parrain-inf-inf/` | Inscription parrain INF_INF | `main` |
| `inscription-parrain-inf-tr/` | Inscription parrain INF_TR | `inscription_parrains_inf_tr` |
| `inscription-filleul-inf-inf/` | Inscription filleul INF_INF | `inscription_filleule_inf_inf` |
| `inscription-filleul-inf-tr/` | Accueil + inscription filleul INF_TR | `inscription_filleul_inf_tr` |
| `connexion/` | Connexion participant + mot de passe oublié | `Page_connexion` |
| `admin-login/` | Connexion administrateur | `espace_admin` |
| `gestion-utilisateurs/` | Admin : ajout / modif / suppression des participants | `espace_admin`, `gestion-des-utilisateurs` |
| `tirage/` | Admin : page du tirage en direct | `espace_admin` |
| `database/site_de_parrainage.sql` | Base de données validée | `inscription_parrains_inf_inf` |
| `docs/` | Cahier des charges | |
| `index.html` | Page d'accueil listant toutes les pages | |

Les liens entre pages sont relatifs (ex. `../../connexion/html/connexion.html`) : ouvrir `index.html` suffit pour naviguer.

## Base de données (validée)

Base `site_de_parrainage` — fichier `database/site_de_parrainage.sql` (à importer dans phpMyAdmin / MySQL).

- `participant(telephone UNIQUE, nom, prenom, sous_departement ENUM('INF','TR'), role ENUM('parrain','marraine','filleul'), mot_de_passe varchar(30), photo varchar(255))`
- `association(telephone_filleul PK, telephone_parrain)` — clés étrangères vers `participant.telephone`, `ON DELETE CASCADE`.

La clé primaire d'un filleul dans `association` garantit « un seul parrain par filleul » ; un parrain peut apparaître 0, 1 ou plusieurs fois.

## Partie 2 : brancher PHP et la base

### À faire, dans cet ordre

1. **Connexion PDO** : créer `php/config/db.php` (hôte, base, utilisateur, mot de passe lus depuis des variables d'environnement ou un fichier ignoré par git — ne jamais commiter de mot de passe).
2. **Inscriptions** : écrire les scripts de traitement et mettre à jour les `action` des formulaires.
   - `inscription-parrain-inf-inf` poste vers `traitement_parrains_inf_inf.php` (à créer).
   - `inscription-filleul-inf-tr` poste vers `inscription_filleul_inf_tr.php` (à créer).
   - `inscription-filleul-inf-inf`, `inscription-parrain-inf-tr` : `action` à définir (`#` / API via `config.js`).
   - Requêtes préparées PDO, validation côté serveur, photo enregistrée dans un dossier `uploads/` (vérifier type MIME et taille), chemin stocké dans `participant.photo`.
3. **Connexion** : `connexion/` (téléphone + mot de passe) et `admin-login/` (email + mot de passe), avec sessions PHP (`session_regenerate_id`).
4. **Espace admin** : protéger `gestion-utilisateurs/` et `tirage/` par session ; CRUD participants (la page contient déjà un JS de démonstration à remplacer par des appels PHP).
5. **Tirage** (`tirage/`) : le hasard est fait **côté serveur en PHP**, le JS ne fait qu'afficher l'animation.
   - Deux manches : INF puis TR. Pour chaque filleul sans association, choisir un parrain **du même `sous_departement`**.
   - Règle du cahier des charges : **« PAS DE IF »** pour le choix du parrain — tirer par requête SQL (`ORDER BY RAND() LIMIT 1` sur les parrains du département) ou `array_rand`, sans branchements pour choisir/corriger une association.
   - Enregistrer chaque association dans `association` ; endpoints JSON : filleul suivant, pause/reprise, reset (avec confirmation), vérification « tirage possible » (au moins 1 parrain si au moins 1 filleul dans le département).
6. **Page des résultats publique** (à créer, dossier `resultats/` avec `html/css/js`) : parrains + filleuls + photos, visible sans connexion et téléchargeable (PDF ou CSV) une fois le tirage terminé.

### Points à trancher / écarts constatés

- **Date du tirage** : le cahier des charges (§8) demande une date dans `association`, la table n'a pas de colonne de date → ajouter `date_tirage DATETIME DEFAULT CURRENT_TIMESTAMP`.
- **Mot de passe** : `mot_de_passe varchar(30)` est trop court pour un hash ; utiliser `password_hash()` et passer la colonne en `varchar(255)`. Le champ HTML est limité à 30 caractères, ce qui est bien pour la saisie.
- **Administrateur** : aucune table admin n'existe ; ajouter une table `admin` (email + hash) ou un compte configuré hors base.
- **Rôles** : l'ENUM contient `parrain`, `marraine`, `filleul` ; le cahier parle de parrain/filleul — traiter `marraine` comme un parrain dans les requêtes du tirage.
- **`inscription-parrain-inf-tr/js/config.js` est absent** : `inscription.html` le charge (`window.APP_CONFIG`) mais il n'a jamais été commité sur la branche d'origine, donc le formulaire ne fonctionne pas tant qu'il n'est pas recréé (endpoint, champs, messages, redirection).
- Les pages ont des champs différents (email étudiant sur filleul INF_INF, téléphone ailleurs) alors que la base identifie par `telephone` : harmoniser les formulaires.
- Pages `connexion` et `admin-login` : redirections après succès à brancher une fois PHP en place.

## Workflow Git

- `develop` : branche d'intégration (celle-ci).
- Les anciennes branches de page (`Page_connexion`, `espace_admin`, etc.) sont fusionnées dans `develop`; créer les nouvelles branches à partir de `develop` et ouvrir les pull requests vers `develop`.
