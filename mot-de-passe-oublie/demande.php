<?php
declare(strict_types=1);

// Toujours renvoyer du JSON
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/../../php/config/db.php';

// Accepter seulement les requêtes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

// Récupérer les données envoyées (depuis $_POST ou via JSON brut)
$input = json_decode(file_get_contents('php://input'), true);
$telephoneBrut = $input['telephone'] ?? $_POST['telephone'] ?? '';

// Normaliser le numéro de téléphone (9 chiffres)
$telephone = preg_replace(
    '/^(\+221|221)/',
    '',
    preg_replace(
        '/[\s.-]/',
        '',
        (string) $telephoneBrut
    )
);

// Si le numéro n'est pas valide (pas 9 chiffres), on renvoie quand même ok:true pour la sécurité
if (!preg_match('/^\d{9}$/', $telephone)) {
    echo json_encode(['ok' => true]);
    exit;
}

try {
    $pdo = pdo();

    // 1. Vérifier si le numéro existe dans la table participant
    $reqParticipant = $pdo->prepare('SELECT COUNT(*) FROM participant WHERE telephone = :tel');
    $reqParticipant->execute([':tel' => $telephone]);
    if ((int) $reqParticipant->fetchColumn() === 0) {
        // Le numéro n'existe pas : on simule un succès pour éviter l'énumération de comptes
        echo json_encode(['ok' => true]);
        exit;
    }

    // 2. Anti-abus : au plus 3 demandes par heure et par numéro
    $reqRate = $pdo->prepare('SELECT COUNT(*) FROM demande_mot_de_passe WHERE telephone = :tel AND date_demande > NOW() - INTERVAL 1 HOUR');
    $reqRate->execute([':tel' => $telephone]);
    if ((int) $reqRate->fetchColumn() >= 3) {
        echo json_encode(['ok' => true]);
        exit;
    }

    // 3. Vérifier s'il n'y a pas déjà une demande non traitée (traitee = 0) pour ce numéro
    $reqPending = $pdo->prepare('SELECT COUNT(*) FROM demande_mot_de_passe WHERE telephone = :tel AND traitee = 0');
    $reqPending->execute([':tel' => $telephone]);
    if ((int) $reqPending->fetchColumn() > 0) {
        echo json_encode(['ok' => true]);
        exit;
    }

    // 4. Insérer la demande en base
    $reqInsert = $pdo->prepare('INSERT INTO demande_mot_de_passe (telephone) VALUES (:tel)');
    $reqInsert->execute([':tel' => $telephone]);

} catch (\Throwable $e) {
    // Écrire l'erreur dans les logs du serveur (conformément à la consigne keepalive)
    error_log('Erreur demande mot de passe oublié : ' . $e->getMessage());
}

// Répondre toujours la même chose (code 200, ok: true)
echo json_encode(['ok' => true]);
exit;
