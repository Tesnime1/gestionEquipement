function toggleMenuGlobal() {
  // Quand on clique sur un lien principal
  $(document).on("click", "aside nav > a", function (e) {
    e.preventDefault(); // empêcher le navigateur de suivre un lien vide

    const $trigger = $(this);
    const submenuClass = getSubmenuClass($trigger);
    const $submenu = submenuClass ? $(submenuClass) : null;

    // Si le lien n'a pas de sous-menu (ex: logout), ne rien faire
    if (!$submenu || !$submenu.length) {
      return;
    }

    // Fermer tous les autres menus
    $("aside nav div").not($submenu).slideUp(300);

    // Toggle (ouvrir/fermer)
    $submenu.slideToggle(300, function () {
      if ($(this).is(":visible")) {
        $(this).css({
          display: "flex",
          "flex-direction": "column",
        });
      }
    });
  });
}

// Fonction utilitaire inchangée
function getSubmenuClass($trigger) {
  if ($trigger.hasClass("filiale")) return ".detailF";
  if ($trigger.hasClass("equipement")) return ".detailE";
  if ($trigger.hasClass("admins")) return ".detailA";
  if ($trigger.hasClass("recherche")) return ".detailR";
  return null;
}

$(document).ready(function () {
  toggleMenuGlobal();
});
