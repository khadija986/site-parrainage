// Accueil de l'utilisateur connecté : il ne voit que SON parrainage.
// Démo (CONFIG.DEMO.espace) : ajouter ?demo=avant, ?demo=filleul ou ?demo=parrain à l'adresse.
const LIBELLES_OPTION = { INF: "Informatique", TR: "Télécoms & Réseaux" };
const ICONE_WHATSAPP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.2-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>';

const CORRESPONDANTS_DEMO = {
  parrain: { prenom: "Mariama", nom: "Sy", photo: "", telephone: "771234567", sous_departement: "INF", role: "marraine" },
  filleuls: [
    { prenom: "Moussa", nom: "Ndiaye", photo: "", telephone: "771234568", sous_departement: "INF", role: "filleul" },
    { prenom: "Khady", nom: "Ba", photo: "", telephone: "771234569", sous_departement: "INF", role: "filleul" },
  ],
};

function donneesDemo() {
  const etat = new URLSearchParams(window.location.search).get("demo") || "avant";
  const moi = { ...UTILISATEUR_DEMO, sous_departement: "INF" };
  if (etat === "filleul") return { ...moi, role: "filleul", tirage_effectue: true, parrain: CORRESPONDANTS_DEMO.parrain };
  if (etat === "parrain") return { ...moi, role: "parrain", tirage_effectue: true, filleuls: CORRESPONDANTS_DEMO.filleuls };
  return { ...moi, role: "filleul", tirage_effectue: false };
}

async function chargerDonnees() {
  if (CONFIG.DEMO.espace || CONFIG.ESPACE_ENDPOINT === "") return donneesDemo();
  const reponse = await fetch(CONFIG.ESPACE_ENDPOINT, { credentials: "same-origin" });
  if (!reponse.ok) throw new Error("HTTP " + reponse.status);
  return reponse.json();
}

function creerPhoto(personne) {
  if (personne.photo) {
    const image = document.createElement("img");
    image.className = "photo-ronde";
    image.src = personne.photo;
    image.alt = "Photo de " + personne.prenom + " " + personne.nom;
    return image;
  }
  const pastille = document.createElement("span");
  pastille.className = "photo-ronde";
  pastille.textContent = initialesDe(personne);
  pastille.setAttribute("aria-hidden", "true");
  return pastille;
}

function creerCarte(personne, moi) {
  const carte = document.createElement("article");
  carte.className = "carte personne-carte";

  const nom = document.createElement("h3");
  nom.textContent = personne.prenom + " " + personne.nom;
  const option = document.createElement("p");
  option.className = "badge";
  option.textContent = "Option " + LIBELLES_OPTION[personne.sous_departement];

  const message = "Bonjour " + personne.prenom + ", c'est " + moi.prenom + " ! On a été mis en relation par le parrainage.";
  const lien = document.createElement("a");
  lien.className = "bouton whatsapp";
  lien.href = "https://wa.me/" + telephoneInternational(personne.telephone) + "?text=" + encodeURIComponent(message);
  lien.target = "_blank";
  lien.rel = "noopener";
  lien.insertAdjacentHTML("afterbegin", ICONE_WHATSAPP);
  lien.append("Écrire sur WhatsApp");

  carte.append(creerPhoto(personne), nom, option, lien);
  return carte;
}

function afficherListe(titre, personnes, moi) {
  const sousTitre = document.createElement("h2");
  sousTitre.className = "sous-titre";
  sousTitre.textContent = titre;
  const liste = document.createElement("div");
  liste.className = "liste-personnes" + (personnes.length > 1 ? " plusieurs" : "");
  liste.append(...personnes.map((personne) => creerCarte(personne, moi)));
  document.getElementById("contenu").replaceChildren(sousTitre, liste);
}

function afficher(donnees) {
  const contenu = document.getElementById("contenu");
  document.getElementById("titre").textContent = "Bonjour " + donnees.prenom;
  const intro = document.getElementById("sous-titre");

  if (!donnees.tirage_effectue) {
    intro.textContent = "Bienvenue dans ton espace.";
    contenu.replaceChildren(document.getElementById("modele-attente").content.cloneNode(true));
    return;
  }
  if (donnees.role === "filleul") {
    const feminin = donnees.parrain.role === "marraine";
    intro.textContent = "Voici la personne qui va t'accompagner.";
    afficherListe(feminin ? "Ta marraine" : "Ton parrain", [donnees.parrain], donnees);
    return;
  }
  const filleuls = donnees.filleuls;
  intro.textContent = filleuls.length > 0 ? "Voici les personnes que tu accompagnes." : "Merci de ton engagement.";
  if (filleuls.length === 0) {
    contenu.replaceChildren();
    document.getElementById("message").textContent = "Aucun filleul cette année : le hasard ne t'en a pas attribué.";
    return;
  }
  afficherListe(filleuls.length > 1 ? "Tes filleuls" : "Ton filleul", filleuls, donnees);
}

async function demarrer() {
  activerMenuProfil();
  try {
    const donnees = await chargerDonnees();
    remplirAvatar(donnees);
    afficher(donnees);
  } catch (erreur) {
    console.error("Espace non chargé :", erreur);
    document.getElementById("message").textContent = "Impossible de charger ton espace pour le moment. Réessaie plus tard.";
  }
}

demarrer();
