# resultats : page publique des résultats du tirage

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## Ta mission

Fournir au navigateur les résultats **une fois le tirage terminé** : écrire `resultats/php/resultats.php` qui renvoie du JSON. La page est publique (aucune connexion).

## Déjà fait

`index.html` + `js/resultats.js` : affichage des familles (parrain + filleuls, photos ou initiales), onglets Tous / INF / TR, téléchargement CSV, impression PDF. Le JS affiche des **données de démonstration** tant que `CONFIG.RESULTATS_ENDPOINT` est vide.

## Format JSON à produire

```json
{
  "termine": true,
  "parrains": [
    { "nom": "Diop", "prenom": "Awa", "sous_departement": "INF", "photo": "uploads/abc.jpg",
      "filleuls": [ { "nom": "Ndiaye", "prenom": "Moussa", "photo": "uploads/def.jpg" } ] }
  ]
}
```

Quand le tirage n'est pas terminé : `{"termine": false, "parrains": []}`.

## Étapes

1. Environnement prêt. Pour tester sans attendre le vrai tirage, insère à la main quelques lignes dans `association` (phpMyAdmin) avec des numéros de `donnees-de-test.sql`.
2. **Définir « tirage terminé »** : tous les filleuls ont une association. Requête : le nombre de filleuls sans ligne dans `association` vaut 0 **et** il y a au moins un filleul.
   ```sql
   SELECT COUNT(*) FROM participant f
   LEFT JOIN association a ON a.telephone_filleul = f.telephone
   WHERE f.role = 'filleul' AND a.telephone_filleul IS NULL;
   ```
3. Si terminé : récupère tous les parrains/marraines (`role IN ('parrain','marraine')`) **avec** leurs filleuls (`LEFT JOIN`, parce qu'un parrain peut n'avoir aucun filleul). Construis le tableau PHP, puis `echo json_encode(...)` avec l'en-tête `Content-Type: application/json`.
4. **Ne mets dans le JSON que** nom, prénom, option et photo. **Jamais** de téléphone, de mot de passe ni de rôle détaillé.
5. Branche `RESULTATS_ENDPOINT` dans `shared/js/config.js` sur `"php/resultats.php"` (une seule ligne, voir l'exception dans `docs/contrat-commun.md`) et vérifie que la bande « Données de démonstration » disparaît.
6. (Option) Téléchargement côté serveur : un export CSV en PHP avec `fputcsv` si on veut mieux que le CSV du navigateur.

## Pièges

- Un parrain sans filleul doit apparaître avec `"filleuls": []`.
- Les noms viennent des utilisateurs : le JS les affiche avec `textContent` (sûr) ; si tu les affiches en PHP/HTML, utilise `htmlspecialchars`.
- Évite une requête par parrain (lenteur) : une seule requête avec jointure, puis regroupe en PHP.

## Mots à rechercher

`mysql LEFT JOIN exemple`, `php json_encode tableau`, `php grouper résultats par clé`, `php fputcsv`.

## C'est terminé quand…

- [ ] Sans tirage terminé : `{"termine": false, ...}` et la page affiche « Le tirage n'est pas encore terminé ».
- [ ] Avec des associations pour tous les filleuls : la page affiche les vraies familles, boutons CSV et impression actifs.
- [ ] Aucun téléphone ni mot de passe dans la réponse (regarde l'onglet *Réseau* du navigateur).
- [ ] Tu n'as modifié que `resultats/`.
