# connexion : connexion des participants

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## Ta mission

Écrire `connexion/php/connexion.php` : vérifier téléphone + mot de passe, ouvrir une **session**, et envoyer la personne vers son profil. Tu es la seule personne à écrire `$_SESSION['participant_telephone']`.

## Déjà fait

`html/connexion.html` (formulaire téléphone + mot de passe, bouton œil, lien « Mot de passe oublié ? »), `js/connexion.js` (vérifications dans le navigateur). Le formulaire envoie déjà en POST vers `../php/connexion.php` (ton dossier).

## Étapes

1. Environnement prêt (XAMPP, base + `donnees-de-test.sql`, `db.php`). Compte pour tester : `771000001` / `test1234`.
2. Crée `connexion/php/connexion.php`. Squelette :

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../../php/config/db.php';
require __DIR__ . '/../../php/includes/auth.php';

const PAGE_FORMULAIRE = '../html/connexion.html';
const PAGE_PROFIL = '../../profil/html/profil.html';
const MESSAGE_ERREUR = 'Numéro ou mot de passe incorrect.';   // le même dans les 2 cas, volontairement

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: ' . PAGE_FORMULAIRE); exit; }

$telephone = preg_replace('/^(\+221|221)/', '', preg_replace('/[\s.-]/', '', (string) ($_POST['telephone'] ?? '')));
$motDePasse = (string) ($_POST['mot_de_passe'] ?? '');

$requete = pdo()->prepare('SELECT mot_de_passe, mot_de_passe_temporaire FROM participant WHERE telephone = :tel');
$requete->execute([':tel' => $telephone]);
$participant = $requete->fetch();

// Si le numéro n'existe pas on vérifie quand même un faux hash (même durée de réponse)
$hash = $participant['mot_de_passe'] ?? password_hash('faux', PASSWORD_DEFAULT);
if ($participant === false || !password_verify($motDePasse, $hash)) {
    header('Location: ' . PAGE_FORMULAIRE . '?erreur=' . rawurlencode(MESSAGE_ERREUR));
    exit;
}

demarrerSession();
session_regenerate_id(true);                      // protège contre le vol de session
$_SESSION['participant_telephone'] = $telephone;

$suite = $participant['mot_de_passe_temporaire'] ? '?mdp_temporaire=1' : '';
header('Location: ' . PAGE_PROFIL . $suite);
exit;
```

3. **Déconnexion** : crée `connexion/php/deconnexion.php` (`demarrerSession(); session_destroy();` puis redirection vers la connexion) et branche-le sur le bouton « Se déconnecter » de la page profil **par une demande** à la personne qui fait le profil (tu ne modifies pas son dossier).
4. Limite les essais : après 5 échecs pour un numéro, attendre quelques minutes (stocke un compteur en session ou en base, au choix : demande avant d'ajouter une colonne).
5. Affiche un petit message vert si l'URL contient `?inscrit=1` (« Compte créé, connecte-toi ») dans `js/connexion.js`.

## Pièges

- Message d'erreur **identique** que le numéro n'existe pas ou que le mot de passe soit faux : sinon on découvre qui est inscrit.
- N'oublie pas `session_regenerate_id(true)` après connexion réussie.
- `password_verify` compare avec le **hash** de la base, jamais avec un texte en clair.

## Mots à rechercher

`php session_start tutoriel`, `php password_verify`, `php session_regenerate_id`, `php brute force protection login`, `SQL injection prepared statements`.

## C'est terminé quand…

- [ ] `771000001` / `test1234` te connecte et te redirige vers le profil ; une mauvaise combinaison renvoie le message d'erreur.
- [ ] Après connexion, `$_SESSION['participant_telephone']` contient `771000001` (vérifie avec `/php/dev/connecter-test.php`).
- [ ] Un participant dont `mot_de_passe_temporaire = 1` arrive sur `profil.html?mdp_temporaire=1`.
- [ ] Aucune requête SQL construite par concaténation.
- [ ] Tu n'as modifié que le dossier `connexion/`.

## Tu n'as pas à t'occuper de

L'admin (`admin-login` est une page séparée avec sa propre session), du profil, des inscriptions.
