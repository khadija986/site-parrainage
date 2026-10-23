<?php
declare(strict_types=1);


require __DIR__ . '/../../php/config/db.php';        
require __DIR__ . '/../../php/includes/auth.php';    

const PAGE_PROFIL = '../';                          
const PHOTO_MAX_OCTETS = 2 * 1024 * 1024;
const TYPES_PHOTO = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
const DOSSIER_UPLOADS = __DIR__ . '/../../uploads/';

// ───────────── Fonctions locales ─────────────

// Renvoie vers la page profil avec un message d'erreur
function refuserProfil(string $message): never
{
    header('Location: ' . PAGE_PROFIL . '?erreur=' . rawurlencode($message));
    exit;
}

// Jeton CSRF stocké en session (créé au premier appel)
function profilJetonCsrf(): string
{
    if (empty($_SESSION['csrf_profil']) || !is_string($_SESSION['csrf_profil'])) {
        $_SESSION['csrf_profil'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_profil'];
}

// ───────────── 1. Accès réservé aux participants connectés ─────────────
$ancienTelephone = exigerParticipant();             // démarre la session, redirige vers /connexion/ sinon

// Participant actuel
$requete = pdo()->prepare(
    'SELECT telephone, nom, prenom, role, sous_departement, mot_de_passe, photo
     FROM participant WHERE telephone = :telephone'
);
$requete->execute([':telephone' => $ancienTelephone]);
$participant = $requete->fetch();
if ($participant === false) {                        // compte supprimé entre-temps
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'lire') {
        http_response_code(404);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['erreur' => 'Profil introuvable.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    header('Location: ' . PAGE_CONNEXION);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (($_GET['action'] ?? '') !== 'lire') {
        header('Location: ' . PAGE_PROFIL);
        exit;
    }
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store');
    echo json_encode([
        'nom' => $participant['nom'],
        'prenom' => $participant['prenom'],
        'telephone' => $participant['telephone'],
        'role' => $participant['role'],
        'sous_departement' => $participant['sous_departement'],
        // chemin absolu depuis la racine du site : la page /profil/ en a besoin pour afficher l'image
        'photo' => (string) $participant['photo'] !== '' ? '/' . ltrim((string) $participant['photo'], '/') : '',
        'csrf' => profilJetonCsrf(),                 // jamais de mot de passe dans cette réponse
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . PAGE_PROFIL);
    exit;
}




$jetonRecu = (string) ($_POST['csrf'] ?? '');
if ($jetonRecu === '' || !hash_equals(profilJetonCsrf(), $jetonRecu)) {
    http_response_code(403);
    exit('Requête invalide (jeton de sécurité manquant ou expiré). Recharge la page et réessaie.');
}


$motDePasseActuel = (string) ($_POST['mot_de_passe_actuel'] ?? '');
if ($motDePasseActuel === '' || !password_verify($motDePasseActuel, (string) $participant['mot_de_passe'])) {
    refuserProfil('Mot de passe actuel incorrect.');
}

$nom = trim((string) ($_POST['nom'] ?? ''));
$prenom = trim((string) ($_POST['prenom'] ?? ''));
$telephone = preg_replace('/[\s.-]/', '', (string) ($_POST['telephone'] ?? ''));
$nouveauMotDePasse = (string) ($_POST['nouveau_mot_de_passe'] ?? '');
$confirmation = (string) ($_POST['confirmation'] ?? '');

if ($nom === '' || $prenom === '' || mb_strlen($nom) > 50 || mb_strlen($prenom) > 50) {
    refuserProfil('Nom et prénom obligatoires (50 caractères maximum).');
}
if (!preg_match('/^(\+221|221)?(7[05678][0-9]{7})$/', $telephone, $morceaux)) {
    refuserProfil('Numéro invalide. Exemple : 77 123 45 67');
}
$telephone = $morceaux[2];                           // 9 chiffres, sans indicatif

// 3.4 Nouveau mot de passe (optionnel)
$nouveauHash = null;
if ($nouveauMotDePasse !== '' || $confirmation !== '') {
    if (strlen($nouveauMotDePasse) < 8 || strlen($nouveauMotDePasse) > 30) {
        refuserProfil('Le nouveau mot de passe doit avoir entre 8 et 30 caractères.');
    }
    if ($nouveauMotDePasse !== $confirmation) {
        refuserProfil('Les deux mots de passe ne sont pas identiques.');
    }
    $nouveauHash = password_hash($nouveauMotDePasse, PASSWORD_DEFAULT);
}

// 3.5 Nouveau numéro : il ne doit pas déjà appartenir à quelqu'un d'autre
if ($telephone !== $ancienTelephone) {
    $existe = pdo()->prepare('SELECT 1 FROM participant WHERE telephone = :telephone LIMIT 1');
    $existe->execute([':telephone' => $telephone]);
    if ($existe->fetchColumn() !== false) {
        refuserProfil('Ce numéro est déjà utilisé.');
    }
}

// 3.6 Nouvelle photo (optionnelle) : on vérifie tout AVANT d'enregistrer quoi que ce soit
$photo = $_FILES['photo'] ?? null;
$extensionPhoto = null;
if ($photo !== null && $photo['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($photo['error'] !== UPLOAD_ERR_OK) {
        refuserProfil('Erreur pendant l\'envoi de la photo (2 Mo maximum).');
    }
    if ($photo['size'] > PHOTO_MAX_OCTETS) {
        refuserProfil('La photo est trop lourde (2 Mo maximum).');
    }
    $infoImage = getimagesize($photo['tmp_name']);   // lit le VRAI contenu, pas l'extension
    if ($infoImage === false || !isset(TYPES_PHOTO[$infoImage[2]])) {
        refuserProfil('La photo doit être une image JPG, PNG ou WEBP.');
    }
    $extensionPhoto = TYPES_PHOTO[$infoImage[2]];
}

// 3.7 Enregistrement de la nouvelle photo (nom aléatoire)
$nouveauCheminPhoto = null;
$nomFichier = null;
if ($extensionPhoto !== null) {
    if (!is_dir(DOSSIER_UPLOADS) && !mkdir(DOSSIER_UPLOADS, 0755, true) && !is_dir(DOSSIER_UPLOADS)) {
        error_log('Impossible de créer le dossier uploads/');
        refuserProfil('Erreur serveur pendant l\'envoi de la photo. Réessaie.');
    }
    $nomFichier = bin2hex(random_bytes(16)) . '.' . $extensionPhoto;
    if (!move_uploaded_file($photo['tmp_name'], DOSSIER_UPLOADS . $nomFichier)) {
        error_log('Impossible d\'enregistrer la photo');
        refuserProfil('Erreur serveur pendant l\'envoi de la photo. Réessaie.');
    }
    $nouveauCheminPhoto = 'uploads/' . $nomFichier;
}

// 3.8 Mise à jour : jamais role ni sous_departement
$champs = 'telephone = :telephone, nom = :nom, prenom = :prenom';
$parametres = [
    ':telephone' => $telephone,
    ':nom' => $nom,
    ':prenom' => $prenom,
    ':ancien' => $ancienTelephone,
];
if ($nouveauCheminPhoto !== null) {
    $champs .= ', photo = :photo';
    $parametres[':photo'] = $nouveauCheminPhoto;
}
if ($nouveauHash !== null) {
    $champs .= ', mot_de_passe = :mot_de_passe, mot_de_passe_temporaire = 0';
    $parametres[':mot_de_passe'] = $nouveauHash;
}

try {
    // ON UPDATE CASCADE : les liens de `association` et `demande_mot_de_passe` suivent le nouveau numéro
    $miseAJour = pdo()->prepare("UPDATE participant SET $champs WHERE telephone = :ancien");
    $miseAJour->execute($parametres);
} catch (PDOException $erreur) {
    if ($nomFichier !== null) {
        @unlink(DOSSIER_UPLOADS . $nomFichier);                    // pas de photo orpheline
    }
    if (($erreur->errorInfo[1] ?? 0) === 1062) {                   // 1062 = numéro déjà présent
        refuserProfil('Ce numéro est déjà utilisé.');
    }
    error_log($erreur->getMessage());
    refuserProfil('Erreur serveur. Réessaie plus tard.');
}

// 3.9 Suppression de l'ancienne photo (seulement si une nouvelle l'a remplacée)
if ($nouveauCheminPhoto !== null && (string) $participant['photo'] !== '') {
    $ancienFichier = DOSSIER_UPLOADS . basename((string) $participant['photo']);
    if (is_file($ancienFichier)) {
        @unlink($ancienFichier);
    }
}

// 3.10 Session : le téléphone est la clé de la personne
$_SESSION['participant_telephone'] = $telephone;
if ($nouveauHash !== null) {
    session_regenerate_id(true);                                   // mot de passe changé
}
unset($_SESSION['csrf_profil']);                                   // jeton à usage unique

header('Location: ' . PAGE_PROFIL . '?succes=1');
exit;
