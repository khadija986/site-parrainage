<?php
declare(strict_types=1);

// Page espace : renvoie en JSON le parrainage de l'utilisateur connecté (et de lui seul).
// Voir espace/README.md

require __DIR__ . '/../../php/config/db.php';
require __DIR__ . '/../../php/includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

// La base garde « uploads/abc.jpg » : on ajoute « / » devant pour que la photo
// s'affiche depuis n'importe quelle page du site (sinon le navigateur la cherche dans /espace/uploads/)
function cheminPhoto(array $personne): array
{
    $personne['photo'] = '/' . ltrim((string) $personne['photo'], '/');
    return $personne;
}

// Envoie une erreur en JSON, puis arrête le script
function erreur(int $code, string $message): never
{
    http_response_code($code);
    echo json_encode(['erreur' => $message]);
    exit;
}

// 1. Qui est connecté ? (toujours le numéro de la SESSION, jamais un paramètre de l'adresse)
demarrerSession();
$telephone = (string) ($_SESSION['participant_telephone'] ?? '');
if ($telephone === '') {
    erreur(401, 'Tu dois être connecté·e.');
}

try {
    // 2. Les informations de l'utilisateur
    $requete = pdo()->prepare(
        'SELECT prenom, nom, photo, role, sous_departement FROM participant WHERE telephone = :tel'
    );
    $requete->execute([':tel' => $telephone]);
    $moi = $requete->fetch();
    if ($moi === false) {
        erreur(401, 'Compte introuvable. Reconnecte-toi.');
    }

    // 3. Le tirage de son option est-il fait ?
    //    Oui s'il y a au moins un filleul dans l'option, et qu'aucun filleul de l'option n'est sans parrain.
    $requete = pdo()->prepare(
        "SELECT COUNT(*) AS total, SUM(a.telephone_filleul IS NULL) AS sans_parrain
         FROM participant f
         LEFT JOIN association a ON a.telephone_filleul = f.telephone
         WHERE f.role = 'filleul' AND f.sous_departement = :option"
    );
    $requete->execute([':option' => $moi['sous_departement']]);
    $compte = $requete->fetch();
    $tirageEffectue = (int) $compte['total'] > 0 && (int) $compte['sans_parrain'] === 0;

    $reponse = cheminPhoto($moi);
    $reponse['tirage_effectue'] = $tirageEffectue;

    // 4. Si le tirage est fait : son parrain (filleul) ou ses filleuls (parrain / marraine)
    if ($tirageEffectue) {
        if ($moi['role'] === 'filleul') {
            $requete = pdo()->prepare(
                'SELECT p.prenom, p.nom, p.photo, p.telephone, p.sous_departement, p.role
                 FROM association a JOIN participant p ON p.telephone = a.telephone_parrain
                 WHERE a.telephone_filleul = :tel'
            );
            $requete->execute([':tel' => $telephone]);
            $parrain = $requete->fetch();
            $reponse['parrain'] = $parrain ? cheminPhoto($parrain) : null;
        } else {
            $requete = pdo()->prepare(
                'SELECT f.prenom, f.nom, f.photo, f.telephone, f.sous_departement, f.role
                 FROM association a JOIN participant f ON f.telephone = a.telephone_filleul
                 WHERE a.telephone_parrain = :tel
                 ORDER BY f.prenom'
            );
            $requete->execute([':tel' => $telephone]);
            $reponse['filleuls'] = array_map('cheminPhoto', $requete->fetchAll());   // tableau vide s'il n'a aucun filleul
        }
    }

    // 5. On envoie la réponse
    echo json_encode($reponse);
} catch (PDOException $e) {
    error_log($e->getMessage());
    erreur(500, 'Erreur serveur. Réessaie plus tard.');
}