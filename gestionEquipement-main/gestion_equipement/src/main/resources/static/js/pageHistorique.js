// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
function openModalProprietaire(url, defaultNom, title) {
  console.log("📥 Ouverture modal :", url);
  
  $("#modal-body").load(url, function () {
    $("#modal").css("display", "flex");
    
    // Définir le titre si fourni
    if (title) {
      $("#modal .nav-popup h4").text(title);
    }
    
    // Pré-remplir le champ nom si fourni
    const inputNom = $("#modal-body").find("input[type='text']").first();
    if (inputNom.length && defaultNom) {
      inputNom.val(defaultNom);
    }
    
    // Reset du flag listener
    isEquipementSelectListenerAdded = false;
    
    // Charger les équipements et configurer le listener
    setTimeout(() => {
     
      loadFilialesInSelect();
      populateEquipementSelectFromCache();
      setupEquipementChangeListener();
      setupFilialeChangePourListeEmployes();
      onProprietaireSelect()
      
    }, 100);
  });
}
function closeModal() {
  console.log("🔒 Fermeture modal");
  $("#modal").css("display", "none");
  $("#modal-body").empty();
  
  // Reset du flag listener
  isEquipementSelectListenerAdded = false;
}
function showDetailsFicheTechHistoriqueValues(row) {
  console.log("📋 Détail propriétaire :", row);
  
  // Afficher le modal avec un loader
  let html = `
    <div class="p-3">
      <h6 class="mt-3">Fiche technique :</h6>
      <div class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
    </div>
  `;
  $("#modal-body").html(html);
  $("#modal .nav-popup h4").text("Détail propriétaire");
  $("#modal").css("display", "flex");
  
  // Charger les fiches techniques via AJAX
  $.ajax({
    url: `/equipement-instance/${row.idEquipementInst}`,
    method: 'GET',
    success: function(valeurs) {
    
      
      let ficheHtml = `
        <div class="p-3">
          <h6 class="mt-3">Fiche technique :</h6>
          <ul class="list-group" id="fiche-tech-list">
      `;
      
      if (valeurs && valeurs.length > 0) {
        valeurs.forEach(v => {
          ficheHtml += `
            <li class="list-group-item">
              <label class="form-label">${v.libelleFiche}</label>
              <input class="form-control fiche-input" 
                     data-id="${v.idValeur}" 
                     value="${v.valeur}" readonly>
            </li>`;
        });
      } else {
        ficheHtml += `<li class="list-group-item">Aucune fiche technique disponible</li>`;
      }
      
      $("#modal-body").html(ficheHtml);
    },
    error: function(xhr, status, error) {
      console.error("❌ Erreur lors du chargement des fiches:", error);
      $("#modal-body").html(`
        <div class="alert alert-danger">
          Erreur lors du chargement des fiches techniques
        </div>
      `);
    }
  });
}