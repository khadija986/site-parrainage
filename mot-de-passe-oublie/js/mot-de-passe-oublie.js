const formulaire = document.getElementById("demande");
const champTelephone = document.getElementById("telephone");

function messageWhatsApp(telephone) {
  return "Bonjour, j'ai oublié mon mot de passe du site de parrainage. Mon numéro : " + telephone.trim() + ". Peux-tu me donner un mot de passe temporaire ?";
}

// Prévient le serveur pour que la demande apparaisse dans l'espace admin (inactif tant que l'endpoint est vide)
function enregistrerDemande(telephone) {
  if (CONFIG.DEMANDE_MDP_ENDPOINT === "") return;
  const donnees = new FormData();
  donnees.append("telephone", nettoyerTelephone(telephone));
  fetch(CONFIG.DEMANDE_MDP_ENDPOINT, { method: "POST", body: donnees, keepalive: true })
    .catch(function (erreur) { console.warn("Demande non enregistrée côté serveur :", erreur); });
}

formulaire.addEventListener("input", function () { afficherMessage(""); });

formulaire.addEventListener("submit", function (evenement) {
  evenement.preventDefault();
  const telephone = champTelephone.value;
  if (!telephoneValide(telephone)) {
    afficherMessage("Numéro invalide. Exemple : 77 123 45 67");
    return;
  }
  // Ouverture immédiate (sur le clic) pour ne pas être bloquée par le navigateur
  const lien = "https://wa.me/" + CONFIG.NUMERO_ADMIN_WHATSAPP + "?text=" + encodeURIComponent(messageWhatsApp(telephone));
  window.open(lien, "_blank", "noopener");
  enregistrerDemande(telephone);
  afficherMessage("WhatsApp s'ouvre : envoie le message pré-rempli à l'admin.", true);
});
