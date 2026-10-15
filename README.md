# Site de parrainage 2026-2027

**Vocabulaire** : le département est *Génie informatique*, avec deux options : **INF** (option Informatique, pages `inf-inf`) et **TR** (option Télécommunications et Réseaux, pages `inf-tr`). Dans la base, `sous_departement` vaut `INF` ou `TR`.

Tirage au sort en direct qui associe chaque filleul à un parrain du même département (INF ou TR), avec photos et suspense.
Cahier des charges complet : [docs/cahier-des-charges.pdf](docs/cahier-des-charges.pdf).

> État actuel : **partie 1 terminée (HTML / CSS / JS statiques)**. Aucune page n'est encore reliée à PHP ni à la base de données.

## Structure

Un dossier par page, chacun séparé en `html/`, `css/`, `js/`. Le style et les scripts communs sont dans `shared/`.

| Dossier | Page | Design |
|---|---|---|
| `accueil/` | Choix du profil (filleul / parrain × option INF / TR), accès connexion et résultats | public |
| `inscription-filleul-inf-inf/`, `inscription-filleul-inf-tr/` | Accueil + inscription filleul (option INF / TR) | public |
| `inscription-parrain-inf-inf/`, `inscription-parrain-inf-tr/` | Accueil + inscription parrain ou marraine (option INF / TR) | public |
| `connexion/` | Connexion (téléphone + mot de passe) | public |
| `mot-de-passe-oublie/` | Ouvre WhatsApp vers l'admin avec un message pré-rempli | public |
| `profil/` | Modifier nom, prénom, téléphone, photo, mot de passe | public |
| `resultats/` | Parrains et filleuls avec photos, téléchargement CSV / impression PDF | public |
| `admin-login/` | Connexion administrateur (téléphone) | admin |
| `gestion-utilisateurs/` | CRUD des participants | admin |
| `gestion-mots-de-passe/` | Demandes de mot de passe oublié : mot de passe temporaire + envoi WhatsApp en un clic | admin |
| `tirage/` | Page du tirage en direct | admin |
| `shared/` | `css/theme.css` + `css/formulaire.css` (design commun), `js/formulaire.js` (validation, photo, œil), `js/config.js` (réglages) | |
| `database/` · `docs/` | Base SQL · cahier des charges | |

Design : les pages publiques suivent le design marron/pêche (Lora + Poppins), **mobile-first** (la mise en page s'élargit à 600 px puis 1024 px). L'espace admin garde son design rose.
Liens relatifs entre pages : `index.html` redirige vers `accueil/`.

### À régler avant la mise en ligne

- `shared/js/config.js` : `NUMERO_ADMIN_WHATSAPP` (par défaut un numéro factice) et les endpoints PHP (vides = mode démo).

## Base de données

Base `site_de_parrainage` — fichier `database/site_de_parrainage.sql` (à importer dans phpMyAdmin / MySQL). **Tout le monde s'identifie par son numéro de téléphone** (pas d'e-mail).

- `participant(telephone UNIQUE, nom, prenom, sous_departement ENUM('INF','TR'), role ENUM('parrain','marraine','filleul'), mot_de_passe varchar(255), photo varchar(255))`
- `association(telephone_filleul PK, telephone_parrain, date_tirage TIMESTAMP DEFAULT CURRENT_TIMESTAMP)` — clés étrangères vers `participant.telephone`, `ON DELETE CASCADE`.
- `participant.mot_de_passe_temporaire` : mis à 1 quand l'admin réinitialise un mot de passe ; à remettre à 0 quand l'utilisateur en choisit un nouveau.
- `demande_mot_de_passe(id, telephone → participant, date_demande, traitee)` — demandes affichées dans `gestion-mots-de-passe/`.
- `administrateur(telephone PK, mot_de_passe varchar(255))` — l'admin se connecte avec son téléphone ; le premier compte est à insérer à la main avec un hash `password_hash()`.

La clé primaire d'un filleul dans `association` garantit « un seul parrain par filleul » ; un parrain peut apparaître 0, 1 ou plusieurs fois.
Les mots de passe doivent être enregistrés avec `password_hash()` (colonnes en 255 caractères pour cela).

## Partie 2 : brancher PHP et la base

Les pages publient vers des scripts PHP à créer dans `php/` (les `action` sont déjà posés) :

| Script | Appelé par | À faire |
|---|---|---|
| `php/config/db.php` | tous | Connexion PDO ; identifiants lus depuis l'environnement / un fichier ignoré par git |
| `php/inscription.php` | les 4 inscriptions | Champs : `role` (`parrain`/`marraine`/`filleul`), `sous_departement` (`INF`/`TR`), `nom`, `prenom`, `telephone`, `mot_de_passe`, `confirmation`, `photo`. Revalider côté serveur, `password_hash`, photo dans `uploads/` (type MIME + taille) |
| `php/connexion.php` | `connexion/` | Vérifier `password_verify`, session (`session_regenerate_id`), rediriger vers `profil/` (avec `?mdp_temporaire=1` si `mot_de_passe_temporaire = 1`) |
| `php/profil.php` | `profil/` | GET : JSON `{nom, prenom, telephone, role, sous_departement, photo}` (à brancher sur `PROFIL_ENDPOINT`) ; POST : exiger `mot_de_passe_actuel`, mettre à jour, remettre `mot_de_passe_temporaire` à 0 |
| `php/demande_mot_de_passe.php` | `mot-de-passe-oublie/` | POST `telephone` → insérer dans `demande_mot_de_passe` (à brancher sur `DEMANDE_MDP_ENDPOINT`) |
| `php/resultats.php` | `resultats/` | JSON `{termine, parrains:[{nom, prenom, sous_departement, photo, filleuls:[{nom, prenom, photo}]}]}` (ne pas exposer les téléphones) |

Pages admin à relier à PHP :

1. `admin-login/` : connexion par téléphone (table `administrateur`, session admin). Toutes les pages admin doivent refuser l'accès sans session admin.
2. `gestion-utilisateurs/` : remplacer le `localStorage` par un CRUD PHP.
3. `gestion-mots-de-passe/` : remplacer le `localStorage` par la table `demande_mot_de_passe`. L'envoi WhatsApp est déjà fait côté navigateur (`wa.me`) ; il reste à enregistrer `password_hash` du mot de passe temporaire, mettre `mot_de_passe_temporaire = 1` et marquer la demande `traitee`.
4. `tirage/` : voir ci-dessous.

### Le tirage (cahier des charges §4-5)

- Le hasard est fait **côté serveur en PHP** ; le JS ne fait qu'afficher l'animation.
- Deux manches : INF puis TR. Pour chaque filleul sans association, choisir un parrain **du même `sous_departement`** (les rôles `parrain` et `marraine` sont des parrains).
- Règle **« PAS DE IF »** pour le choix : tirer par requête SQL (`ORDER BY RAND() LIMIT 1` sur les parrains de l'option) ou `array_rand`, sans branchements pour choisir ou corriger une association.
- Enregistrer chaque association dans `association` (`date_tirage` se remplit seule).
- Endpoints à prévoir : filleul suivant, pause / reprise, remise à zéro avec confirmation, vérification « tirage possible » (au moins un parrain dans l'option si elle a des filleuls).
- `tirage/` ne contient aujourd'hui que le bouton « suivant » : pause, remise à zéro et vérification restent à ajouter.

### Points à noter

- `resultats/` n'affiche les résultats et ne permet le téléchargement que si `termine = true`. En mode démo (endpoint vide) il affiche des données fictives, signalées sur la page.
- `gestion-mots-de-passe/` génère un mot de passe aléatoire par demande (8 caractères) : ne jamais utiliser un mot de passe unique pour tout le monde.
- Les anciens formulaires (champ e-mail, `config.js` du parrain option TR) ont été remplacés par les nouvelles pages ; plus rien ne dépend de `config.js` par page.

## Workflow Git

- `develop` : branche d'intégration (celle-ci).
- Les anciennes branches de page (`Page_connexion`, `espace_admin`, etc.) sont fusionnées dans `develop`; créer les nouvelles branches à partir de `develop` et ouvrir les pull requests vers `develop`.
