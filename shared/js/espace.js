// Barre du haut de l'espace utilisateur : avatar (photo ou initiales) et menu Profil / Déconnexion.

// Utilisateur fictif affiché tant qu'aucun endpoint PHP n'est branché (mode démo).
const UTILISATEUR_DEMO = { prenom: "Awa", nom: "Diop", photo: "" };

function initialesDe(personne) {
  return (personne.prenom.charAt(0) + personne.nom.charAt(0)).toUpperCase();
}

// Affiche la photo (si elle existe) ou les initiales dans l'avatar de la barre
function remplirAvatar(utilisateur) {
  const avatar = document.getElementById("avatar-mini");
  const nom = document.getElementById("menu-nom");
  if (utilisateur.photo) {
    const image = document.createElement("img");
    image.src = utilisateur.photo;
    image.alt = "";
    avatar.replaceChildren(image);
  } else {
    avatar.textContent = initialesDe(utilisateur);
  }
  if (nom) nom.textContent = utilisateur.prenom + " " + utilisateur.nom;
}

function activerMenuProfil() {
  const bouton = document.getElementById("avatar-bouton");
  const menu = document.getElementById("menu-profil");
  const fond = document.getElementById("menu-fond");

  function basculer(ouvert) {
    menu.hidden = !ouvert;
    fond.hidden = !ouvert;
    bouton.setAttribute("aria-expanded", String(ouvert));
  }

  bouton.addEventListener("click", function () { basculer(menu.hidden); });
  fond.addEventListener("click", function () { basculer(false); });
  document.addEventListener("keydown", function (evenement) {
    if (evenement.key === "Escape" && !menu.hidden) {
      basculer(false);
      bouton.focus();
    }
  });
}
