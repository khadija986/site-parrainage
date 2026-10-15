# resultats : résultats complets du tirage (page ADMIN)

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## Ta mission

Fournir à l'admin les résultats du tirage (complets ou partiels) : écrire `resultats/php/resultats.php` qui renvoie du JSON. **La page est réservée à l'admin** : mets `exigerAdmin();` en première ligne de ton PHP. Les participants ne voient pas cette liste : chacun voit uniquement son parrainage dans `espace/`.

## Déjà fait

`index.html` + `js/resultats.js` : affichage des familles (parrain + filleuls, photos ou initiales), onglets Tous / INF / TR, téléchargement CSV, impression PDF. Le JS affiche des **données de démonstration** tant que `CONFIG.RESULTATS_ENDPOINT` est vide.

## Mode démo actuel (important)

Tant que `RESULTATS_ENDPOINT` est vide, la page affiche des **résultats fictifs** (bandeau « Données de démonstration »).
**Remplacer cela par du vrai (PHP + base) est ton travail** : les étapes ci-dessous t'expliquent comment, dans l'ordre.

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
4. Mets nom, prénom, option et photo (le téléphone est permis puisque la page est admin). **Jamais** de mot de passe.
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
- [ ] Sans session admin : refus (401/403), aucune donnée.
- [ ] Aucun mot de passe dans la réponse (regarde l'onglet *Réseau* du navigateur).
- [ ] Tu n'as modifié que `resultats/`.
