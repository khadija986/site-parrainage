# PHP pour débutants : le minimum pour ta page

Tu n'as jamais fait de PHP ? Normal. Lis ce document **une fois (20 min)**, puis suis le README de ta page. Tout ce dont tu as besoin tient ici.

## 1. Comment ça marche, en une image

```
Navigateur                                 Serveur (PHP)                     Base de données
 formulaire HTML  --- POST (nom, tel…) -->  fichier .php  --- SQL (PDO) --->  MySQL
 (déjà fait)      <-- redirection / JSON -- (à écrire)    <-- lignes ---------
```

- Le **HTML / CSS / JS est déjà fait** (design et vérifications côté navigateur). **Ton travail = le fichier PHP** de ta page.
- Le navigateur ne parle **jamais** directement à la base : il passe par PHP.
- Un fichier `.php` s'exécute **sur le serveur** ; le visiteur ne voit jamais le code, seulement le résultat.

## 2. Les bases du langage

```php
<?php                                  // toujours en première ligne d'un fichier PHP
declare(strict_types=1);               // PHP plus strict = moins de bugs

$nom = "Awa";                          // une variable commence par $
$age = 20;
echo "Bonjour " . $nom;                // . colle deux textes
$liste = ["a", "b"];                   // un tableau
$personne = ["nom" => "Diop", "tel" => "771234567"];   // tableau associatif
echo $personne["nom"];                 // Diop

if ($age >= 18) { echo "majeur"; }     // condition
foreach ($liste as $element) { echo $element; }         // boucle

function direBonjour(string $nom): string {             // une fonction
    return "Bonjour " . $nom;
}
```

À retenir : chaque ligne finit par `;`, les variables commencent par `$`, `//` commence un commentaire.
(Attention : pour le **tirage**, le cahier des charges interdit les `if` pour choisir le parrain : voir le README de `tirage/`.)

## 3. Lire ce que le formulaire envoie : `$_POST`

Le formulaire HTML contient `<input name="nom">`. En PHP :

```php
$nom = trim($_POST['nom'] ?? '');      // ?? '' = valeur vide si le champ est absent
```

- `$_POST` : champs envoyés en POST. `$_GET` : paramètres de l'URL (`?code=abc`). `$_FILES` : fichiers (photo).
- `trim()` enlève les espaces autour. **Ne jamais faire confiance** à ce qui arrive : tout vérifier à nouveau (longueur, format…).

## 4. Parler à la base : PDO et requêtes préparées

```php
require __DIR__ . '/../../php/config/db.php';   // donne la fonction pdo()

// LIRE
$requete = pdo()->prepare('SELECT nom, prenom FROM participant WHERE telephone = :tel');
$requete->execute([':tel' => $telephone]);
$ligne = $requete->fetch();            // une ligne (ou false si rien)
$lignes = $requete->fetchAll();        // toutes les lignes

// ÉCRIRE
$requete = pdo()->prepare('INSERT INTO participant (telephone, nom) VALUES (:tel, :nom)');
$requete->execute([':tel' => $telephone, ':nom' => $nom]);
```

**Règle d'or : toujours `prepare()` + `:parametre`, JAMAIS `"... WHERE tel = '$tel'"`** (sinon n'importe qui peut détruire la base : « injection SQL »).

Mots-clés à rechercher : `PHP PDO prepare execute`, `SQL injection explication`.

## 5. Mots de passe

```php
$hash = password_hash($motDePasse, PASSWORD_DEFAULT);     // à enregistrer en base
if (password_verify($motDePasseSaisi, $hashEnBase)) { /* bon mot de passe */ }
```

On **ne stocke jamais** le mot de passe lui-même, seulement son hash (illisible).

## 6. La session : « se souvenir » de qui est connecté

```php
require __DIR__ . '/../../php/includes/auth.php';
demarrerSession();
$_SESSION['participant_telephone'] = $telephone;   // à la connexion
$telephone = exigerParticipant();                   // sur une page protégée
session_destroy();                                  // à la déconnexion
```

## 7. Répondre : rediriger ou renvoyer du JSON

```php
header('Location: /connexion/?inscrit=1');   // redirection
exit;                                                           // toujours exit après

header('Content-Type: application/json; charset=utf-8');         // JSON pour le JS
echo json_encode(['nom' => 'Awa']);
```

## 8. Afficher une donnée dans du HTML en sécurité

```php
echo htmlspecialchars($nom, ENT_QUOTES, 'UTF-8');   // empêche l'injection de code (XSS)
```

## 9. Gérer les erreurs sans casser la page

```php
try {
    // ... ton code ...
} catch (PDOException $erreur) {
    error_log($erreur->getMessage());      // détail pour toi (log)
    http_response_code(500);
    exit('Une erreur est survenue, réessaie plus tard.');   // message simple pour l'utilisateur
}
```

## 10. Méthode de travail conseillée

1. Lis le README de ta page, puis ouvre la page dans le navigateur pour voir ce qui existe.
2. Écris **un tout petit morceau** (ex. juste lire `$_POST` et l'afficher avec `var_dump($_POST); exit;`), teste, puis continue.
3. Regarde la base dans phpMyAdmin après chaque test.
4. Bloqué ? Lis le message d'erreur en entier (il donne le fichier et la ligne), puis cherche-le sur internet entre guillemets.
5. Avant la pull request : refais le parcours complet et coche la liste « C'est terminé quand… » de ton README.

## 11. Ressources

- Le manuel officiel (en français) : https://www.php.net/manual/fr/
- Tutoriel PHP de base : https://www.w3schools.com/php/ (sections *Forms*, *Sessions*, *MySQL*)
- PDO : https://www.php.net/manual/fr/book.pdo.php
- Sécurité PHP, les 3 incontournables : *SQL injection*, *XSS*, *password_hash*
