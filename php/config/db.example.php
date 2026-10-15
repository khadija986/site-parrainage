<?php
// Copier ce fichier en php/config/db.php (ignoré par git) puis ajuster si besoin.
// Valeurs par défaut = XAMPP en local (utilisateur root sans mot de passe).
declare(strict_types=1);

function pdo(): PDO
{
    static $connexion = null;
    if ($connexion === null) {
        $connexion = new PDO(
            'mysql:host=127.0.0.1;dbname=site_de_parrainage;charset=utf8mb4',
            'root',
            '',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    }
    return $connexion;
}
