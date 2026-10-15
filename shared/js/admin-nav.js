// Ouverture / fermeture de la barre latérale sur mobile.
(function () {
  const bouton = document.getElementById("burger");
  const fond = document.getElementById("fond-menu");

  function basculer(ouvert) {
    document.body.classList.toggle("menu-ouvert", ouvert);
    bouton.setAttribute("aria-expanded", String(ouvert));
  }

  bouton.addEventListener("click", function () { basculer(!document.body.classList.contains("menu-ouvert")); });
  fond.addEventListener("click", function () { basculer(false); });
  document.addEventListener("keydown", function (evenement) { if (evenement.key === "Escape") basculer(false); });
})();
