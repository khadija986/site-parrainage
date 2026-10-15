const LIBELLES_OPTION = { INF: "Informatique", TR: "Télécoms & Réseaux" };

// Données de démonstration, utilisées tant que CONFIG.RESULTATS_ENDPOINT est vide.
const RESULTATS_DEMO = {
  termine: true,
  parrains: [
    { nom: "Diop", prenom: "Awa", sous_departement: "INF", photo: "", filleuls: [{ nom: "Ndiaye", prenom: "Moussa", photo: "" }, { nom: "Fall", prenom: "Aminata", photo: "" }] },
    { nom: "Sow", prenom: "Ibrahima", sous_departement: "INF", photo: "", filleuls: [{ nom: "Ba", prenom: "Khady", photo: "" }] },
    { nom: "Gueye", prenom: "Fatou", sous_departement: "TR", photo: "", filleuls: [{ nom: "Sarr", prenom: "Cheikh", photo: "" }] },
    { nom: "Diallo", prenom: "Mamadou", sous_departement: "TR", photo: "", filleuls: [] },
  ],
};

const etat = { donnees: null, option: "TOUS" };
const liste = document.getElementById("liste");
const message = document.getElementById("message");
const boutonCsv = document.getElementById("btn-csv");
const boutonImprimer = document.getElementById("btn-imprimer");

function initiales(personne) {
  return (personne.prenom.charAt(0) + personne.nom.charAt(0)).toUpperCase();
}

function creerAvatar(personne) {
  if (personne.photo) {
    const image = document.createElement("img");
    image.className = "avatar";
    image.src = personne.photo;
    image.alt = "Photo de " + personne.prenom + " " + personne.nom;
    return image;
  }
  const pastille = document.createElement("span");
  pastille.className = "avatar";
  pastille.textContent = initiales(personne);
  pastille.setAttribute("aria-hidden", "true");
  return pastille;
}

function creerFamille(parrain) {
  const carte = document.createElement("article");
  carte.className = "famille";

  const entete = document.createElement("div");
  entete.className = "parrain";
  const identite = document.createElement("div");
  const nom = document.createElement("strong");
  nom.textContent = parrain.prenom + " " + parrain.nom;
  const detail = document.createElement("small");
  detail.textContent = "Parrain · " + LIBELLES_OPTION[parrain.sous_departement] + " · " + parrain.filleuls.length + " filleul(s)";
  identite.append(nom, detail);
  entete.append(creerAvatar(parrain), identite);

  const filleuls = document.createElement("ul");
  filleuls.className = "filleuls";
  parrain.filleuls.forEach(function (filleul) {
    const ligne = document.createElement("li");
    ligne.className = "filleul";
    const texte = document.createElement("span");
    texte.textContent = filleul.prenom + " " + filleul.nom;
    ligne.append(creerAvatar(filleul), texte);
    filleuls.append(ligne);
  });
  if (parrain.filleuls.length === 0) {
    const vide = document.createElement("li");
    vide.className = "aucun";
    vide.textContent = "Pas de filleul cette année.";
    filleuls.append(vide);
  }

  carte.append(entete, filleuls);
  return carte;
}

function parrainsAffiches() {
  return etat.donnees.parrains.filter(function (parrain) {
    return etat.option === "TOUS" || parrain.sous_departement === etat.option;
  });
}

function afficher() {
  liste.replaceChildren(...parrainsAffiches().map(creerFamille));
}

// Évite qu'une cellule commençant par = + - @ soit interprétée comme une formule dans Excel
function celluleCsv(valeur) {
  const texte = /^[=+\-@]/.test(valeur) ? "'" + valeur : valeur;
  return '"' + texte.replace(/"/g, '""') + '"';
}

function telechargerCsv() {
  const lignes = [["Option", "Parrain", "Filleul"]];   // page admin : export complet
  parrainsAffiches().forEach(function (parrain) {
    const nomParrain = parrain.prenom + " " + parrain.nom;
    if (parrain.filleuls.length === 0) lignes.push([parrain.sous_departement, nomParrain, ""]);
    parrain.filleuls.forEach(function (filleul) {
      lignes.push([parrain.sous_departement, nomParrain, filleul.prenom + " " + filleul.nom]);
    });
  });
  const contenu = "﻿" + lignes.map(function (ligne) { return ligne.map(celluleCsv).join(";"); }).join("\r\n");
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(new Blob([contenu], { type: "text/csv;charset=utf-8" }));
  lien.download = "resultats-parrainage.csv";
  lien.click();
  URL.revokeObjectURL(lien.href);
}

function activerOutils(actif) {
  boutonCsv.disabled = !actif;
  boutonImprimer.disabled = !actif;
}

async function chargerDonnees() {
  if (CONFIG.RESULTATS_ENDPOINT === "") {
    document.getElementById("demo").hidden = false;
    return RESULTATS_DEMO;
  }
  const reponse = await fetch(CONFIG.RESULTATS_ENDPOINT);
  if (!reponse.ok) throw new Error("HTTP " + reponse.status);
  return reponse.json();
}

async function demarrer() {
  activerOutils(false);
  try {
    etat.donnees = await chargerDonnees();
  } catch (erreur) {
    console.error("Résultats non chargés :", erreur);
    message.textContent = "Impossible de charger les résultats pour le moment.";
    return;
  }
  if (!etat.donnees.termine) {
    message.textContent = "Le tirage n'est pas encore terminé. Reviens après la cérémonie !";
    return;
  }
  activerOutils(true);
  afficher();
}

document.querySelectorAll(".onglet").forEach(function (onglet) {
  onglet.addEventListener("click", function () {
    etat.option = onglet.dataset.option;
    document.querySelectorAll(".onglet").forEach(function (autre) {
      const actif = autre === onglet;
      autre.classList.toggle("actif", actif);
      autre.setAttribute("aria-pressed", String(actif));
    });
    if (etat.donnees && etat.donnees.termine) afficher();
  });
});
boutonCsv.addEventListener("click", telechargerCsv);
boutonImprimer.addEventListener("click", function () { window.print(); });

demarrer();
