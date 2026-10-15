activerOeils();
brancherVerification(document.querySelector("form"), function () {
  const telephone = document.getElementById("telephone").value;
  if (telephone.trim() === "" || document.getElementById("mot_de_passe").value === "") return "Remplis tous les champs.";
  if (!telephoneValide(telephone)) return "Numéro invalide. Exemple : 77 123 45 67";
  return "";
});
