function toggleMenuGlobal() {
  // Quand la souris entre sur un lien principal du menu
  $(document).on("mouseenter", "aside nav > a", function () {
    const $trigger = $(this); // le lien (ex: .filiale)
    const submenuClass = getSubmenuClass($trigger);
    const $submenu = submenuClass ? $(submenuClass) : null;

    // Fermer tous les autres sous-menus
    $("aside nav div").not($submenu).stop(true, true).slideUp();

    // Ouvrir le sous-menu lié
    if ($submenu && $submenu.length) {
      $submenu
        .stop(true, true)
        .slideDown(600, function () {
          $(this).css({
            display: "flex",
            "flex-direction": "column"
          });
        });
    }
  });

  // Quand la souris quitte un sous-menu => le refermer
  $(document).on("mouseleave", "aside nav div", function () {
    $(this).stop(true, true).slideUp(600);
  });
}

// Fonction utilitaire pour lier menu principal ↔ sous-menu
function getSubmenuClass($trigger) {
  if ($trigger.hasClass("filiale")) return ".detailF";
  if ($trigger.hasClass("equipement")) return ".detailE";
  if ($trigger.hasClass("admins")) return ".detailA";
  if ($trigger.hasClass("recherche")) return ".detailR";
  return null;
}
$(document).ready(function () {toggleMenuGlobal();});