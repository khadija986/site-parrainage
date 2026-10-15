// Page admin des mots de passe oubliés.
// Démo : les demandes sont gardées dans le navigateur (localStorage). Partie 2 (PHP) : voir README.
const CLE_STOCKAGE = "demandes_mdp";
const ALPHABET_MDP = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sans caractères ambigus (0/O, 1/l/I)
const LONGUEUR_MDP = 8;

const $ = (id) => document.getElementById(id);
let demandes = chargerDemandes();

function chargerDemandes() {
  try {
    return JSON.parse(localStorage.getItem(CLE_STOCKAGE) || "[]");
  } catch (erreur) {
    console.error("Demandes illisibles, remise à zéro :", erreur);
    return [];
  }
}

function sauvegarder() {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(demandes));
}

function genererMotDePasse() {
  const tirage = crypto.getRandomValues(new Uint32Array(LONGUEUR_MDP));
  return Array.from(tirage, (n) => ALPHABET_MDP[n % ALPHABET_MDP.length]).join("");
}

function messageWhatsApp(motDePasse) {
  const lienConnexion = new URL("../../connexion/html/connexion.html", window.location.href).href;
  return "Bonjour, ton mot de passe du site de parrainage a été réinitialisé.\n"
    + "Mot de passe temporaire : " + motDePasse + "\n"
    + "Connecte-toi ici : " + lienConnexion + "\n"
    + "Pense à le changer dans ton profil.";
}

function modifier(id, changements) {
  demandes = demandes.map((demande) => (demande.id === id ? { ...demande, ...changements } : demande));
  sauvegarder();
  afficher();
}

function envoyerWhatsApp(demande, motDePasse) {
  const lien = "https://wa.me/" + telephoneInternational(demande.telephone) + "?text=" + encodeURIComponent(messageWhatsApp(motDePasse));
  window.open(lien, "_blank", "noopener");
  // TODO PHP : enregistrer password_hash($motDePasse), doit_changer_mdp = 1, et marquer la demande comme traitée.
  modifier(demande.id, { traitee: true });
}

function creerBouton(texte, classe, action) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  if (classe) bouton.className = classe;
  bouton.textContent = texte;
  bouton.addEventListener("click", action);
  return bouton;
}

function creerCarte(demande) {
  const carte = document.createElement("div");
  carte.className = "demande";

  const telephone = document.createElement("p");
  telephone.textContent = "📞 " + demande.telephone;
  const date = document.createElement("p");
  date.textContent = "Demandé le " + new Date(demande.date).toLocaleString("fr-FR");
  const statut = document.createElement("p");
  statut.className = "statut" + (demande.traitee ? " fait" : "");
  statut.textContent = demande.traitee ? "✔ Mot de passe envoyé" : "⏳ En attente";

  const etiquette = document.createElement("label");
  etiquette.textContent = "Mot de passe temporaire";
  const champ = document.createElement("input");
  champ.type = "text";
  champ.value = demande.motDePasse;
  champ.maxLength = 30;
  champ.setAttribute("aria-label", "Mot de passe temporaire");
  champ.addEventListener("change", () => { demande.motDePasse = champ.value.trim(); sauvegarder(); });
  etiquette.append(champ);

  const actions = document.createElement("div");
  actions.className = "actions";
  actions.append(
    creerBouton("Générer", "", () => { champ.value = genererMotDePasse(); demande.motDePasse = champ.value; sauvegarder(); }),
    creerBouton(demande.traitee ? "Renvoyer sur WhatsApp" : "Envoyer sur WhatsApp", "", () => {
      const motDePasse = champ.value.trim();
      if (motDePasse.length < FORMULAIRE.MOT_DE_PASSE_MIN) {
        $("erreur").textContent = "Le mot de passe temporaire doit avoir au moins " + FORMULAIRE.MOT_DE_PASSE_MIN + " caractères.";
        return;
      }
      $("erreur").textContent = "";
      envoyerWhatsApp(demande, motDePasse);
    }),
    creerBouton("Supprimer", "supprimer", () => {
      if (confirm("Supprimer cette demande ?")) {
        demandes = demandes.filter((autre) => autre.id !== demande.id);
        sauvegarder();
        afficher();
      }
    })
  );

  carte.append(telephone, date, statut, etiquette, actions);
  return carte;
}

function afficher() {
  const enAttente = demandes.filter((demande) => !demande.traitee);
  $("attente").textContent = enAttente.length;
  $("traitees").textContent = demandes.length - enAttente.length;

  if (demandes.length === 0) {
    const vide = document.createElement("p");
    vide.textContent = "Aucune demande pour le moment.";
    $("demandes").replaceChildren(vide);
    return;
  }
  const triees = [...enAttente, ...demandes.filter((demande) => demande.traitee)];
  $("demandes").replaceChildren(...triees.map(creerCarte));
}

$("ajouter").addEventListener("click", () => {
  const telephone = $("telephone").value.trim();
  if (!telephoneValide(telephone)) {
    $("erreur").textContent = "Numéro invalide. Exemple : 77 123 45 67";
    return;
  }
  $("erreur").textContent = "";
  demandes = [{ id: Date.now(), telephone, date: new Date().toISOString(), motDePasse: genererMotDePasse(), traitee: false }, ...demandes];
  sauvegarder();
  $("telephone").value = "";
  afficher();
});

afficher();
