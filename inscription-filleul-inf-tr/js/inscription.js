const formulaire = document.querySelector("form");
const message = document.getElementById("message");
const champPhoto = document.getElementById("photo");
const cerclePhoto = document.getElementById("photo-cercle");
const apercuPhoto = document.getElementById("photo-apercu");
const titrePhoto = document.getElementById("photo-titre");
const aidePhoto = document.getElementById("photo-aide");

// Aperçu de la photo choisie
champPhoto.addEventListener("change", function () {
  const fichier = champPhoto.files[0];

  if (!fichier) {
    cerclePhoto.classList.remove("avec-photo");
    titrePhoto.textContent = "Ajoute ta photo";
    aidePhoto.textContent = "Pour que ton parrain ou ta marraine te reconnaisse";
    return;
  }

  apercuPhoto.src = URL.createObjectURL(fichier);
  cerclePhoto.classList.add("avec-photo");
  titrePhoto.textContent = "Photo ajoutée";
  aidePhoto.textContent = fichier.name;
});

// Efface le message dès que la personne corrige
formulaire.addEventListener("input", function () {
  message.textContent = "";
});

// Vérifications avant l'envoi
formulaire.addEventListener("submit", function (event) {
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const telephone = document.getElementById("telephone").value.trim();
  const telephoneNettoye = telephone.replace(/[\s.-]/g, "");
  const motDePasse = document.getElementById("mot_de_passe").value;
  const confirmation = document.getElementById("confirmation").value;
  const photo = champPhoto.files[0];

  let erreur = "";

  if (nom === "" || prenom === "" || telephone === "") {
    erreur = "Remplis tous les champs.";
  } else if (!/^(\+221|221)?7[05678][0-9]{7}$/.test(telephoneNettoye)) {
    erreur = "Numéro invalide. Exemple : 77 123 45 67";
  } else if (motDePasse.length < 8) {
    erreur = "Le mot de passe doit avoir au moins 8 caractères.";
  } else if (motDePasse !== confirmation) {
    erreur = "Les deux mots de passe ne sont pas identiques.";
  } else if (photo && !photo.type.startsWith("image/")) {
    erreur = "Le fichier choisi n'est pas une image.";
  } else if (photo && photo.size > 2 * 1024 * 1024) {
    erreur = "La photo est trop lourde (2 Mo maximum).";
  }

  if (erreur !== "") {
    event.preventDefault();
    message.textContent = erreur;
  }
});
