<?php
// OUTIL DE DÉVELOPPEMENT : ouvre une session de test pour travailler sur une page sans dépendre de la connexion.
//   /php/dev/connecter-test.php?participant=771000001
//   /php/dev/connecter-test.php?admin=770000000
// Refusé hors de la machine locale. À supprimer avant la mise en ligne.
declare(strict_types=1);
require __DIR__ . '/../includes/auth.php';

if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    exit('Réservé au développement local.');
}

demarrerSession();
if (isset($_GET['participant'])) {
    $_SESSION['participant_telephone'] = (string) $_GET['participant'];
}
if (isset($_GET['admin'])) {
    $_SESSION['admin_telephone'] = (string) $_GET['admin'];
}
header('Content-Type: text/plain; charset=utf-8');
echo "Session de test : ", json_encode($_SESSION), "\n";
