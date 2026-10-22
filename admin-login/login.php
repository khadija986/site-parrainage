<?php 
declare(strict_types=1);
session_start();

$erreur= '';

require_once __DIR__ . '/../php/config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
$telephone = trim($_POST['telephone'] ?? '');
$motDePasse = $_POST['password'] ?? '';

if ($telephone === '' || $motDePasse === '') {
    $erreur = "Veuillez remplir tous les champs.";
} else { 

try {
    $requete = pdo()->prepare(
        'SELECT `telephone`, `mot_de_passe`
         FROM `administrateur`
         WHERE `telephone` = :telephone
         LIMIT 1'
    );

    $requete->execute(['telephone' => $telephone]);
    $admin = $requete->fetch();

    if (
        !$admin ||
        !password_verify($motDePasse, $admin['mot_de_passe'])
    ) {
        $erreur = "Téléphone ou mot de passe incorrect.";
    } else{
        session_regenerate_id(true);
        $_SESSION['admin_telephone'] = $admin['telephone'];
        header('Location: ../resultats/index.php');
        exit;
    }

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    $erreur = "Une erreur est survenue lors de la connexion.";
}
}
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>login admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/login4.css">
</head>
<body>
    <h1 id="h1_login">Welcome back to the admin space!</h1>
    <form action="login.php" method="post">
        <?php if($erreur !== ''): ?>
            <p class="message-erreur" role="alert">
                <?= htmlspecialchars($erreur, ENT_QUOTES, 'UTF-8') ?>
            </p>
        <?php endif; ?>
        <h2 id="h2-login">Connect</h2>
        <div class="champ">
           <label for="telephone">Téléphone:</label>
           <input type="tel" name="telephone" id="telephone" placeholder="Ex. : 77 777 77 77" maxlength="20" required>
        </div>
        <div class="champ">
           <label for="password">Password:</label>
           <input type="password" name="password" id="password" required>
        </div>
        <button type="submit" id="connect">Connexion</button>
    </form>
    <script src="../shared/js/config.js"></script>
    <script src="js/login.js"></script>
</body>
</html>