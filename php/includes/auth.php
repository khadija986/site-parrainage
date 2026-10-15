<?php
// Contrat de session commun : chaque page ne s'appuie que sur ces deux clés.
//   $_SESSION['participant_telephone']  -> rempli par connexion/php/connexion.php
//   $_SESSION['admin_telephone']        -> rempli par admin-login/php/connexion.php
declare(strict_types=1);

const PAGE_CONNEXION = '/connexion/';
const PAGE_CONNEXION_ADMIN = '/admin-login/';

function demarrerSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
        session_start();
    }
}

function exigerParticipant(): string
{
    demarrerSession();
    if (empty($_SESSION['participant_telephone'])) {
        header('Location: ' . PAGE_CONNEXION);
        exit;
    }
    return $_SESSION['participant_telephone'];
}

function exigerAdmin(): string
{
    demarrerSession();
    if (empty($_SESSION['admin_telephone'])) {
        header('Location: ' . PAGE_CONNEXION_ADMIN);
        exit;
    }
    return $_SESSION['admin_telephone'];
}
