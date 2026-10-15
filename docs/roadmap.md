# Roadmap : partie 2 (PHP + base de données)

La partie 1 (HTML / CSS / JS, design, liens) est terminée sur la branche **`develop`**. Reste à brancher **PHP et MySQL**.
**12 tâches indépendantes** : chacune a son dossier et son propre `README.md` (pas besoin d'attendre les autres).

## Comment démarrer (tout le monde)

1. Lire **`docs/php-pour-debutants.md`** (20 min).
2. Installer XAMPP et la base en suivant **`docs/xampp.md`** (30 min), puis lancer le site : tu vois déjà toutes les pages.
3. Lire **`docs/contrat-commun.md`** (règles d'indépendance, session, sécurité).
4. Ouvrir le **README du dossier de ta page** et suivre les étapes dans l'ordre.
5. Pull request vers `develop` quand la case « C'est terminé quand… » est cochée.

## Les tâches

| # | Dossier | Quoi | Difficulté | Durée indicative | Responsable |
|---|---|---|---|---|---|
| 1 | `inscription-filleul-inf-inf` | Inscription filleuls option INF | ★★ | 1 à 2 h | _à affecter_ |
| 2 | `inscription-filleul-inf-tr` | Inscription filleuls option TR | ★★ | 1 à 2 h | _à affecter_ |
| 3 | `inscription-parrain-inf-inf` | Inscription parrains / marraines INF | ★★ | 1 à 2 h | _à affecter_ |
| 4 | `inscription-parrain-inf-tr` | Inscription parrains / marraines TR | ★★ | 1 à 2 h | _à affecter_ |
| 5 | `connexion` | Connexion des participants | ★★ | 1 à 2 h | _à affecter_ |
| 6 | `mot-de-passe-oublie` | Enregistrer les demandes | ★ | 1 h | _à affecter_ |
| 7 | `profil` | Modifier ses infos | ★★★ | 3 h | _à affecter_ |
| 8 | `resultats` | Résultats publics (JSON) | ★★ | 2 h | _à affecter_ |
| 9 | `admin-login` | Connexion admin | ★★ | 1 h | _à affecter_ |
| 10 | `gestion-utilisateurs` | CRUD des participants | ★★★ | 4 h | _à affecter_ |
| 11 | `gestion-mots-de-passe` | Réinitialisation + WhatsApp | ★★★ | 3 h | _à affecter_ |
| 12 | `tirage` | Tirage équilibré, pause, reset | ★★★★ | 6 h | _à affecter_ |

Les tâches ★★★★ (tirage) sont à confier à une personne à l'aise, ou à faire en binôme.

## Ordre conseillé si tu es seul·e ou en retard

`connexion` → `inscription-*` → `profil` → `admin-login` → `gestion-utilisateurs` → `tirage` → `resultats` → `gestion-mots-de-passe` + `mot-de-passe-oublie`.

## Règles d'architecture à retenir

- **4 formulaires d'inscription = 4 classes.** Chaque classe reçoit **son lien secret** (`.../accueil/?code=XXXX`). Un code ne marche que pour son formulaire ; le rôle et l'option sont imposés par le PHP du dossier (`docs/guide-inscription.md`). Personne ne peut accéder au formulaire d'une autre classe.
- **Chaque formulaire a sa propre page d'accueil** (badge « Filleul · Option … ») : elle évite les erreurs d'option ou de niveau (parrain / filleul).
- **Parrainage** : même option uniquement, un parrain par filleul, plusieurs filleuls possibles **mais équilibrés** ; l'admin décide à l'avance qui peut en avoir plusieurs (`accepte_plusieurs`). Voir `tirage/README.md`.
- **Mot de passe oublié** : contact WhatsApp de l'admin ; l'admin définit un mot de passe temporaire ; l'utilisateur le change dans son profil.
- **Un seul identifiant : le téléphone** (9 chiffres en base).

## URLs propres (jamais de nom de fichier dans l'adresse)

Chaque page est un **dossier qui contient `index.html`** : le serveur l'ouvre tout seul.

| Adresse | Fichier réel |
|---|---|
| `/connexion/` | `connexion/index.html` |
| `/profil/`, `/resultats/`, `/mot-de-passe-oublie/` | `<dossier>/index.html` |
| `/admin-login/`, `/gestion-utilisateurs/`, `/gestion-mots-de-passe/`, `/tirage/` | `<dossier>/index.html` |
| `/inscription-parrain-inf-tr/accueil/` | `inscription-parrain-inf-tr/accueil/index.html` |
| `/inscription-parrain-inf-tr/inscription/` | `inscription-parrain-inf-tr/inscription/index.html` |

- **Toujours** écrire les liens avec le `/` final (`href="../connexion/"`), et les ressources de la page en relatif (`css/…`, `js/…`).
- Quand une page aura besoin de PHP *avant* l'affichage (par exemple refuser un mauvais code d'accès sur l'accueil, ou protéger une page admin), **renomme son `index.html` en `index.php`** : l'adresse ne change pas. Mets alors `exigerAdmin();` / `exigerParticipant();` ou le contrôle du code (`hash_equals` avec `php/config/codes.php`) en première ligne du fichier.
- **Ne jamais ouvrir le site en double-cliquant sur un fichier** (`file://`) : le navigateur affiche alors la liste des fichiers du dossier. Passe toujours par le serveur : `php -S localhost:8000` (voir `docs/xampp.md`).

## Avant la mise en ligne (une personne, à la fin)

- [ ] Remplacer le numéro WhatsApp factice dans `shared/js/config.js`.
- [ ] Créer `php/config/db.php` et `php/config/codes.php` sur le serveur (jamais dans git), générer 4 codes aléatoires, envoyer à chaque classe **son** lien.
- [ ] Supprimer `php/dev/` et `database/donnees-de-test.sql`, retirer le compte admin de test.
- [ ] Créer le vrai compte admin (`admin-login/README.md`).
- [ ] Activer HTTPS, dossier `uploads/` non exécutable, `display_errors = Off`.
- [ ] Parcours complet : inscription → connexion → profil → tirage → résultats.

## Suivi

Chaque personne coche sa ligne dans le tableau (colonne « Responsable ») quand elle prend une tâche, et ouvre sa pull request vers `develop`. En cas de blocage de plus de 30 minutes : poser la question dans le groupe, avec le message d'erreur complet et ce qui a déjà été essayé.
