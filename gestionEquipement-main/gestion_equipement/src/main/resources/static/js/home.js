// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;

$(document).ready(function () {
  console.log("✅ Application initialisée");
  
  // Initialiser les menus déroulants
  toggleMenu(".filiale", ".detailF");
  toggleMenu(".equipement", ".detailE");
  toggleMenu(".admins", ".detailA");
   toggleMenu(".recherche", ".detailR");
  
  // Initialiser la gestion des formulaires
  setupFormHandling();
  
  // Initialiser le chargement dynamique
  enableDynamicLoad("a.load-page", "#content");
  
  // Vérifier les éléments requis au chargement initial

});
// ---- CHARGEMENT DYNAMIQUE DES PAGES ----------------
function enableDynamicLoad(selector, targetSelector) {
  const links = document.querySelectorAll(selector);
  const target = document.querySelector(targetSelector);

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const url = this.getAttribute("href");
      loadContent(url);
    });
  });
}

const initMap = {
  "/showUsers": () => initUserTable(),
  "/showEquipements": () => window.initEquipementTable(),
  "/showProprietaires": () => {
    initEquipementProprietaireTable();
    
  },
  "/showHistory": () => initEquipementHistoriqueTable(),
  "/showResearchEquipement": () => {
  loadFilialesInSelect();
  
  if (allEquipements.length === 0) {
    loadEquipementsInSelect();
  } else {
    populateEquipementSelectFromCache();
  }
  
  //  CORRECTION : Attacher les listeners après un délai
  setTimeout(() => {
    const searchSelect = document.querySelector('.rechercheContainer #equipement-select');
    const searchSelectFiliale = document.querySelector(' #filiale-select');

    if (searchSelect) {
      searchSelect.removeEventListener("change", handleSearchEquipementChange);
      searchSelect.addEventListener("change", handleSearchEquipementChange);
      console.log("✅ Listener équipement attaché");
    }
    
    if (searchSelectFiliale) {
      searchSelectFiliale.removeEventListener("change", handleFilialeChange);
      searchSelectFiliale.addEventListener("change", handleFilialeChange);
      console.log("✅ Listener filiale attaché");
    }
  }, 150); // Délai pour s'assurer que le DOM est prêt
},
    "/pageAddFicheTech": () => {
    populateEquipementSelectFromCache();
    setupEquipementChangeListener();
  },
  "/showFiliales":()=>initFilialeTable(),

};

function loadContent(url) {
  console.log("📥 LoadContent appelé pour :", url);
  const target = document.querySelector("#content");

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Erreur réseau : " + response.status);
      return response.text();
    })
    .then(html => {
      console.log("✅ Contenu chargé :", url);
      target.innerHTML = html;

      // Délai plus long pour certaines pages
      const delay = url === "/showHistory" ? 200 : 
                    url === "/pageAddFiliale" ? 150 : 100;

      if (initMap[url]) {
        setTimeout(initMap[url], delay);
      }
      
      if (url.includes("Proprietaire") || url.includes("proprietaire")) {
        setTimeout(() => {
          populateEquipementSelectFromCache();
          setupEquipementChangeListener();
        }, 100);
      }
    })
    .catch(err => {
      console.error("❌ Erreur loadContent :", err);
      target.innerHTML = "<p style='color:red'>Erreur de chargement : " + err.message + "</p>";
    });
}
//---- MENUS DÉROULANTS-------
function toggleMenu(triggerSelector, submenuSelector) {
  $(triggerSelector).on("mouseenter", function () {
    $("nav div").not(submenuSelector).slideUp();
    $(submenuSelector)
      .stop(true, true)
      .slideDown(function () {
        $(this).css("display", "flex").css("flex-direction", "column");
      });
  });

  $(submenuSelector).on("mouseleave", function () {
    $(this).slideUp();
  });
}
window.loadContent = loadContent;