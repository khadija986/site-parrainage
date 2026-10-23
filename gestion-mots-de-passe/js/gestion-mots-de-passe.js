// Page admin des mots de passe oubliés.
// Démo : les demandes sont gardées dans le navigateur (localStorage). Partie 2 (PHP) : voir README.
const API = "./api.php";
const ALPHABET_MDP =
  "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LONGUEUR_MDP = 8;
const ICONE_TELEPHONE = `
<svg class="icone-admin" viewBox="0 0 24 24" fill="none"
stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round"
aria-hidden="true">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2
  19.79 19.79 0 0 1-8.63-3.07
  19.5 19.5 0 0 1-6-6
  19.79 19.79 0 0 1-3.07-8.67
  A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2
  1.72 12.84 12.84 0 0 0 .7 2.81
  2 2 0 0 1-.45 2.11L8.09 9.91
  a16 16 0 0 0 6 6l1.27-1.27
  a2 2 0 0 1 2.11-.45
  12.84 12.84 0 0 0 2.81.7
  A2 2 0 0 1 22 16.92z"/>
</svg>`;
const $ = (id) => document.getElementById(id);
let demandes = [];
let chargement = false;
// Communiquer avec api.php
async function appelerAPI(action, donnees = null) {
  const options = donnees
    ? {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(donnees)
      }
    : {};
  const reponse = await fetch(
    `${API}?action=${encodeURIComponent(action)}`,
    options
  );
  let resultat;
  try {
    resultat = await reponse.json();
  } catch {
    throw new Error(
      "Le serveur n'a pas renvoyé une réponse valide. Vérifie api.php."
    );
  }
  if (!reponse.ok || !resultat.ok) {
    throw new Error(
      resultat.message || "Une erreur est survenue."
    );
  }
  return resultat;
}
// Afficher les erreurs dans l'interface
function afficherErreur(message = "") {
  const erreur = $("erreur");
  if (erreur) {
    erreur.textContent = message;
  }
}
// Générer un mot de passe aléatoire
function genererMotDePasse() {
  if (!window.crypto || !window.crypto.getRandomValues) {
    throw new Error(
      "La génération sécurisée des mots de passe n'est pas disponible."
    );
  }
  const tirage = crypto.getRandomValues(
    new Uint32Array(LONGUEUR_MDP)
  );
  return Array.from(
    tirage,
    (n) => ALPHABET_MDP[n % ALPHABET_MDP.length]
  ).join("");
}
// Préparer le message WhatsApp
function messageWhatsApp(motDePasse) {
  const lienConnexion = new URL(
    "../connexion/",
    window.location.href
  ).href;
  return (
    "Coucouuu ça va??, ton mot de passe du site de parrainage a été réinitialisé.\n" +
    "Mot de passe temporaire : " + motDePasse + "\n" +
    "Connecte-toi ici : " + lienConnexion + "\n" +
    "Pense à le changer dans ton profil."
  );
}
// Convertir le numéro sénégalais au format WhatsApp
function telephoneInternational(telephone) {
  let numero = String(telephone || "").replace(/\D/g, "");
  if (numero.startsWith("00")) {
    numero = numero.slice(2);
  }
  if (numero.length === 9 && /^[73]/.test(numero)) {
    numero = "221" + numero;
  }
  return numero;
}
// Recharger les demandes depuis MySQL
async function chargerDemandes() {
  if (chargement) return;
  chargement = true;
  try {
    const resultat = await appelerAPI("liste");
    demandes = Array.isArray(resultat.demandes)
      ? resultat.demandes
      : [];
    afficher();
    afficherErreur();
  } catch (erreur) {
    afficherErreur(erreur.message);
  } finally {
    chargement = false;
  }
}
// Créer un bouton
function creerBouton(texte, classe, action) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.textContent = texte;
  if (classe) {
    bouton.className = classe;
  }
  bouton.addEventListener("click", action);
  return bouton;
}
// Envoyer sur WhatsApp sans quitter la page de gestion
async function envoyerWhatsApp(demande, motDePasse) {
  if (motDePasse.length < 8) {
    afficherErreur(
      "Le mot de passe doit contenir au moins 8 caractères."
    );
    return;
  }
  const numero = telephoneInternational(demande.telephone);
  if (!numero) {
    afficherErreur("Numéro WhatsApp invalide.");
    return;
  }
  // Ouvrir un nouvel onglet pendant le clic de l'administrateur.
  // La page de gestion restera dans l'onglet d'origine.
  const fenetre = window.open("about:blank", "_blank");
  if (!fenetre) {
    afficherErreur(
      "Le navigateur a bloqué le nouvel onglet. Autorise les fenêtres pop-up pour ce site, puis réessaie."
    );
    return;
  }
  try {
    afficherErreur();
    // Enregistrer le nouveau mot de passe dans la base.
    await appelerAPI("traiter", {
      id: demande.id,
      motDePasse
    });
    // Préparer le lien WhatsApp.
    const lien =
      "https://wa.me/" +
      numero +
      "?text=" +
      encodeURIComponent(messageWhatsApp(motDePasse));
    // Ouvrir WhatsApp dans le nouvel onglet.
    fenetre.location.href = lien;
    // Actualiser les demandes sans rediriger la page de gestion.
    await chargerDemandes();
  } catch (erreur) {
    fenetre.close();
    afficherErreur(erreur.message);
  }
}
// Créer la carte d'une demande
function creerCarte(demande) {
  const carte = document.createElement("div");
  carte.className = "demande";
  const telephone = document.createElement("p");
  telephone.insertAdjacentHTML(
    "afterbegin",
    ICONE_TELEPHONE
  );
  telephone.append(" " + demande.telephone);
  const date = document.createElement("p");
  const dateDemande = new Date(demande.date);
  date.textContent =
    "Demandé le " +
    (
      Number.isNaN(dateDemande.getTime())
        ? demande.date
        : dateDemande.toLocaleString("fr-FR")
    );
  const statut = document.createElement("p");
  statut.className =
    "statut" + (demande.traitee ? " fait" : "");
  statut.textContent = demande.traitee
    ? "Mot de passe envoyé"
    : "En attente";
  const etiquette = document.createElement("label");
  etiquette.textContent = "Mot de passe temporaire";
  const champ = document.createElement("input");
  champ.type = "text";
  champ.autocomplete = "new-password";
  champ.maxLength = 128;
  champ.placeholder = "Générer un mot de passe";
  champ.setAttribute(
    "aria-label",
    "Mot de passe temporaire"
  );
  // Le mot de passe n'est pas conservé dans localStorage.
  champ.value = "";
  etiquette.append(champ);
  const actions = document.createElement("div");
  actions.className = "actions";
  // Bouton Générer : disponible même si la demande est traitée.
  const boutonGenerer = creerBouton(
    "Générer",
    "",
    () => {
      try {
        champ.value = genererMotDePasse();
        afficherErreur();
      } catch (erreur) {
        afficherErreur(erreur.message);
      }
    }
  );
  // Bouton Envoyer / Renvoyer sur WhatsApp.
  const boutonEnvoyer = creerBouton(
    demande.traitee
      ? "Renvoyer sur WhatsApp"
      : "Envoyer sur WhatsApp",
    "",
    async () => {
      const motDePasse = champ.value.trim();
      if (motDePasse.length < 8) {
        afficherErreur(
          "Clique d'abord sur Générer, puis vérifie le mot de passe."
        );
        return;
      }
      boutonEnvoyer.disabled = true;
      boutonGenerer.disabled = true;
      try {
        await envoyerWhatsApp(demande, motDePasse);
      } finally {
        boutonEnvoyer.disabled = false;
        boutonGenerer.disabled = false;
      }
    }
  );
  // Confirmer manuellement après avoir envoyé le message WhatsApp.
  const boutonConfirmer = creerBouton(
    "Confirmer l'envoi effectué",
    "",
    async () => {
      boutonConfirmer.disabled = true;
      try {
        await appelerAPI("confirmer", {
          id: demande.id
        });
        afficherErreur();
        await chargerDemandes();
      } catch (erreur) {
        afficherErreur(erreur.message);
      } finally {
        boutonConfirmer.disabled = false;
      }
    }
  );
  // Supprimer une demande
  const boutonSupprimer = creerBouton(
    "Supprimer",
    "supprimer",
    async () => {
      if (!confirm("Supprimer cette demande ?")) {
        return;
      }
      try {
        await appelerAPI("supprimer", {
          id: demande.id
        });
        afficherErreur();
        await chargerDemandes();
      } catch (erreur) {
        afficherErreur(erreur.message);
      }
    }
  );
  actions.append(
    boutonGenerer,
    boutonEnvoyer,
    boutonConfirmer,
    boutonSupprimer
  );
  carte.append(
    telephone,
    date,
    statut,
    etiquette,
    actions
  );
  return carte;
}
// Mettre à jour les compteurs et les cartes
function afficher() {
  const enAttente = demandes.filter(
    (demande) => !demande.traitee
  );
  const traitees = demandes.filter(
    (demande) => demande.traitee
  );
  $("attente").textContent = enAttente.length;
  $("traitees").textContent = traitees.length;
  if (demandes.length === 0) {
    const vide = document.createElement("p");
    vide.textContent = "Aucune demande pour le moment.";
    $("demandes").replaceChildren(vide);
    return;
  }
  const triees = [...enAttente, ...traitees];
  $("demandes").replaceChildren(
    ...triees.map(creerCarte)
  );
}
// Ajouter une demande depuis l'espace administrateur
$("ajouter").addEventListener("click", async () => {
  const telephone = $("telephone").value.trim();
  if (typeof telephoneValide === "function") {
    if (!telephoneValide(telephone)) {
      afficherErreur(
        "Numéro invalide. Exemple : 77 123 45 67"
      );
      return;
    }
  } else if (!/^[0-9+().\s-]{8,20}$/.test(telephone)) {
    afficherErreur(
      "Numéro invalide. Exemple : 77 123 45 67"
    );
    return;
  }
  try {
    await appelerAPI("ajouter", { telephone });
    $("telephone").value = "";
    afficherErreur();
    await chargerDemandes();
  } catch (erreur) {
    afficherErreur(erreur.message);
  }
});
// Actualiser la liste quand l'administrateur revient sur l'onglet.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    chargerDemandes();
  }
});
// Chargement initial
chargerDemandes();