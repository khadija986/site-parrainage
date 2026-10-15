// Barre du haut de l'espace utilisateur : avatar (photo ou initiales) qui mène au profil.

// Utilisateur fictif affiché tant qu'aucun endpoint PHP n'est branché (mode démo).
const UTILISATEUR_DEMO = { prenom: "Awa", nom: "Diop", photo: "", role: "filleul", sous_departement: "INF" };

const LIBELLES_OPTION = { INF: "Informatique", TR: "Télécoms & Réseaux" };
const LIBELLES_ROLE = { parrain: "Parrain", marraine: "Marraine", filleul: "Filleul" };

function initialesDe(personne) {
  return (personne.prenom.charAt(0) + personne.nom.charAt(0)).toUpperCase();
}

// Affiche la photo (si elle existe) ou les initiales dans l'avatar de la barre
function remplirAvatar(utilisateur) {
  remplirResume(utilisateur);
  const avatar = document.getElementById("avatar-mini");
  if (utilisateur.photo) {
    const image = document.createElement("img");
    image.src = utilisateur.photo;
    image.alt = "";
    avatar.replaceChildren(image);
  } else {
    avatar.textContent = initialesDe(utilisateur);
  }
}

// Photo ronde : <img> si la personne a une photo, sinon pastille avec ses initiales
function creerPhotoRonde(personne) {
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

// Colonne « mon compte » affichée seulement sur grand écran (#resume-photo, #resume-nom, #resume-badge)
function remplirResume(utilisateur) {
  const zone = document.getElementById("resume-photo");
  if (!zone) return;
  zone.replaceChildren(creerPhotoRonde(utilisateur));
  document.getElementById("resume-nom").textContent = utilisateur.prenom + " " + utilisateur.nom;
  document.getElementById("resume-badge").textContent = LIBELLES_ROLE[utilisateur.role] + " · " + LIBELLES_OPTION[utilisateur.sous_departement];
}
