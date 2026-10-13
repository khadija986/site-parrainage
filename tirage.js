/* ============================================================
   FAUSSES DONNEES (à supprimer quand le PHP et la base seront prêts)
   Pour une vraie photo, ajoute  photo: 'uploads/awa.jpg'  à la personne.
   ============================================================ */
const DONNEES = {
  INF: {
    filleuls: [
      { nom: 'Awa Diop', couleur: '#d4537e' },
      { nom: 'Moussa Fall', couleur: '#378ADD' },
      { nom: 'Fatou Ndiaye', couleur: '#1D9E75' },
      { nom: 'Ibrahima Sow', couleur: '#7F77DD' },
      { nom: 'Aminata Ba', couleur: '#D85A30' },
      { nom: 'Cheikh Sarr', couleur: '#639922' }
    ],
    parrains: [
      { nom: 'Mariama Sy', couleur: '#534AB7' },
      { nom: 'Ousmane Gueye', couleur: '#0F6E56' },
      { nom: 'Khady Diallo', couleur: '#993C1D' }
    ]
  },
  TR: {
    filleuls: [
      { nom: 'Pape Mbaye', couleur: '#378ADD' },
      { nom: 'Ndeye Faye', couleur: '#d4537e' },
      { nom: 'Samba Kane', couleur: '#639922' },
      { nom: 'Rokhaya Thiam', couleur: '#D85A30' }
    ],
    parrains: [
      { nom: 'Alioune Cisse', couleur: '#534AB7' },
      { nom: 'Sokhna Lo', couleur: '#0F6E56' }
    ]
  }
};

/* ============================================================
   ETAT DU TIRAGE
   ============================================================ */
let manche = 'INF';
let restants = [];   // filleuls pas encore tirés
let compteurs = [];  // nombre de filleuls reçus par chaque parrain
let tires = 0;
let total = 0;
let occupe = false;  // empêche les doubles clics pendant le suspense

const $ = (id) => document.getElementById(id);

/* ============================================================
   FONCTIONS D'ACCES AUX DONNEES
   C'est ici (et seulement ici) qu'on branchera le PHP plus tard.
   ============================================================ */

// Plus tard : fetch('api/piocher.php', { method: 'POST', body: ... })
async function obtenirFilleul() {
  return restants.shift();
}

// Plus tard : fetch('api/attribuer.php', { method: 'POST', body: ... })
// Le vrai choix du parrain devra être fait côté PHP, jamais ici.
async function obtenirParrain(filleul) {
  const min = Math.min(...compteurs);
  const candidats = [];
  compteurs.forEach((n, i) => { if (n === min) candidats.push(i); });
  const choisi = candidats[Math.floor(Math.random() * candidats.length)];
  compteurs[choisi]++;
  return parrains[choisi];
}

/* ============================================================
   AFFICHAGE
   ============================================================ */
function melanger(tableau) {
  return tableau.sort(() => Math.random() - 0.5);
}

function initiales(nom) {
  return nom.split(' ').map((mot) => mot[0]).join('');
}

// Image de remplacement (cercle coloré avec initiales) si pas de vraie photo
function avatar(personne) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">' +
    '<rect width="300" height="300" fill="' + personne.couleur + '"/>' +
    '<text x="150" y="150" font-family="Arial" font-size="100" fill="#fff" ' +
    'text-anchor="middle" dominant-baseline="central">' + initiales(personne.nom) + '</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function afficher(cote, personne) {
  $('photo-' + cote).src = personne.photo || avatar(personne);
  $('photo-' + cote).alt = 'Photo de ' + personne.nom;
  $('nom-' + cote).textContent = personne.nom;
}

function afficherVide(cote) {
  $('photo-' + cote).src =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">' +
    '<rect width="300" height="300" fill="#2b3d6e"/>' +
    '<text x="150" y="150" font-family="Arial" font-size="120" fill="#9fb0d6" ' +
    'text-anchor="middle" dominant-baseline="central">?</text></svg>');
  $('photo-' + cote).alt = '';
  $('nom-' + cote).textContent = 'En attente';
}

function majProgression() {
  $('nb-tires').textContent = tires;
  $('nb-total').textContent = total;
  $('barre').style.width = (total ? Math.round(tires / total * 100) : 0) + '%';
}

function initialiser(nouvelleManche) {
  manche = nouvelleManche;
  const donnees = DONNEES[manche];
  restants = melanger(donnees.filleuls.slice());
  compteurs = donnees.parrains.map(() => 0);
  tires = 0;
  total = donnees.filleuls.length;

  $('manche-titre').textContent = 'Manche ' + manche;
  $('liste-couples').innerHTML = '';
  $('carte-parrain').classList.remove('revele');
  $('btn-suivant').textContent = 'Filleul suivant';
  afficherVide('filleul');
  afficherVide('parrain');
  majProgression();
}

/* ============================================================
   DEROULE D'UN TIRAGE
   ============================================================ */
async function lancerTirage() {
  if (occupe) return;

  if (tires >= total) {   // manche terminée : on recommence
    initialiser(manche);
    return;
  }

  occupe = true;
  $('btn-suivant').textContent = 'Tirage en cours…';
  $('carte-parrain').classList.remove('revele');

  const filleul = await obtenirFilleul();
  afficher('filleul', filleul);

  // Suspense : les photos des parrains défilent en ralentissant
  const parrains = DONNEES[manche].parrains;
  let ecoule = 0;
  let delai = 70;
  let dernier = -1;
  while (ecoule < 2600) {
    let i;
    do { i = Math.floor(Math.random() * parrains.length); }
    while (parrains.length > 1 && i === dernier);
    dernier = i;
    afficher('parrain', parrains[i]);
    await new Promise((fin) => setTimeout(fin, delai));
    ecoule += delai;
    delai *= 1.1;
  }

  // Révélation
  const parrain = await obtenirParrain(filleul);
  afficher('parrain', parrain);
  $('carte-parrain').classList.add('revele');

  tires++;
  majProgression();

  const ligne = document.createElement('li');
  ligne.textContent = filleul.nom + '  →  ' + parrain.nom;
  $('liste-couples').prepend(ligne);

  $('btn-suivant').textContent =
    tires < total ? 'Filleul suivant' : 'Manche terminée, recommencer';
  occupe = false;
}

/* ============================================================
   EVENEMENTS
   ============================================================ */
$('btn-suivant').addEventListener('click', lancerTirage);

document.querySelectorAll('.pastille').forEach((bouton) => {
  bouton.addEventListener('click', () => {
    if (occupe) return;
    document.querySelectorAll('.pastille').forEach((b) => b.classList.remove('actif'));
    bouton.classList.add('actif');
    initialiser(bouton.dataset.manche);
  });
});

initialiser('INF');
