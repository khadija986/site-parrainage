<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['admin_telephone'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'message' => 'Session administrateur expirée.']);
    exit;
}

require_once __DIR__ . '/../php/config/db.php';

function repondre(array $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = pdo();
    $action = $_GET['action'] ?? '';

    if ($action === 'liste' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $db->query(
            'SELECT id, telephone, date_demande, traitee
             FROM demande_mot_de_passe
             ORDER BY traitee ASC, date_demande DESC'
        );

        $demandes = array_map(
            static fn(array $d): array => [
                'id' => (int) $d['id'],
                'telephone' => $d['telephone'],
                'date' => $d['date_demande'],
                'traitee' => (bool) $d['traitee'],
                'motDePasse' => ''
            ],
            $stmt->fetchAll()
        );

        repondre(['ok' => true, 'demandes' => $demandes]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        repondre(['ok' => false, 'message' => 'Méthode non autorisée.'], 405);
    }

    $donnees = json_decode(file_get_contents('php://input'), true);

    if (!is_array($donnees)) {
        repondre(['ok' => false, 'message' => 'Données invalides.'], 400);
    }

    if ($action === 'ajouter') {
        $telephone = trim((string) ($donnees['telephone'] ?? ''));
        $normalise = preg_replace('/[\s.-]+/', '', $telephone);

        if (!$normalise || !preg_match('/^[0-9+]{8,15}$/', $normalise)) {
            repondre(['ok' => false, 'message' => 'Numéro invalide.'], 400);
        }

        $stmt = $db->prepare(
            "SELECT telephone FROM participant
             WHERE REPLACE(REPLACE(REPLACE(telephone, ' ', ''), '-', ''), '.', '') = ?
             LIMIT 1"
        );
        $stmt->execute([$normalise]);
        $participant = $stmt->fetch();

        if (!$participant) {
            repondre(['ok' => false, 'message' => 'Aucun participant trouvé avec ce numéro.'], 404);
        }

        $telephone = $participant['telephone'];

        $stmt = $db->prepare(
            'SELECT id FROM demande_mot_de_passe
             WHERE telephone = ? AND traitee = 0 LIMIT 1'
        );
        $stmt->execute([$telephone]);

        if ($stmt->fetch()) {
            repondre(['ok' => false, 'message' => 'Une demande est déjà en attente pour ce numéro.'], 409);
        }

        $stmt = $db->prepare(
            'INSERT INTO demande_mot_de_passe (telephone, traitee)
             VALUES (?, 0)'
        );
        $stmt->execute([$telephone]);

        repondre(['ok' => true, 'message' => 'Demande ajoutée.']);
    }

    if ($action === 'traiter') {
    $id = filter_var($donnees['id'] ?? null, FILTER_VALIDATE_INT);
    $motDePasse = (string) ($donnees['motDePasse'] ?? '');

    if (!$id || strlen($motDePasse) < 8 || strlen($motDePasse) > 128) {
        repondre(['ok' => false, 'message' => 'Demande ou mot de passe invalide.'], 400);
    }

    $db->beginTransaction();

    $stmt = $db->prepare(
        'SELECT telephone FROM demande_mot_de_passe
         WHERE id = ? FOR UPDATE'
    );
    $stmt->execute([$id]);
    $demande = $stmt->fetch();

    if (!$demande) {
        $db->rollBack();
        repondre(['ok' => false, 'message' => 'Demande introuvable.'], 404);
    }

    $stmt = $db->prepare(
        'UPDATE participant
         SET mot_de_passe = ?, mot_de_passe_temporaire = 1
         WHERE telephone = ?'
    );
    $stmt->execute([
        password_hash($motDePasse, PASSWORD_DEFAULT),
        $demande['telephone']
    ]);

    $stmt = $db->prepare(
        'UPDATE demande_mot_de_passe
         SET traitee = 0
         WHERE id = ?'
    );
    $stmt->execute([$id]);

    $db->commit();

    repondre([
        'ok' => true,
        'telephone' => $demande['telephone'],
        'message' => 'Mot de passe réinitialisé. Confirme l’envoi après WhatsApp.'
    ]);
}

if ($action === 'confirmer') {
    $id = filter_var($donnees['id'] ?? null, FILTER_VALIDATE_INT);

    if (!$id) {
        repondre(['ok' => false, 'message' => 'Identifiant invalide.'], 400);
    }

    $stmt = $db->prepare(
        'UPDATE demande_mot_de_passe
         SET traitee = 1
         WHERE id = ?'
    );
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        $verif = $db->prepare(
            'SELECT id FROM demande_mot_de_passe WHERE id = ?'
        );
        $verif->execute([$id]);

        if (!$verif->fetch()) {
            repondre(['ok' => false, 'message' => 'Demande introuvable.'], 404);
        }
    }

    repondre(['ok' => true, 'message' => 'Demande marquée comme traitée.']);
} 

    if ($action === 'supprimer') {
        $id = filter_var($donnees['id'] ?? null, FILTER_VALIDATE_INT);

        if (!$id) {
            repondre(['ok' => false, 'message' => 'Identifiant invalide.'], 400);
        }

        $stmt = $db->prepare('DELETE FROM demande_mot_de_passe WHERE id = ?');
        $stmt->execute([$id]);

        repondre(['ok' => true, 'message' => 'Demande supprimée.']);
    }

    repondre(['ok' => false, 'message' => 'Action inconnue.'], 400);

} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    error_log((string) $e);
    repondre(['ok' => false, 'message' => 'Erreur serveur. Vérifie les journaux PHP.'], 500);
}
?>