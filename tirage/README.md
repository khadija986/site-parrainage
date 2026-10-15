# tirage : le tirage au sort en direct (page admin)

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`. C'est la page la plus délicate : prends le temps de lire **les règles**.

## Les règles du parrainage (à connaître par cœur)

1. **Même option** : un filleul INF reçoit un parrain INF, un filleul TR un parrain TR. Deux manches : INF puis TR.
2. **Chaque filleul reçoit exactement un parrain** (clé primaire de `association.telephone_filleul`).
3. **Un parrain peut avoir plusieurs filleuls ou aucun**, mais la répartition doit rester **équilibrée** : qu'un parrain ait 3 filleuls pendant qu'un autre n'en a qu'un n'est **pas conseillé**. Écart maximal visé : 1 filleul.
4. **L'admin choisit à l'avance** (page `gestion-utilisateurs`, case « peut recevoir plusieurs filleuls », colonne `accepte_plusieurs`) **qui peut en avoir plusieurs**, pour ne pas confier plusieurs filleuls à quelqu'un qui ne s'en occupera pas. Un parrain à `accepte_plusieurs = 0` reçoit **au maximum un** filleul.
5. **Le hasard décide seul** : personne ne choisit ni ne change une association. **Pas de `if` pour choisir le parrain** (cahier des charges). Le choix est fait **par le serveur (PHP/SQL)** ; la page ne fait qu'afficher l'animation.

Ces règles sont rappelées dans l'encadré « Règles du tirage » de la page (déjà fait).

## Déjà fait

`html/tirage.html` + `css/` + `js/tirage.js` : choix de la manche, carte filleul → carte parrain, animation de suspense (photos de parrains qui défilent), barre de progression, liste des associations, encadré des règles. Le JS fonctionne **en démonstration** avec de fausses données ; ses fonctions `obtenirFilleul()` et `obtenirParrain()` sont les seuls endroits à brancher sur PHP.

## Ta mission

Écrire `tirage/php/api.php` (protégé par `exigerAdmin();`) et brancher le JS dessus. Session admin de test : `/php/dev/connecter-test.php?admin=770000000`.

## Étapes (dans cet ordre)

1. **`verifier`** (GET `?action=verifier&option=INF`) : le tirage est-il possible ? Il faut, pour chaque option qui a des filleuls : au moins un parrain/marraine. Si tous les parrains sont à `accepte_plusieurs = 0` et qu'il y a plus de filleuls que de parrains, le tirage est **impossible** : renvoie un message clair (« Il manque X places : autorise plus de filleuls pour certains parrains »). Affiche ce résultat avant de lancer.
2. **`piocher`** (POST `option`) : un filleul au hasard parmi ceux **sans association** :
   ```sql
   SELECT f.telephone, f.nom, f.prenom, f.photo
   FROM participant f
   LEFT JOIN association a ON a.telephone_filleul = f.telephone
   WHERE f.role = 'filleul' AND f.sous_departement = :option AND a.telephone_filleul IS NULL
   ORDER BY RAND() LIMIT 1
   ```
3. **`attribuer`** (POST `filleul`) : choisit le parrain **et l'enregistre dans la même requête transactionnelle**, sans `if` de choix :
   ```sql
   SELECT p.telephone, p.nom, p.prenom, p.photo
   FROM participant p
   LEFT JOIN association a ON a.telephone_parrain = p.telephone
   WHERE p.sous_departement = :option AND p.role IN ('parrain', 'marraine')
   GROUP BY p.telephone, p.nom, p.prenom, p.photo, p.accepte_plusieurs
   HAVING COUNT(a.telephone_filleul) < 1 + p.accepte_plusieurs * 1000
   ORDER BY COUNT(a.telephone_filleul), RAND()
   LIMIT 1
   ```
   Comment ça marche : on garde les parrains qui ont encore de la place (`accepte_plusieurs = 0` → capacité 1 ; sinon quasi illimitée, sans écrire de `if`), on les classe par **nombre de filleuls déjà reçus** (les moins servis d'abord = équilibre), puis `RAND()` tranche **au hasard entre ex æquo**. Ensuite : `INSERT INTO association (telephone_filleul, telephone_parrain) VALUES (...)` ; `date_tirage` se remplit toute seule. Fais les deux dans une **transaction** (`beginTransaction` / `commit`) pour qu'un double clic ne crée pas deux associations.
4. **Pause / reprise** : le tirage est déjà « filleul par filleul » (un clic = un tirage). Ajoute un bouton **Pause** qui bloque le bouton « Filleul suivant » et un état `en_pause` (en session ou en base) pour que l'écran reste cohérent si on recharge la page.
5. **`reinitialiser`** (POST) : `DELETE FROM association` (ou seulement pour une option), derrière une **confirmation** en deux étapes (`confirm()` dans le JS **et** un champ `confirmation=OUI` vérifié côté PHP). Jeton CSRF obligatoire.
6. **`etat`** (GET) : associations déjà faites (pour reprendre un tirage interrompu : au rechargement, la page affiche la liste existante et le compteur `tirés / total`).
7. **Brancher le JS** : remplace le contenu de `obtenirFilleul()` (appel `piocher`) et `obtenirParrain(filleul)` (appel `attribuer`) par des `fetch`. Garde l'animation telle quelle : les photos qui défilent sont du décor, le vrai parrain vient du serveur. Supprime l'objet `DONNEES` (fausses données) à la fin.
8. **Fin de manche** : quand il n'y a plus de filleul sans parrain, la page propose la manche suivante (INF → TR) ; à la fin des deux, indiquer que les résultats sont publics (`resultats/`).

## Pièges

- **Ne jamais choisir le parrain dans le navigateur** : seul PHP/SQL tire au sort.
- `ORDER BY RAND()` est suffisant pour des dizaines de personnes.
- Si `attribuer` ne renvoie aucune ligne : tout le monde est « plein » ; renvoie une erreur claire et ne casse pas la manche.
- Un seul admin doit tirer à la fois (pas deux onglets) : la transaction et la clé primaire protègent les données, mais préviens l'admin.

## Mots à rechercher

`mysql ORDER BY RAND`, `mysql GROUP BY HAVING exemple`, `php PDO transaction beginTransaction commit rollBack`, `javascript fetch async await`, `mysql LEFT JOIN IS NULL`.

## C'est terminé quand…

- [ ] Avec les données de test, chaque filleul INF reçoit un parrain **INF** et chaque filleul TR un parrain **TR** (vérifie dans phpMyAdmin).
- [ ] Les parrains reçoivent **à 1 près** le même nombre de filleuls ; `771000003` (`accepte_plusieurs = 0`) n'en a **jamais plus d'un**.
- [ ] Aucune association n'existe en double, aucun filleul sans parrain en fin de manche.
- [ ] Relancer le tirage plusieurs fois (après `reinitialiser`) donne des résultats différents (hasard réel).
- [ ] `verifier` bloque proprement un tirage impossible.
- [ ] Remise à zéro avec double confirmation ; pause fonctionnelle.
- [ ] Sans session admin : refus.
- [ ] Tu n'as modifié que `tirage/`.
