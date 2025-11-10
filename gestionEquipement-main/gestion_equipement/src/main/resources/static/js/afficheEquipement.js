// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;


function initEquipementTable() {
  console.log("📊 Initialisation DataTable Équipements");

  // Détruire l'instance existante si elle existe
  if ($.fn.DataTable.isDataTable('#TableEquipement')) {
    $('#TableEquipement').DataTable().destroy();
  }

  // Initialiser le DataTable
  let table = $('#TableEquipement').DataTable({
    paging: false,
    responsive: true,
    scrollCollapse: true,
    scrollY: getScrollHeight(),
    autoWidth: false,
    searching: true,
    ordering: true,
    info: false,
    lengthChange: false,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json",
      emptyTable: "Aucun équipement disponible",
      zeroRecords: "Aucun équipement trouvé",
      loadingRecords: "Chargement en cours..."
    },
    ajax: {
      url: "/equipementFiches",
      dataSrc: "",
 complete: function(xhr) {
        allEquipements = xhr.responseJSON || [];
        },
      error: function( error) {
        console.error("Erreur lors du chargement des données:", error);

      }
    },
    columns: [
      { 
        data: "libelleEquipement",
        className: "text-left"
      },
      {
        data: "fiches",
        className: "text-left",
        render: function (fiches) {
          if (!fiches || fiches.length === 0) return "—";
          return fiches.map(f => f.libelle).join(", ");
        }
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        className: "text-center",
        render: function (data, type, row) {
          const id = row.idEquipement || row.id;
          return `<button class="btn btn-success btn-sm" onclick="openFicheModal(${id})">Modifier</button>`;
        }
      }
    ],
    drawCallback: function() {
      console.log("✅ Tableau rechargé");
    }
  });

  // 🔍 Configuration des filtres UNIQUEMENT pour les colonnes 0 et 1
  $('#TableEquipement thead tr:eq(1) th').each(function(index) {
    if (index === 0 || index === 1) {
      // Ajouter l'événement de filtrage pour les colonnes Nom et Détail
      $('input', this).on('keyup change clear', function() {
        const searchValue = this.value;
        
        if (table.column(index).search() !== searchValue) {
          table.column(index).search(searchValue).draw();
        }
      });
    } else {
      // Pour la colonne Action (index 2), on vide le contenu
      $(this).html('');
    }
  });

  // Fonction pour réinitialiser tous les filtres
  window.resetTableFilters = function() {
    $('#TableEquipement thead tr:eq(1) input').val('');
    table.columns().search('').draw();
  };

  console.log("✅ DataTable initialisé avec succès");
  return table;
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
// Gestion du clic sur le bouton "Modifier fiche tech"
$(document).on("click", ".updateft", function () {
  const modal = $("#modal");
  const parent = $(this).closest(".list-group-item");
  const Id = parent.data("fiche-id");
  const newLibelle = parent.find("input").val();


  updateFiche(Id, newLibelle)
    .then(data => {
      customAlert("✅ Fiche technique mise à jour !","success",true);
         $('#TableEquipement').DataTable().ajax.reload(null, false);
      
      modal.hide();
    })
    .catch(err => {
      customAlert("❌ Erreur lors de la mise à jour","error");
      console.error(err);
    });
});
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

$(window).on('resize', function() {
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
  return ($(window).height() - 200) + "px";
}
function customAlert(message, type = "success", closeModal = false) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:9999;";
  
  const buttonColor = type === "success" ? "#198754" : "#dc3545";
  
  const box = document.createElement("div");
  box.style.cssText = "background:#fff;padding:2vw;border-radius:5px;text-align:center;min-width:40vw;box-shadow:0 5px 15px rgba(0,0,0,0.3);";
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
function afficherFicheTechnique() {
  $('.container-add-ficheTech').css('display', 'flex'); 
   $('.grp-btn').css('display', 'none'); 
   $('#fiche-container').empty();

}

document.addEventListener("DOMContentLoaded", function() {
    initEquipementTable();
});

