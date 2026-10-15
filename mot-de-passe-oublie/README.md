# mot-de-passe-oublie : demande de réinitialisation

> Avant de commencer : `docs/php-pour-debutants.md`, `docs/xampp.md`, `docs/contrat-commun.md`.

## Ta mission

Quand quelqu'un oublie son mot de passe, il saisit son numéro : la page ouvre **WhatsApp vers l'admin** (déjà fait, côté navigateur). Toi, tu enregistres en plus la **demande en base**, pour que l'admin la voie dans sa page « Mots de passe ». Écris `mot-de-passe-oublie/php/demande.php`.

## Déjà fait

`index.html` (formulaire avec le numéro), `js/mot-de-passe-oublie.js` (ouvre WhatsApp avec le message prêt, puis envoie le numéro à `CONFIG.DEMANDE_MDP_ENDPOINT` si cette adresse est renseignée).

## Mode démo actuel (important)

Tant que `DEMANDE_MDP_ENDPOINT` est vide, la page ouvre WhatsApp mais **n'enregistre aucune demande** côté serveur.
**Remplacer cela par du vrai (PHP + base) est ton travail** : les étapes ci-dessous t'expliquent comment, dans l'ordre.

## Étapes

1. Environnement prêt (`docs/xampp.md`).
2. Crée `mot-de-passe-oublie/php/demande.php` :
   - accepte seulement `POST` ;
   - normalise le numéro en 9 chiffres (`docs/contrat-commun.md`) ;
   - si le numéro existe dans `participant` **et** qu'il n'y a pas déjà une demande non traitée pour lui, fais `INSERT INTO demande_mot_de_passe (telephone) VALUES (:tel)` ;
   - **réponds toujours la même chose** (`{"ok": true}`, code 200), que le numéro existe ou non (sinon on peut deviner qui est inscrit).
3. Dans `shared/js/config.js`, `DEMANDE_MDP_ENDPOINT` doit valoir `"php/demande.php"`. C'est la seule ligne partagée que tu as le droit de modifier (voir `docs/contrat-commun.md`).
4. Anti-abus : au plus 3 demandes par heure et par numéro (compte les lignes récentes avec `date_demande > NOW() - INTERVAL 1 HOUR`).
5. Teste dans phpMyAdmin : la table `demande_mot_de_passe` se remplit, une seule ligne en attente par numéro.

## Pièges

- Ne jamais envoyer ni afficher de mot de passe sur cette page : elle ne sert qu'à **prévenir** l'admin.
- Le JS envoie la demande « sans attendre » (`keepalive`) : même si ton PHP échoue, l'utilisateur a déjà WhatsApp ouvert. Écris l'erreur dans `error_log`, pas à l'écran.

## Mots à rechercher

`php json_encode response`, `php http_response_code`, `mysql INTERVAL HOUR`, `php rate limiting simple`.

## C'est terminé quand…

- [ ] Un numéro existant crée une ligne `traitee = 0` dans `demande_mot_de_passe` (visible dans phpMyAdmin).
- [ ] Un numéro inconnu ne crée rien mais reçoit la **même réponse**.
- [ ] Deux envois consécutifs ne créent pas deux demandes en attente.
- [ ] Tu n'as modifié que `mot-de-passe-oublie/` (+ ta ligne dans `shared/js/config.js`).

## Tu n'as pas à t'occuper de

Générer ou envoyer le mot de passe temporaire : c'est la page admin `gestion-mots-de-passe`.
