// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;


function initEquipementTable() {
  console.log("📊 Initialisation DataTable Équipements");
  
  // Détruire l'instance existante si elle existe
  if ($.fn.DataTable.isDataTable('#TableEquipement')) {
    console.log("🗑️ Destruction instance existante");
    $('#TableEquipement').DataTable().destroy();
    equipementTableInstance = null; // ✅ Réinitialiser la référence
  }
  
  equipementTableInstance = $('#TableEquipement').DataTable({
    paging: false,
    searching: true,
    ordering: true,
    info: false,
    lengthChange: false,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
    },
    columnDefs: [
      { orderable: false, targets: [1] }
    ],
    ajax: {
      url: "/equipementFiches", 
        dataSrc: function(json) {
          window.allEquipements = json; // ✅ Utiliser window.
          console.log("📦 Équipements stockés dans le cache :", window.allEquipements.length);
          return json;
        },
      error: function (xhr) {
        console.error("❌ Erreur DataTable Equipements :", xhr.responseText);
      }
    },
    columns: [
      { data: "libelleEquipement" },
      {
        data: "fiches",
        render: function (fiches) {
          if (!fiches || fiches.length === 0) {
            return "—";
          }
          return fiches.map(f => f.libelle).join(", ");
        }
      },
      {
        data: null,
        render: function(data, type, row) {
          const id = row.idEquipement || row.id || row.id_equipement;
          return `<button class="btn btn-success btn-sm" onclick="openFicheModal(${id})">Modifier</button>`;
        }
      }
    ]
  });
}
// --------Popup equipement et filiale ,user
function openModal(url, defaultNom, title) {
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
    
  
 
  });
}
//-----------Popup Fiche technique
function openModalFt(url, defaultNom, title) {
  console.log("📥 Ouverture modal :", url);
  
  $("#modal-body").load(url, function () {
    $("#modal").css("display", "flex");
    
    // Définir le titre si fourni
    if (title) {
      $("#modal .nav-popup h4").text(title);
    }
    
    // Pré-remplir le champ nom si fourni
    const inputNom = $("#modalFiliale-body").find("input[type='text']").first();
    if (inputNom.length && defaultNom) {
      inputNom.val(defaultNom);
    }
    
    // Reset du flag listener
    isEquipementSelectListenerAdded = false;
    
    // Charger les équipements et configurer le listener
    setTimeout(() => {

      populateEquipementSelectFromCache();
      setupEquipementChangeListener();
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
// Fonction pour mettre à jour une fiche
function updateFiche(ficheId, newLibelle) {
  console.log("📝 Mise à jour de la fiche:", ficheId, "=>", newLibelle);

  return fetch(`/${ficheId}/updateFiche`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ libelle: newLibelle })
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur HTTP " + res.status);
      return res.json();
    });
}
function openFicheModal(equipementId) {
  if (!equipementId) {
    console.error("openFicheModal: equipementId manquant");
    return;
  }

  currentFicheEquipementId = equipementId;
  console.log("🔎 Ouvrir modal fiches pour equipement:", equipementId);

  // Optional: trouver le nom de l'équipement depuis le cache allEquipements
  const eq = allEquipements.find(e => (e.idEquipement || e.id || e.id_equipement) == equipementId);
  const equipementName = eq ? eq.libelleEquipement : `#${equipementId}`;
 console.error("name manquant",eq  );
  // loader
  $("#modal .nav-popup h4").text(`Fiche technique — ${equipementName}`);
  $("#modal-body").html("<p>🔄 Chargement des fiches...</p>");
  $("#modal").css("display", "flex");

  fetch(`/equipement/${equipementId}`)
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(fiches => {
      if (!Array.isArray(fiches) || fiches.length === 0) {
        $("#modal-body").html("<p>Aucune fiche technique pour cet équipement.</p>");
        return;
      }

      let html = `<div class="list-group">`;
      fiches.forEach(f => {
        // adapter le nom de l'id suivant le JSON (id_ficheTechnique / idFicheTechnique / id)
        const ficheId = f.id_ficheTechnique || f.idFicheTechnique || f.id || f.id_ficheTechnique;
        const libelle = f.libelle || "—";
        html += `
          <div class="list-group-item d-flex justify-content-between align-items-center" data-fiche-id="${ficheId}">
            <div>
            <input class="form-control"  value="${libelle}">
            </div>
            <button class="btn btn-warning btn-sm updateft" >Modifier</button>

          </div>
        `;
      });
      html += `</div>`;

      $("#modal-body").html(html);
    })
    .catch(err => {
      console.error("Erreur chargement fiches :", err);
      $("#modal-body").html(`<div class="alert alert-danger">Erreur: ${err.message}</div>`);
    });
}
window.initEquipementTable = initEquipementTable;