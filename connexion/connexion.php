<?php
declare(strict_types=1);

require __DIR__ . '/../../php/config/db.php';
require __DIR__ . '/../../php/include/auth.php';

const PAGE_FORMULAIRE = '../';
const PAGE_ESPACE = '../../espace/';
const PAGE_PROFIL = '../../profil/';
const MESSAGE_ERREUR = 'Numéro ou mot de passe incorrect.';

const MAX_TENTATIVES = 5;
const DUREE_BLOCAGE = 300; // 5 minutes

// Seules les requêtes POST sont autorisées.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . PAGE_FORMULAIRE);
    exit;
}

// Normaliser le numéro de téléphone.
$telephone = preg_replace(
    '/^(\+221|221)/',
    '',
    preg_replace(
        '/[\s.-]/',
        '',
        (string) ($_POST['telephone'] ?? '')
    )
);

$motDePasse = (string) ($_POST['mot_de_passe'] ?? '');

// Refuser les entrées invalides.
if (
    !is_string($telephone) ||
    !preg_match('/^\d{9}$/', $telephone) ||
    $motDePasse === '' ||
    strlen($motDePasse) > 30
) {
    header(
        'Location: ' . PAGE_FORMULAIRE .
        '?erreur=' . rawurlencode(MESSAGE_ERREUR)
    );
    exit;
}

// Démarrer la session pour gérer les tentatives.
demarrerSession();

if (!isset($_SESSION['tentatives_connexion'])) {
    $_SESSION['tentatives_connexion'] = [];
}

$tentatives = &$_SESSION['tentatives_connexion'];
$maintenant = time();

// Vérifier si ce numéro est temporairement bloqué.
$etat = $tentatives[$telephone] ?? [
    'nombre' => 0,
    'bloque_jusqu_a' => 0
];

if ($etat['bloque_jusqu_a'] > $maintenant) {
    header(
        'Location: ' . PAGE_FORMULAIRE .
        '?erreur=' . rawurlencode(MESSAGE_ERREUR)
    );
    exit;
}

// Le blocage est terminé : réinitialiser le compteur.
if ($etat['bloque_jusqu_a'] > 0) {
    $etat = [
        'nombre' => 0,
        'bloque_jusqu_a' => 0
    ];
}

// Chercher le participant avec une requête préparée.
$requete = pdo()->prepare(
    'SELECT mot_de_passe, mot_de_passe_temporaire
     FROM participant
     WHERE telephone = :tel'
);

$requete->execute([':tel' => $telephone]);
$participant = $requete->fetch();

// Vérifier le mot de passe même si le numéro est inconnu.
$hash = $participant['mot_de_passe']
    ?? password_hash('faux', PASSWORD_DEFAULT);

$motDePasseValide = password_verify($motDePasse, $hash);

// Refuser les identifiants incorrects.
if ($participant === false || !$motDePasseValide) {
    $etat['nombre']++;

    if ($etat['nombre'] >= MAX_TENTATIVES) {
        $etat['bloque_jusqu_a'] = $maintenant + DUREE_BLOCAGE;
    }

    $tentatives[$telephone] = $etat;

    header(
        'Location: ' . PAGE_FORMULAIRE .
        '?erreur=' . rawurlencode(MESSAGE_ERREUR)
    );
    exit;
}

// Connexion réussie : renouveler l'identifiant de session.
session_regenerate_id(true);

// Seul ce fichier renseigne la clé de session du participant.
$_SESSION['participant_telephone'] = $telephone;

// Effacer le compteur après une connexion réussie.
unset($_SESSION['tentatives_connexion'][$telephone]);

// Rediriger selon le statut du mot de passe.
if ((int) $participant['mot_de_passe_temporaire'] === 1) {
    header('Location: ' . PAGE_PROFIL . '?mdp_temporaire=1');
    exit;
}

header('Location: ' . PAGE_ESPACE);
exit;
