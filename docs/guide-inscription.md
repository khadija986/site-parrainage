# Guide : écrire le PHP d'une page d'inscription

Valable pour les **4 inscriptions** (filleul INF, filleul TR, parrain INF, parrain TR). Chaque page a son propre fichier PHP, **avec les mêmes étapes** ; seules 3 constantes changent. Lis d'abord `docs/php-pour-debutants.md`.

## Pourquoi 4 pages séparées, et pourquoi c'est sérieux

Les 4 formulaires sont envoyés à **4 classes différentes**. Une personne ne doit pas pouvoir s'inscrire dans la classe d'une autre (ex. un filleul INF qui s'inscrirait comme parrain TR). Donc :

1. **Le rôle et l'option sont fixés dans le PHP de ton dossier**, jamais lus dans le formulaire. Le navigateur peut être trafiqué ; ton PHP, non.
2. **Chaque classe reçoit un lien avec un code secret** : `.../inscription-parrain-inf-tr/accueil/?code=XXXX` (le dossier `accueil/` contient `index.html`, donc le nom du fichier n'apparaît jamais dans l'URL). Le code est relayé par le JS jusqu'au champ caché `code`, et **ton PHP le compare** au code de ta classe (`php/config/codes.php`). Sans le bon code : refus.
3. L'admin génère les 4 codes (voir `php/config/codes.example.php`) et envoie à chaque classe **uniquement son lien**.

## Les 3 constantes à adapter en haut de ton fichier

| Ton dossier | `OPTION` | `ROLES_AUTORISES` | `CLE_CODE` |
|---|---|---|---|
| `inscription-filleul-inf-inf` | `INF` | `['filleul']` | `filleul-INF` |
| `inscription-filleul-inf-tr` | `TR` | `['filleul']` | `filleul-TR` |
| `inscription-parrain-inf-inf` | `INF` | `['parrain', 'marraine']` | `parrain-INF` |
| `inscription-parrain-inf-tr` | `TR` | `['parrain', 'marraine']` | `parrain-TR` |

## Squelette complet (à copier dans `<ton-dossier>/php/inscription.php`)

Il faut **PHP 8.1 ou plus** (`php -v`).

```php
<?php
declare(strict_types=1);

require __DIR__ . '/../../php/config/db.php';
require __DIR__ . '/../../php/includes/auth.php';

const OPTION = 'TR';                               // <-- à adapter (voir le tableau)
const ROLES_AUTORISES = ['parrain', 'marraine'];   // <-- à adapter
const CLE_CODE = 'parrain-TR';                     // <-- à adapter

const PAGE_FORMULAIRE = '../inscription/';
const PAGE_SUCCES = '../../espace/';             // l'utilisateur arrive directement sur son espace
const PHOTO_MAX_OCTETS = 2 * 1024 * 1024;
const TYPES_PHOTO = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];

// Renvoie vers le formulaire avec un message d'erreur affiché par le JS
function refuser(string $message): never
{
    $code = rawurlencode((string) ($_POST['code'] ?? ''));
    header('Location: ' . PAGE_FORMULAIRE . '?erreur=' . rawurlencode($message) . '&code=' . $code);
    exit;
}

// 0. On n'accepte que l'envoi du formulaire
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . PAGE_FORMULAIRE);
    exit;
}

// 1. Code d'accès de la classe
$codes = require __DIR__ . '/../../php/config/codes.php';
if (!hash_equals($codes[CLE_CODE], (string) ($_POST['code'] ?? ''))) {
    http_response_code(403);
    exit("Lien d'inscription invalide. Demande le lien de ta classe à l'administrateur.");
}

// 2. Lecture des champs
$nom = trim((string) ($_POST['nom'] ?? ''));
$prenom = trim((string) ($_POST['prenom'] ?? ''));
$telephone = preg_replace('/[\s.-]/', '', (string) ($_POST['telephone'] ?? ''));
$motDePasse = (string) ($_POST['mot_de_passe'] ?? '');
$confirmation = (string) ($_POST['confirmation'] ?? '');
$role = (string) ($_POST['role'] ?? ROLES_AUTORISES[0]);   // filleul : le formulaire n'envoie pas de rôle

// 3. Validations (on refait TOUT, le JS peut être contourné)
if (!in_array($role, ROLES_AUTORISES, true)) {
    refuser('Rôle non autorisé pour cette inscription.');
}
if ($nom === '' || $prenom === '' || mb_strlen($nom) > 50 || mb_strlen($prenom) > 50) {
    refuser('Nom et prénom obligatoires (50 caractères maximum).');
}
if (!preg_match('/^(\+221|221)?(7[05678][0-9]{7})$/', $telephone, $morceaux)) {
    refuser('Numéro invalide. Exemple : 77 123 45 67');
}
$telephone = $morceaux[2];                          // on enregistre 9 chiffres, sans indicatif
if (strlen($motDePasse) < 8 || strlen($motDePasse) > 30) {
    refuser('Le mot de passe doit avoir entre 8 et 30 caractères.');
}
if ($motDePasse !== $confirmation) {
    refuser('Les deux mots de passe ne sont pas identiques.');
}

// 4. Photo
$photo = $_FILES['photo'] ?? null;
if ($photo === null || $photo['error'] !== UPLOAD_ERR_OK) {
    refuser('La photo est obligatoire (2 Mo maximum).');
}
if ($photo['size'] > PHOTO_MAX_OCTETS) {
    refuser('La photo est trop lourde (2 Mo maximum).');
}
$infoImage = getimagesize($photo['tmp_name']);      // lit le VRAI contenu, pas juste l'extension
if ($infoImage === false || !isset(TYPES_PHOTO[$infoImage[2]])) {
    refuser('La photo doit être une image JPG, PNG ou WEBP.');
}
$nomFichier = bin2hex(random_bytes(16)) . '.' . TYPES_PHOTO[$infoImage[2]];   // nom aléatoire
if (!move_uploaded_file($photo['tmp_name'], __DIR__ . '/../../uploads/' . $nomFichier)) {
    error_log('Impossible d\'enregistrer la photo');
    refuser('Erreur serveur pendant l\'envoi de la photo. Réessaie.');
}

// 5. Enregistrement
try {
    $requete = pdo()->prepare(
        'INSERT INTO participant (telephone, nom, prenom, sous_departement, role, mot_de_passe, photo)
         VALUES (:telephone, :nom, :prenom, :option, :role, :mot_de_passe, :photo)'
    );
    $requete->execute([
        ':telephone' => $telephone,
        ':nom' => $nom,
        ':prenom' => $prenom,
        ':option' => OPTION,
        ':role' => $role,
        ':mot_de_passe' => password_hash($motDePasse, PASSWORD_DEFAULT),
        ':photo' => 'uploads/' . $nomFichier,
    ]);
} catch (PDOException $erreur) {
    unlink(__DIR__ . '/../../uploads/' . $nomFichier);        // on ne garde pas une photo orpheline
    if ($erreur->errorInfo[1] === 1062) {                       // 1062 = numéro déjà présent
        refuser('Ce numéro est déjà inscrit.');
    }
    error_log($erreur->getMessage());
    refuser('Erreur serveur. Réessaie plus tard.');
}

// 6. Connexion automatique : la personne arrive directement sur son espace
demarrerSession();
session_regenerate_id(true);
$_SESSION['participant_telephone'] = $telephone;

header('Location: ' . PAGE_SUCCES);
exit;
```

## Comprendre les points délicats

- **`hash_equals`** compare deux textes sans révéler (par le temps de réponse) combien de caractères sont corrects : à utiliser pour les codes et jetons.
- **`getimagesize`** vérifie que le fichier est vraiment une image. Ne te fie jamais à `$_FILES['photo']['type']` ni à l'extension : l'utilisateur les choisit.
- **Nom de fichier aléatoire** : on n'utilise jamais le nom d'origine (risque d'écraser un fichier ou d'exécuter du code).
- **`1062`** est le code d'erreur MySQL « doublon sur une clé unique » : la colonne `telephone` est unique.
- **Pourquoi 9 chiffres ?** Format de stockage commun à toutes les pages (voir `docs/contrat-commun.md`) : `771234567`.

## Comment tester (checklist)

1. Mets des codes quelconques dans `php/config/codes.php`, ouvre `http://localhost:8000/<ton-dossier>/accueil/?code=LE_CODE` : le bouton « Je m'inscris » garde le code dans l'URL.
2. Inscription correcte → **tu arrives directement sur `/espace/`** (session ouverte), ligne visible dans `participant` (bons `role`, `sous_departement`, mot de passe **haché**), photo dans `uploads/`.
3. Mauvais code (`?code=faux`) → page « Lien d'inscription invalide » (403), **rien en base**.
4. Même numéro deux fois → message « déjà inscrit », pas de photo orpheline dans `uploads/`.
5. **Triche** : dans les outils du navigateur (F12), ajoute/modifie un champ `role=parrain` ou `sous_departement=INF` avant l'envoi : l'enregistrement doit rester **celui de ton dossier**.
6. Mot de passe de 5 caractères, photo `.pdf` renommée en `.jpg`, photo de 5 Mo : tous refusés avec un message clair.
7. Un nom contenant `<script>` s'enregistre sans rien exécuter (on n'affiche jamais de donnée sans `htmlspecialchars`).

## À rechercher si tu es bloqué

`php $_FILES upload tutoriel`, `php move_uploaded_file`, `php password_hash`, `php preg_match`, `php header Location exit`, `mysql error 1062 duplicate entry`, `php.ini upload_max_filesize`.
