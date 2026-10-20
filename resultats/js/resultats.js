const LIBELLES_OPTION = {
  INF: "Informatique",
  TR: "Télécoms & Réseaux",
};

const etat = {
  donnees: null,
  option: "TOUS",
};

const liste = document.getElementById("liste");
const message = document.getElementById("message");
const boutonCsv = document.getElementById("btn-csv");
const boutonImprimer = document.getElementById("btn-imprimer");

// Récupère les données transmises par PHP et les regroupe par parrain.
function organiserResultats(lignes) {
  // Si PHP transmet déjà les données regroupées, on les conserve.
  if (!Array.isArray(lignes)) {
    return lignes;
  }

  const parrains = new Map();

  lignes.forEach(function (ligne) {
    const telephoneParrain = ligne.telephone_parrain;

    // Chaque parrain ne doit apparaître qu'une seule fois.
    if (!parrains.has(telephoneParrain)) {
      parrains.set(telephoneParrain, {
        telephone: telephoneParrain,
        nom: ligne.nom_parrain || "",
        prenom: ligne.prenom_parrain || "",
        sous_departement:
          ligne.departement_parrain || ligne.sous_departement || "",
        photo: ligne.photo_parrain || "",
        filleuls: [],
      });
    }

    const parrain = parrains.get(telephoneParrain);

    // Une association peut être absente si un parrain n'a pas de filleul.
    // On évite aussi d'ajouter un filleul vide.
    if (ligne.telephone_filleul) {
      parrain.filleuls.push({
        telephone: ligne.telephone_filleul,
        nom: ligne.nom_filleul || "",
        prenom: ligne.prenom_filleul || "",
        photo: ligne.photo_filleul || "",
      });
    }
  });

  return {
    termine: true,
    parrains: Array.from(parrains.values()),
  };
}

function initiales(personne) {
  const prenom = personne.prenom || "";
  const nom = personne.nom || "";

  return (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || "?";
}

function creerAvatar(personne) {
  if (personne.photo) {
    const image = document.createElement("img");
    image.className = "avatar";
    image.src = personne.photo;
    image.alt = "Photo de " + (personne.prenom || "") + " " +
      (personne.nom || "");

    // Si la photo ne peut pas être chargée, afficher les initiales.
    image.addEventListener("error", function () {
      const remplacement = document.createElement("span");
      remplacement.className = "avatar";
      remplacement.textContent = initiales(personne);
      remplacement.setAttribute("aria-hidden", "true");
      image.replaceWith(remplacement);
    }, { once: true });

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
  nom.textContent = (parrain.prenom || "") + " " + (parrain.nom || "");

  const detail = document.createElement("small");
  const option = LIBELLES_OPTION[parrain.sous_departement]
    || parrain.sous_departement
    || "Département non renseigné";

  detail.textContent =
    "Parrain · " + option + " · " +
    parrain.filleuls.length + " filleul(s)";

  identite.append(nom, detail);
  entete.append(creerAvatar(parrain), identite);

  const filleuls = document.createElement("ul");
  filleuls.className = "filleuls";

  parrain.filleuls.forEach(function (filleul) {
    const ligne = document.createElement("li");
    ligne.className = "filleul";

    const texte = document.createElement("span");
    texte.textContent =
      (filleul.prenom || "") + " " + (filleul.nom || "");

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
  if (!etat.donnees || !Array.isArray(etat.donnees.parrains)) {
    return [];
  }

  return etat.donnees.parrains.filter(function (parrain) {
    return etat.option === "TOUS" ||
      parrain.sous_departement === etat.option;
  });
}

function afficher() {
  liste.replaceChildren();

  const parrains = parrainsAffiches();

  if (parrains.length === 0) {
    message.textContent =
      "Aucun résultat pour cette option.";
    return;
  }

  message.textContent = "";
  liste.replaceChildren(...parrains.map(creerFamille));
}

// Protège le CSV contre les cellules interprétées comme des formules.
function celluleCsv(valeur) {
  const texteInitial = String(valeur ?? "");
  const texte = /^[=+\-@]/.test(texteInitial)
    ? "'" + texteInitial
    : texteInitial;

  return '"' + texte.replace(/"/g, '""') + '"';
}

function telechargerCsv() {
  const lignes = [["Option", "Parrain", "Filleul"]];

  parrainsAffiches().forEach(function (parrain) {
    const nomParrain =
      (parrain.prenom || "") + " " + (parrain.nom || "");

    if (parrain.filleuls.length === 0) {
      lignes.push([
        parrain.sous_departement,
        nomParrain,
        "",
      ]);
    }

    parrain.filleuls.forEach(function (filleul) {
      lignes.push([
        parrain.sous_departement,
        nomParrain,
        (filleul.prenom || "") + " " + (filleul.nom || ""),
      ]);
    });
  });

  const contenu =
    "\uFEFF" +
    lignes.map(function (ligne) {
      return ligne.map(celluleCsv).join(";");
    }).join("\r\n");

  const url = URL.createObjectURL(
    new Blob([contenu], { type: "text/csv;charset=utf-8" })
  );

  const lien = document.createElement("a");
  lien.href = url;
  lien.download = "resultats-parrainage.csv";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();

  URL.revokeObjectURL(url);
}

function activerOutils(actif) {
  boutonCsv.disabled = !actif;
  boutonImprimer.disabled = !actif;
}

async function chargerDonnees() {
  // Priorité aux données envoyées directement par PHP.
  if (typeof window.resultatsParrainage !== "undefined") {
    return organiserResultats(window.resultatsParrainage);
  }

  // Possibilité de garder un endpoint si ton projet en utilise déjà un.
  if (
    typeof CONFIG !== "undefined" &&
    CONFIG.RESULTATS_ENDPOINT
  ) {
    const reponse = await fetch(CONFIG.RESULTATS_ENDPOINT);

    if (!reponse.ok) {
      throw new Error("HTTP " + reponse.status);
    }

    return organiserResultats(await reponse.json());
  }

  throw new Error("Les résultats PHP ne sont pas disponibles.");
}

async function demarrer() {
  activerOutils(false);
  message.textContent = "Chargement des résultats…";

  try {
    etat.donnees = await chargerDonnees();
  } catch (erreur) {
    console.error("Résultats non chargés :", erreur);
    message.textContent =
      "Impossible de charger les résultats pour le moment.";
    return;
  }

  if (!etat.donnees || !etat.donnees.termine) {
    message.textContent =
      "Le tirage n'est pas encore terminé. Reviens après la cérémonie !";
    return;
  }

  message.textContent = "";
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

    if (etat.donnees && etat.donnees.termine) {
      afficher();
    }
  });
});

boutonCsv.addEventListener("click", telechargerCsv);

boutonImprimer.addEventListener("click", function () {
  window.print();
});

demarrer();