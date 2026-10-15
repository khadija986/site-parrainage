// Réglages communs du site (à adapter avant la mise en ligne).
const CONFIG = {
  // Numéro WhatsApp de l'administrateur, format international sans « + » (ex. Sénégal : 221 + 9 chiffres)
  NUMERO_ADMIN_WHATSAPP: "221770000000",

  // Endpoints PHP (partie 2). Laisser vide tant que PHP n'est pas branché : les pages restent utilisables en démo.
  DEMANDE_MDP_ENDPOINT: "",   // POST telephone -> enregistre une demande de réinitialisation
  PROFIL_ENDPOINT: "",        // GET -> { nom, prenom, telephone, role, sous_departement, photo }
  RESULTATS_ENDPOINT: "",     // GET -> { termine, parrains: [{ nom, prenom, sous_departement, photo, filleuls: [...] }] }
};
