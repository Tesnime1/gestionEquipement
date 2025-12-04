let allEquipements = [];
let isEquipementSelectListenerAdded = false;
let currentFicheEquipementId = null;
let equipementTableInstance = null;

$(document).ready(function () {
  console.log("🚀 Initialisation application");
  getScrollHeight();

  $(window).on("resize", function () {
    if (equipementTableInstance) {
      // Met à jour la hauteur du scroll
      equipementTableInstance.settings()[0].oScroll.sY = getScrollHeight();
      // Redessine le tableau
      equipementTableInstance.draw(true);
      // Réajuste les colonnes
      equipementTableInstance.columns.adjust();
    }
  });
  toggleMenuGlobal();
});
$(document).on("keydown", "form", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Empêche la soumission
    return false;
  }
});

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
      $submenu.stop(true, true).slideDown(600, function () {
        $(this).css({
          display: "flex",
          "flex-direction": "column",
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

$(window).on("resize", function () {
  if (equipementTableInstance) {
    // Met à jour la hauteur du scroll
    equipementTableInstance.settings()[0].oScroll.sY = getScrollHeight();
    // Redessine le tableau
    equipementTableInstance.draw(true);
    // Réajuste les colonnes
    equipementTableInstance.columns.adjust();
  }
});

function getScrollHeight() {
  console.log("Window height:", $(window).height());
  return $(window).height() - 220 + "px";
}

function customAlert(message, type = "success", closeModal = false) {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:9999;";

  const buttonColor = type === "success" ? "#198754" : "#dc3545";

  const box = document.createElement("div");
  box.style.cssText =
    "background:#fff;padding:2vw;border-radius:5px;text-align:center;min-width:40vw;box-shadow:0 5px 15px rgba(0,0,0,0.3);";
  box.innerHTML = `
    <p style="font-family:sans-serif;font-size:16px;font-weight:600;">${message}</p>
    <button id="ok-btn" style="background:${buttonColor};border:none;padding:8px 16px;border-radius:6px;color:white;font-weight:bold;cursor:pointer;">OK</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById("ok-btn").addEventListener("click", () => {
    overlay.remove();
    if (closeModal) $("#modal").hide();
  });
}
