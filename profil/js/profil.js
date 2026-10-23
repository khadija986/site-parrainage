// Remplit le formulaire avec le profil renvoyé par le serveur (PROFIL_ENDPOINT)
function remplirProfil(profil) {
  remplirAvatar(profil);
  document.getElementById("nom").value = profil.nom;
  document.getElementById("prenom").value = profil.prenom;
  document.getElementById("telephone").value = profil.telephone;
  document.getElementById("csrf").value = profil.csrf || "";   // jeton anti-CSRF envoyé avec le formulaire


  if (profil.photo) {
    document.getElementById("photo-apercu").src = profil.photo;
    document.getElementById("photo-cercle").classList.add("avec-photo");
  }
}

async function chargerProfil() {
  if (CONFIG.PROFIL_ENDPOINT === "") return;
  try {
    const reponse = await fetch(CONFIG.PROFIL_ENDPOINT, { credentials: "same-origin" });
    if (!reponse.ok) throw new Error("HTTP " + reponse.status);
    remplirProfil(await reponse.json());
  } catch (erreur) {
    console.error("Profil non chargé :", erreur);
    afficherMessage("Impossible de charger ton profil. Réessaie plus tard.");
  }
}

// Après une réinitialisation par l'admin, le serveur redirige avec ?mdp_temporaire=1
if (new URLSearchParams(window.location.search).get("mdp_temporaire")) {
  document.getElementById("intro-profil").textContent = "Ton mot de passe est temporaire : choisis-en un nouveau ci-dessous.";
}

// Messages renvoyés par profil.php après l'envoi du formulaire
const parametresUrl = new URLSearchParams(window.location.search);
if (parametresUrl.get("erreur")) {
  afficherMessage(parametresUrl.get("erreur"));
} else if (parametresUrl.get("succes")) {
  afficherMessage("Modifications enregistrées.");
}

remplirAvatar(UTILISATEUR_DEMO);   // remplacé par le vrai profil dès que PROFIL_ENDPOINT répond
activerApercuPhoto("Laisse vide pour garder l'actuelle");
activerOeils();
chargerProfil();

brancherVerification(document.querySelector("form"), function () {
  if (document.getElementById("nom").value.trim() === "" || document.getElementById("prenom").value.trim() === "") return "Le nom et le prénom sont obligatoires.";
  if (!telephoneValide(document.getElementById("telephone").value)) return "Numéro invalide. Exemple : 77 123 45 67";
  if (document.getElementById("mot_de_passe_actuel").value === "") return "Saisis ton mot de passe actuel pour valider.";

  const nouveau = document.getElementById("nouveau_mot_de_passe").value;
  const confirmation = document.getElementById("confirmation").value;
  if (nouveau !== "" || confirmation !== "") {
    const erreur = verifierMotDePasse(nouveau, confirmation);
    if (erreur !== "") return erreur;
  }
  // Sur le profil la photo est facultative : on ne la vérifie que si une nouvelle est choisie
  const nouvellePhoto = document.getElementById("photo").files[0];
  return nouvellePhoto ? verifierPhoto(nouvellePhoto) : "";
});
