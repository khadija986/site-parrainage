<?php
declare(strict_types=1);

require __DIR__ . '/../../php/config/db.php';        
require __DIR__ . '/../../php/includes/auth.php';   

const OPTION = 'TR';
const ROLES_AUTORISES = ['parrain', 'marraine'];
const CLE_CODE = 'parrain-TR';

const PAGE_FORMULAIRE = '../inscription/';
const PAGE_SUCCES = '../../espace/';                 
const PHOTO_MAX_OCTETS = 2 * 1024 * 1024;
const TYPES_PHOTO = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
const DOSSIER_UPLOADS = __DIR__ . '/../../uploads/';


function refuser(string $message): never
{
    $code = rawurlencode((string) ($_POST['code'] ?? ''));
    header('Location: ' . PAGE_FORMULAIRE . '?erreur=' . rawurlencode($message) . '&code=' . $code);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . PAGE_FORMULAIRE);
    exit;
}

// 1. Code d'accès de la classe
$codes = require __DIR__ . '/../../php/config/codes.php';
$codeAttendu = (string) ($codes[CLE_CODE] ?? '');
if ($codeAttendu === '' || !hash_equals($codeAttendu, (string) ($_POST['code'] ?? ''))) {
    http_response_code(403);
    exit("Lien d'inscription invalide. Demande le lien de ta classe à l'administrateur.");
}

// 2. Lecture des champs
$nom = trim((string) ($_POST['nom'] ?? ''));
$prenom = trim((string) ($_POST['prenom'] ?? ''));
$telephone = preg_replace('/[\s.-]/', '', (string) ($_POST['telephone'] ?? ''));
$motDePasse = (string) ($_POST['mot_de_passe'] ?? '');
$confirmation = (string) ($_POST['confirmation'] ?? '');
$role = (string) ($_POST['role'] ?? ROLES_AUTORISES[0]);

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
$telephone = $morceaux[2];                           // 9 chiffres, sans indicatif
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
$infoImage = getimagesize($photo['tmp_name']);       // lit le VRAI contenu, pas l'extension
if ($infoImage === false || !isset(TYPES_PHOTO[$infoImage[2]])) {
    refuser('La photo doit être une image JPG, PNG ou WEBP.');
}
if (!is_dir(DOSSIER_UPLOADS) && !mkdir(DOSSIER_UPLOADS, 0755, true) && !is_dir(DOSSIER_UPLOADS)) {
    error_log("Impossible de créer le dossier uploads/");
    refuser("Erreur serveur pendant l'envoi de la photo. Réessaie.");
}
$nomFichier = bin2hex(random_bytes(16)) . '.' . TYPES_PHOTO[$infoImage[2]];   // nom aléatoire
if (!move_uploaded_file($photo['tmp_name'], DOSSIER_UPLOADS . $nomFichier)) {
    error_log("Impossible d'enregistrer la photo");
    refuser("Erreur serveur pendant l'envoi de la photo. Réessaie.");
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
        ':option' => OPTION,                                      // imposé par ce script
        ':role' => $role,                                         // déjà vérifié dans ROLES_AUTORISES
        ':mot_de_passe' => password_hash($motDePasse, PASSWORD_DEFAULT),
        ':photo' => 'uploads/' . $nomFichier,
    ]);
} catch (PDOException $erreur) {
    @unlink(DOSSIER_UPLOADS . $nomFichier);                       // pas de photo orpheline
    if (($erreur->errorInfo[1] ?? 0) === 1062) {                  // 1062 = numéro déjà présent
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
