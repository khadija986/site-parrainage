// Inscription filleul option INF : la logique commune est dans shared/js/formulaire.js
activerApercuPhoto("Pour que ton parrain ou ta marraine te reconnaisse");
activerOeils();
propagerCode();
brancherVerification(document.querySelector("form"), verifierInscription);
brancherDemo(document.querySelector("form"), "inscriptionFilleulInf", "../../espace/");
