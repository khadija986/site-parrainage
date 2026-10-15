// Barre du haut de l'espace utilisateur : avatar (photo ou initiales) qui mène au profil.

// Utilisateur fictif affiché tant qu'aucun endpoint PHP n'est branché (mode démo).
const UTILISATEUR_DEMO = { prenom: "Awa", nom: "Diop", photo: "" };

function initialesDe(personne) {
  return (personne.prenom.charAt(0) + personne.nom.charAt(0)).toUpperCase();
}

// Affiche la photo (si elle existe) ou les initiales dans l'avatar de la barre
function remplirAvatar(utilisateur) {
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
