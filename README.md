# Site de parrainage 2026-2027

**Vocabulaire** : le département est *Génie informatique*, avec deux options : **INF** (option Informatique, pages `inf-inf`) et **TR** (option Télécommunications et Réseaux, pages `inf-tr`). Dans la base, `sous_departement` vaut `INF` ou `TR`.

Tirage au sort en direct qui associe chaque filleul à un parrain du même département (INF ou TR), avec photos et suspense.
Cahier des charges complet : [docs/cahier-des-charges.pdf](docs/cahier-des-charges.pdf).

> État actuel : **partie 1 terminée (HTML / CSS / JS statiques)**. Aucune page n'est encore reliée à PHP ni à la base de données.

## Structure

Un dossier par page, avec `index.html` (donc des URL propres : `/connexion/`, `/profil/`…), `css/` et `js/`. Les 4 inscriptions ont deux pages : `accueil/index.html` et `inscription/index.html`. Le style et les scripts communs sont dans `shared/`.

| Dossier | Page | Design |
|---|---|---|
| `inscription-filleul-inf-inf/`, `inscription-filleul-inf-tr/` | Accueil + inscription filleul (option INF / TR) | public |
| `inscription-parrain-inf-inf/`, `inscription-parrain-inf-tr/` | Accueil + inscription parrain ou marraine (option INF / TR) | public |
| `connexion/` | Connexion (téléphone + mot de passe) | public |
| `mot-de-passe-oublie/` | Ouvre WhatsApp vers l'admin avec un message pré-rempli | public |
| `espace/` | **Accueil de l'utilisateur connecté** : son parrain ou ses filleuls, avatar + menu Profil / Déconnexion | participant |
| `profil/` | Modifier nom, prénom, téléphone, photo, mot de passe | participant |
| `resultats/` | Tous les parrains et filleuls avec photos, CSV / impression PDF | **admin** |
| `admin-login/` | Connexion administrateur (téléphone) | admin |
| `gestion-utilisateurs/` | CRUD des participants | admin |
| `gestion-mots-de-passe/` | Demandes de mot de passe oublié : mot de passe temporaire + envoi WhatsApp en un clic | admin |
| `tirage/` | Page du tirage en direct | admin |
| `shared/` | `css/theme.css` + `css/formulaire.css` (design commun), `js/formulaire.js` (validation, photo, œil), `js/config.js` (réglages) | |
| `database/` · `docs/` | Base SQL · cahier des charges | |

Design : les pages publiques suivent le design marron/pêche (Lora + Poppins), **mobile-first** (la mise en page s'élargit à 600 px puis 1024 px). L'espace admin garde son design rose.
`index.html` redirige vers la connexion. Il n'y a volontairement **pas** de page qui liste les 4 inscriptions : chaque classe reçoit uniquement son lien.

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

## Partie 2 : PHP + base de données

Tout est expliqué pour des personnes qui n'ont jamais fait de PHP.

| Document | Contenu |
|---|---|
| [docs/roadmap.md](docs/roadmap.md) | Les 12 tâches, l'ordre, les règles d'architecture, la liste avant mise en ligne |
| [docs/php-pour-debutants.md](docs/php-pour-debutants.md) | Le PHP minimum, avec exemples |
| [docs/xampp.md](docs/xampp.md) | Installer XAMPP, importer la base, lancer le site |
| [docs/contrat-commun.md](docs/contrat-commun.md) | Règles pour travailler chacun dans son dossier, session, sécurité |
| [docs/guide-inscription.md](docs/guide-inscription.md) | Squelette complet des 4 inscriptions |
| `<dossier>/README.md` | Étapes précises et checklist de la page concernée |

Fichiers PHP communs déjà fournis : `php/config/db.example.php`, `php/config/codes.example.php`, `php/includes/auth.php`, `php/dev/connecter-test.php`, `database/donnees-de-test.sql`.

### Mode démo (état actuel)

Les formulaires « passent » sans PHP ni base : c'est volontaire pour naviguer dans tout le site. **Remplacer ce mode démo par du vrai PHP est le travail de chaque responsable de page** (voir `docs/roadmap.md` et le README de chaque dossier).

### Lancer le site

```bash
php -S localhost:8000      # depuis la racine du projet, puis ouvrir http://localhost:8000/
```

Ne pas ouvrir les fichiers en double-cliquant (`file://`) : voir `docs/xampp.md`.

### Points à noter

- `resultats/` est une **page admin** : liste complète des familles, export CSV / PDF. Un participant ne voit, dans `espace/`, que son propre parrainage (ou « Parrainage pas encore effectué » avant le tirage). Cela remplace la page de résultats publique du cahier des charges (§6), à la demande du client. En mode démo (endpoint vide) la page affiche des données fictives.
- Les pages d'accueil des inscriptions sont dans `accueil/index.html` (URL sans nom de fichier).
- L'espace admin garde ses couleurs roses, avec une barre latérale à icônes (`shared/css/admin.css`).

## Workflow Git

- `develop` : branche d'intégration (celle-ci).
- Les anciennes branches de page (`Page_connexion`, `espace_admin`, etc.) sont fusionnées dans `develop`; créer les nouvelles branches à partir de `develop` et ouvrir les pull requests vers `develop`.
