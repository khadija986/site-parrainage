// Mode démo (voir shared/js/config.js) : sans PHP, la connexion admin mène directement au tableau de bord.
if (CONFIG.DEMO.adminLogin) {
  document.querySelector("form").addEventListener("submit", function (evenement) {
    evenement.preventDefault();
    window.location.href = "../gestion-utilisateurs/";
  });
}
