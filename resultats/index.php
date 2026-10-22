<?php 
declare(strict_types=1);

session_start();

require_once __DIR__ . '/../php/config/db.php';

// Vérifier la connexion de l'administrateur
if (empty($_SESSION['admin_telephone'])) {
    header('Location: ../admin-login/login.php');
    exit;
}

try {
    $sql = "
        SELECT
            a.telephone_filleul,
            a.telephone_parrain,
            a.date_tirage,
            f.nom AS nom_filleul,
            f.`prenom` AS prenom_filleul,
            f.sous_departement AS departement_filleul,
            f.photo AS photo_filleul,
            p.nom AS nom_parrain,
            p.`prenom` AS prenom_parrain,
            p.sous_departement AS departement_parrain,
            p.photo AS photo_parrain
        FROM association a
        INNER JOIN participant f
            ON f.`telephone` = a.telephone_filleul
        INNER JOIN participant p
            ON p.`telephone` = a.telephone_parrain
        ORDER BY a.date_tirage DESC
    ";

    $resultats = pdo()->query($sql)->fetchAll();

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    exit('Erreur lors du chargement des résultats.');
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Résultats du parrainage</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../shared/css/admin.css">
    <!-- Socle visuel admin (boutons, cartes) partagé avec la page gestion-utilisateurs -->
    <link rel="stylesheet" href="../gestion-utilisateurs/css/gestion-utilisateurs.css">
    <link rel="stylesheet" href="css/resultats.css">
</head>
<body>
<div class="app">
    <aside class="sidebar" id="sidebar">
      <div class="marque"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Parrainage</span></div>
      <nav aria-label="Navigation admin">
        <a href="../gestion-utilisateurs/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Tableau de bord</a>
        <a href="../tirage/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>Tirage</a>
        <a href="../resultats/" aria-current="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>Résultats</a>
        <a href="../gestion-mots-de-passe/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>Mots de passe</a>
      </nav>
      <div class="bas">
        <nav aria-label="Compte">
          <a href="../admin-login/login.php"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Déconnexion</a>
        </nav>
      </div>
    </aside>
    <div class="fond-menu" id="fond-menu"></div>
    <div class="zone">
    <div class="topbar">
      <button type="button" class="burger" id="burger" aria-label="Ouvrir le menu" aria-controls="sidebar" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      <span class="titre">Résultats</span>
    </div>

  <main>
        <h2>Résultats du parrainage</h2>
        <p class="aide" id="intro">Chaque filleul avec son parrain ou sa marraine, tels que le tirage les a associés. Les participants ne voient que leur propre résultat dans leur espace.</p>
        <p class="demo" id="demo" hidden>Données de démonstration : les vrais résultats s'afficheront une fois PHP branché.</p>

        <div class="outils">
            <div class="onglets" role="group" aria-label="Choix de l'option">
                <button type="button" class="onglet actif" data-option="TOUS" aria-pressed="true">Tous</button>
                <button type="button" class="onglet" data-option="INF" aria-pressed="false">Informatique</button>
                <button type="button" class="onglet" data-option="TR" aria-pressed="false">Télécoms &amp; Réseaux</button>
            </div>
            <div class="telechargements">
                <button type="button" id="btn-csv">Télécharger (CSV)</button>
                <button type="button" id="btn-imprimer">Imprimer / PDF</button>
            </div>
        </div>

        <p id="message" class="info" role="status"></p>
        <section id="liste" class="liste" aria-live="polite"></section>
    </main>
    </div>
    </div>

   <script> 
    window.resultatsParrainage = <?= json_encode(
        $resultats,
        JSON_UNESCAPED_UNICODE
        | JSON_HEX_TAG
        | JSON_HEX_APOS
        | JSON_HEX_QUOT
        | JSON_HEX_AMP
    ) ?>;
    </script> 
    <script src="../shared/js/config.js"></script>
    <script src="js/resultats.js"></script>
    <script src="../shared/js/admin-nav.js"></script>
</body>
</html>
