// Réglages communs du site (à adapter avant la mise en ligne).
const CONFIG = {
  // MODE DÉMO : tant que le PHP d'une page n'est pas écrit, son formulaire « passe » sans serveur ni base
  // (il mène directement à la page suivante). Quand TON PHP fonctionne, passe TA ligne à false : le formulaire
  // enverra alors vraiment les données à ton script PHP. Une ligne par page, pour rester indépendants.
  DEMO: {
    inscriptionFilleulInf: true,
    inscriptionFilleulTr: true,
    inscriptionParrainInf: true,
    inscriptionParrainTr: true,
    connexion: true,
    profil: true,
    espace: true,
    adminLogin: false,
  },

  // Numéro WhatsApp de l'administrateur, format international sans « + » (ex. Sénégal : 221 + 9 chiffres)
  NUMERO_ADMIN_WHATSAPP: "221770000000",

  // Endpoints PHP (partie 2). Laisser vide tant que PHP n'est pas branché : les pages restent utilisables en démo.
  DEMANDE_MDP_ENDPOINT: "",   // POST telephone -> enregistre une demande de réinitialisation
  ESPACE_ENDPOINT: "",      // GET -> { role, sous_departement, prenom, nom, photo, tirage_effectue, parrain: {...} | filleuls: [...] }
  PROFIL_ENDPOINT: "",        // GET -> { nom, prenom, telephone, role, sous_departement, photo }
  RESULTATS_ENDPOINT: "",     // (ADMIN) GET -> { termine, parrains: [{ nom, prenom, sous_departement, photo, filleuls: [...] }] }
};
