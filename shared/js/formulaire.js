// Outils communs aux formulaires publics : validation, aperçu photo, mot de passe visible.
// Tout le monde s'identifie par son numéro de téléphone (format sénégalais).

const FORMULAIRE = {
  MOT_DE_PASSE_MIN: 8,
  MOT_DE_PASSE_MAX: 30,
  PHOTO_MAX_OCTETS: 2 * 1024 * 1024,
  TELEPHONE: /^(\+221|221)?7[05678][0-9]{7}$/,
};

function nettoyerTelephone(valeur) {
  return valeur.replace(/[\s.-]/g, "");
}

function telephoneValide(valeur) {
  return FORMULAIRE.TELEPHONE.test(nettoyerTelephone(valeur));
}

// Numéro au format international sans « + » (utile pour wa.me) : 77 123 45 67 -> 221771234567
function telephoneInternational(valeur) {
  const propre = nettoyerTelephone(valeur).replace(/^\+/, "");
  return propre.startsWith("221") ? propre : "221" + propre;
}

function verifierPhoto(fichier) {
  if (!fichier) return "";
  if (!fichier.type.startsWith("image/")) return "Le fichier choisi n'est pas une image.";
  if (fichier.size > FORMULAIRE.PHOTO_MAX_OCTETS) return "La photo est trop lourde (2 Mo maximum).";
  return "";
}

function verifierMotDePasse(motDePasse, confirmation) {
  if (motDePasse.length < FORMULAIRE.MOT_DE_PASSE_MIN) {
    return "Le mot de passe doit avoir au moins " + FORMULAIRE.MOT_DE_PASSE_MIN + " caractères.";
  }
  if (motDePasse.length > FORMULAIRE.MOT_DE_PASSE_MAX) {
    return "Le mot de passe ne doit pas dépasser " + FORMULAIRE.MOT_DE_PASSE_MAX + " caractères.";
  }
  if (motDePasse !== confirmation) return "Les deux mots de passe ne sont pas identiques.";
  return "";
}

function afficherMessage(texte, reussite) {
  const zone = document.getElementById("message");
  zone.textContent = texte;
  zone.classList.toggle("ok", Boolean(reussite));
}

// Aperçu de la photo choisie dans la zone .photo
function activerApercuPhoto(texteInitial) {
  const champ = document.getElementById("photo");
  const cercle = document.getElementById("photo-cercle");
  const apercu = document.getElementById("photo-apercu");
  const titre = document.getElementById("photo-titre");
  const aide = document.getElementById("photo-aide");
  const titreInitial = titre.textContent;

  champ.addEventListener("change", function () {
    const fichier = champ.files[0];
    if (!fichier) {
      cercle.classList.remove("avec-photo");
      titre.textContent = titreInitial;
      aide.textContent = texteInitial;
      return;
    }
    apercu.src = URL.createObjectURL(fichier);
    cercle.classList.add("avec-photo");
    titre.textContent = "Photo ajoutée";
    aide.textContent = fichier.name;
  });
}

// Boutons « œil » : <button class="oeil" data-cible="id-du-champ">
function activerOeils() {
  document.querySelectorAll(".oeil").forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      const champ = document.getElementById(bouton.dataset.cible);
      const visible = champ.type === "text";
      champ.type = visible ? "password" : "text";
      bouton.setAttribute("aria-label", visible ? "Afficher le mot de passe" : "Masquer le mot de passe");
    });
  });
}

// Branche une fonction de vérification sur un formulaire : elle renvoie un message d'erreur ou "".
function brancherVerification(formulaire, verifier) {
  formulaire.addEventListener("input", function () { afficherMessage(""); });
  formulaire.addEventListener("submit", function (evenement) {
    const erreur = verifier();
    if (erreur !== "") {
      evenement.preventDefault();
      afficherMessage(erreur);
    }
  });
}

// Vérification commune aux 4 pages d'inscription (nom, prénom, téléphone, mots de passe, photo)
function verifierInscription() {
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const telephone = document.getElementById("telephone").value;
  const photo = document.getElementById("photo").files[0];

  if (nom === "" || prenom === "" || telephone.trim() === "") return "Remplis tous les champs.";
  if (!telephoneValide(telephone)) return "Numéro invalide. Exemple : 77 123 45 67";
  const erreurMotDePasse = verifierMotDePasse(
    document.getElementById("mot_de_passe").value,
    document.getElementById("confirmation").value
  );
  if (erreurMotDePasse !== "") return erreurMotDePasse;
  return verifierPhoto(photo);
}
