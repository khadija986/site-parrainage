// Écran d'accueil
const ecranAccueil = document.getElementById("ecran-accueil");
const blocInscription = document.getElementById("bloc-inscription");
const boutonDemarrer = document.getElementById("demarrer");

boutonDemarrer.addEventListener("click", function () {
    ecranAccueil.classList.add("disparition");
    setTimeout(function () {
        ecranAccueil.hidden = true;
        blocInscription.hidden = false;
    }, 300);
});

// Si on revient d'une erreur, on montre directement le formulaire
if (new URLSearchParams(window.location.search).get("erreurs")) {
    ecranAccueil.hidden = true;
    blocInscription.hidden = false;
}
const inputPhoto = document.getElementById("photo");
const apercu = document.getElementById("apercu");

inputPhoto.addEventListener("change", function () {
  const fichier = inputPhoto.files[0];

  if (fichier) {
    apercu.src = URL.createObjectURL(fichier);
    apercu.style.display = "block";
  } else {
    apercu.style.display = "none";
  }
});

// L'œil du mot de passe
const champMdp = document.getElementById("mot_de_passe");
const boutonVoir = document.getElementById("voir-mdp");

boutonVoir.addEventListener("click", function () {
  if (champMdp.type === "password") {
    champMdp.type = "text";
    boutonVoir.classList.add("actif");
  } else {
    champMdp.type = "password";
    boutonVoir.classList.remove("actif");
  }
});

// L'œil de la confirmation
const champConfirm = document.getElementById("confirmation");
const boutonVoirConfirm = document.getElementById("voir-confirmation");

boutonVoirConfirm.addEventListener("click", function () {
  if (champConfirm.type === "password") {
    champConfirm.type = "text";
    boutonVoirConfirm.classList.add("actif");
  } else {
    champConfirm.type = "password";
    boutonVoirConfirm.classList.remove("actif");
  }
});

// Vérification des champs obligatoires
const formulaire = document.querySelector("form");
formulaire.noValidate = true;

const champs = [
    { id: "nom", message: "Le nom est obligatoire." },
    { id: "prenom", message: "Le prénom est obligatoire." },
    { id: "telephone", message: "Le téléphone est obligatoire." },
{ id: "confirmation", message: "Confirme ton mot de passe." },
    { id: "mot_de_passe", message: "Le mot de passe est obligatoire." },
    { id: "photo", message: "La photo est obligatoire." }
];

formulaire.addEventListener("submit", function (e) {
    let toutEstRempli = true;
    let premierVide = null;

    champs.forEach(function (c) {
        const champ = document.getElementById(c.id);
        const ancien = document.getElementById("erreur-" + c.id);
        if (ancien) ancien.remove();
        champ.classList.remove("invalide");

        const vide = champ.type === "file"
            ? champ.files.length === 0
            : champ.value.trim() === "";

        if (vide) {
            toutEstRempli = false;
            if (!premierVide) premierVide = champ;
            champ.classList.add("invalide");

            const message = document.createElement("p");
            message.id = "erreur-" + c.id;
            message.className = "msg-erreur";
            message.textContent = c.message;

            const cible = champ.closest(".zone-mdp, .zone-photo") || champ;
            cible.insertAdjacentElement("afterend", message);
        }
    });
// Les deux mots de passe sont-ils identiques ?
    const mdp = document.getElementById("mot_de_passe");
    const confirmation = document.getElementById("confirmation");
    if (confirmation.value !== "" && confirmation.value !== mdp.value) {
        toutEstRempli = false;
        if (!premierVide) premierVide = confirmation;
        confirmation.classList.add("invalide");

        const message = document.createElement("p");
        message.id = "erreur-confirmation";
        message.className = "msg-erreur";
        message.textContent = "Les deux mots de passe ne sont pas identiques.";
                const cible = confirmation.closest(".zone-mdp") || confirmation;
        cible.insertAdjacentElement("afterend", message);
    }

    if (!toutEstRempli) {
        e.preventDefault();
        premierVide.focus();
    }
});

// Garder ce qui a été tapé, pour ne pas tout retaper après une erreur
const aGarder = ["nom", "prenom", "telephone"];

formulaire.addEventListener("submit", function () {
    aGarder.forEach(function (id) {
        sessionStorage.setItem(id, document.getElementById(id).value);
    });
});

// Au retour d'une erreur : remettre les valeurs et montrer les cases à corriger
const params = new URLSearchParams(window.location.search);
const erreursRecues = params.get("erreurs");

const textesRetour = {
    nom: "Ton nom est manquant.",
    prenom: "Ton prénom est manquant.",
    telephone: "Ce numéro n'est pas valide ou il est déjà inscrit.",
    mot_de_passe: "Remets ton mot de passe (il n'est jamais gardé, par sécurité).",
    confirmation: "Remets la confirmation du mot de passe.",
    photo: "Remets ta photo (jpg, png ou webp, 5 Mo maximum)."
};

if (erreursRecues) {
    aGarder.forEach(function (id) {
        const valeur = sessionStorage.getItem(id);
        if (valeur) {
            document.getElementById(id).value = valeur;
        }
    });

    const aCorriger = erreursRecues.split(",");
    ["mot_de_passe", "confirmation", "photo"].forEach(function (id) {
        if (!aCorriger.includes(id)) {
            aCorriger.push(id);
        }
    });

    aCorriger.forEach(function (id) {
        const champ = document.getElementById(id);
        if (!champ || !textesRetour[id]) return;

        champ.classList.add("invalide");

        const message = document.createElement("p");
        message.id = "erreur-" + id;
        message.className = "msg-erreur";
        message.textContent = textesRetour[id];

        const cible = champ.closest(".zone-mdp, .zone-photo") || champ;
        cible.insertAdjacentElement("afterend", message);
    });

    document.getElementById(aCorriger[0]).focus();
}

// Afficher le nom de la photo choisie
const champPhoto = document.getElementById("photo");
const nomFichier = document.getElementById("nom-fichier");

champPhoto.addEventListener("change", function () {
    nomFichier.textContent = champPhoto.files.length > 0
        ? champPhoto.files[0].name
                : "Ajoute une belle photo de toi : ton filleul la verra le jour du tirage.";
});