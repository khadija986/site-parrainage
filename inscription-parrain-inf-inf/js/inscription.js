// Inscription parrain option INF : la logique commune est dans shared/js/formulaire.js
activerApercuPhoto("Tes filleuls la verront le jour du tirage");
activerOeils();
propagerCode();
brancherVerification(document.querySelector("form"), verifierInscription);
brancherDemo(document.querySelector("form"), "inscriptionParrainInf", "../../connexion/?inscrit=1");
