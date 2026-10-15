# Lancer le projet avec XAMPP (base de données + PHP)

Objectif : voir concrètement ta page fonctionner avec la vraie base de données, sur ton ordinateur.

## 1. Installer et démarrer XAMPP

1. Installer XAMPP (https://www.apachefriends.org), version avec **PHP 8.x**.
2. Ouvrir le *XAMPP Control Panel* et démarrer **Apache** et **MySQL** (boutons *Start*, ils passent au vert).
   - Linux : `sudo /opt/lampp/lampp start`.
3. Si MySQL ne démarre pas : un autre MySQL occupe le port 3306 (l'arrêter ou changer le port dans *Config*).

## 2. Récupérer le projet

```bash
git clone https://github.com/khadija986/site-parrainage.git
cd site-parrainage
git checkout develop
git checkout -b ma-page            # ta branche de travail, nommée comme ta page
```

Deux façons de l'exécuter, au choix.

### Option A : serveur intégré de PHP (la plus simple)

Depuis le dossier du projet :

```bash
# Windows (chemin XAMPP par défaut)
C:\xampp\php\php.exe -S localhost:8000
# Linux / macOS
/opt/lampp/bin/php -S localhost:8000
```

Ouvrir ensuite http://localhost:8000/ . Laisser la fenêtre ouverte. Ctrl+C pour arrêter.
Seul **MySQL** de XAMPP doit tourner (Apache n'est pas nécessaire dans ce cas).

### Option B : dossier `htdocs` d'Apache

Copier (ou lier) le projet dans `C:\xampp\htdocs\site-parrainage` (Linux : `/opt/lampp/htdocs/`), puis ouvrir http://localhost/site-parrainage/.
Attention : les liens commencent par `/connexion/...` dans `php/includes/auth.php`. Avec l'option B, le projet n'est pas à la racine : préfère l'option A, ou crée un hôte virtuel dont la racine est le projet.

## 3. Créer la base de données

Avec **phpMyAdmin** (http://localhost/phpmyadmin) :

1. *Nouvelle base de données* → nom **`site_de_parrainage`**, interclassement **`utf8mb4_general_ci`** → *Créer*.
2. Cliquer sur la base → onglet **Importer** → choisir `database/site_de_parrainage.sql` → *Exécuter*.
3. Importer ensuite `database/donnees-de-test.sql` (participants et admin **fictifs** pour travailler sans dépendre des autres pages).

En ligne de commande :

```bash
mysql -u root -e "CREATE DATABASE site_de_parrainage CHARACTER SET utf8mb4"
mysql -u root site_de_parrainage < database/site_de_parrainage.sql
mysql -u root site_de_parrainage < database/donnees-de-test.sql
```

Tables : `participant`, `association`, `administrateur`, `demande_mot_de_passe` (détail dans le README racine).
Pour repartir de zéro : supprimer la base et recommencer l'import.

## 4. Brancher PHP sur la base

```bash
cp php/config/db.example.php php/config/db.php      # Windows : copy
cp php/config/codes.example.php php/config/codes.php
```

`db.php` est prêt pour XAMPP (utilisateur `root`, mot de passe vide). Ces deux fichiers sont ignorés par git : ne les commite jamais.
Dans ton code PHP : `require __DIR__ . '/../../php/config/db.php'; $pdo = pdo();` (adapter le nombre de `../`).

## 5. Données de test

| Qui | Téléphone | Mot de passe |
|---|---|---|
| Admin | `770000000` | `admin1234` |
| Participants (parrains, marraines, filleuls INF/TR) | `771000001` … `774000003` | `test1234` |

**Se connecter sans passer par la page de connexion** (pour rester indépendant) : ouvrir
`http://localhost:8000/php/dev/connecter-test.php?participant=771000001` (participant) ou `?admin=770000000` (admin).
Cet outil n'accepte que `localhost` ; il sera supprimé avant la mise en ligne.

## Important : toujours passer par `http://`

N'ouvre **jamais** une page en double-cliquant sur un fichier (adresse qui commence par `file://`) : les adresses propres comme `/connexion/` n'ouvriraient pas `index.html` (Firefox afficherait la liste des fichiers), et PHP ne s'exécuterait pas. Lance toujours `php -S localhost:8000` (ou Apache) et ouvre `http://localhost:8000/…`.

## 6. Voir ton travail

1. Serveur lancé (option A) et MySQL démarré.
2. Ouvrir la page de ton dossier, par ex. http://localhost:8000/profil/ (adresse avec le `/` final, sans nom de fichier). Avec `php -S`, sans le `/` final la page s'affiche sans son style : Apache, lui, l'ajoute tout seul.
3. Envoyer le formulaire : il appelle ton script PHP ; regarde le résultat dans phpMyAdmin (onglet *Parcourir* de la table).
4. Les erreurs PHP s'affichent dans le terminal de `php -S` (option A) ou dans `xampp/apache/logs/error.log`.

## Problèmes fréquents

| Symptôme | Cause probable |
|---|---|
| `Connection refused` / `SQLSTATE[HY000] [2002]` | MySQL n'est pas démarré |
| `Unknown database 'site_de_parrainage'` | Base non créée (étape 3) |
| Accents cassés (`Ã©`) | Base ou connexion pas en `utf8mb4` |
| `Failed to open stream: php/config/db.php` | Étape 4 oubliée |
| La page PHP s'affiche en texte brut / se télécharge | Ouverte en `file://` ou hors serveur PHP : passer par `http://localhost:8000` |
| Upload de photo qui échoue | `upload_max_filesize` / `post_max_size` trop bas dans `php.ini` (XAMPP : *Config → php.ini*) ; dossier `uploads/` absent |
