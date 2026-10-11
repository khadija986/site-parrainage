const $ = id => document.getElementById(id);

let personnes = JSON.parse(localStorage.getItem("personnes") || "[]");
let modification = null;

// Ouvrir le formulaire
function ouvrirForm(id = null) {
    $("formulaire").reset();
    modification = id;

    if (id !== null) {
        const p = personnes.find(p => p.id === id);
        if (!p) return;

        $("nom").value = p.nom;
        $("prenom").value = p.prenom;
        $("telephone").value = p.telephone;
        $("role").value = p.role;
        $("departement").value = p.departement;
    }

    $("titreForm").textContent = id === null
        ? "Ajouter un utilisateur"
        : "Modifier un utilisateur";

    $("modal").style.display = "flex";
}

// Fermer le formulaire
function fermerForm() {
    $("modal").style.display = "none";
}

// Enregistrer un utilisateur
$("formulaire").addEventListener("submit", function(e) {
    e.preventDefault();

    const p = {
        id: modification ?? Date.now(),
        nom: $("nom").value.trim(),
        prenom: $("prenom").value.trim(),
        telephone: $("telephone").value.trim(),
        role: $("role").value,
        departement: $("departement").value
    };

    if (!p.nom || !p.prenom || !p.telephone) {
        alert("Remplis tous les champs !");
        return;
    }

    if (personnes.some(x =>
        x.telephone === p.telephone && x.id !== p.id
    )) {
        alert("Ce numéro existe déjà !");
        return;
    }

    if (modification !== null) {
        personnes = personnes.map(x => x.id === p.id ? p : x);
    } else {
        personnes.push(p);
    }

    sauvegarder();
    fermerForm();
    modification = null;
});

// Sauvegarder et actualiser
function sauvegarder() {
    localStorage.setItem("personnes", JSON.stringify(personnes));
    afficher();
}

// Supprimer un utilisateur
function supprimer(id) {
    if (confirm("Supprimer ce utilisateur ?")) {
        personnes = personnes.filter(p => p.id !== id);
        sauvegarder();
    }
}

// Afficher les utilisateurs
function afficher() {
    const categories = {
        "Parrain-INF": "pINF",
        "Filleul-INF": "fINF",
        "Parrain-TR": "pTR",
        "Filleul-TR": "fTR"
    };

    Object.values(categories).forEach(id => {
        $(id).replaceChildren();
    });

    const recherche = $("recherche").value.toLowerCase().trim();

    personnes.forEach(p => {
        const categorie = categories[p.role + "-" + p.departement];
        if (!categorie) return;

        const texte = `${p.nom} ${p.prenom} ${p.telephone}`.toLowerCase();
        if (!texte.includes(recherche)) return;

        const bloc = document.createElement("div");
        bloc.className = "personne";

        const nom = document.createElement("strong");
        nom.textContent = `${p.prenom} ${p.nom}`;

        const tel = document.createElement("p");
        tel.textContent = "Téléphone : " + p.telephone;

        const modifier = document.createElement("button");
        modifier.textContent = "Modifier";
        modifier.onclick = () => ouvrirForm(p.id);

        const supprimerBtn = document.createElement("button");
        supprimerBtn.textContent = "Supprimer";
        supprimerBtn.className = "supprimer";
        supprimerBtn.onclick = () => supprimer(p.id);

        bloc.append(nom, tel, modifier, supprimerBtn);
        $(categorie).appendChild(bloc);
    });

    $("total").textContent = personnes.length;
    $("parrains").textContent =
        personnes.filter(p => p.role === "Parrain").length;
    $("filleuls").textContent =
        personnes.filter(p => p.role === "Filleul").length;
}

// Recherche en direct
$("recherche").addEventListener("input", afficher);

// Fermer en cliquant sur le fond
$("modal").addEventListener("click", e => {
    if (e.target === $("modal")) fermerForm();
});

// Initialisation
afficher();

