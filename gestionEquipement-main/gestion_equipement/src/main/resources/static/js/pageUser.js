// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
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

function initUserTable() {
  console.log("📊 Initialisation DataTable Utilisateurs");
  
  // Détruire l'instance existante si elle existe
  if ($.fn.DataTable.isDataTable('#Table')) {
    $('#Table').DataTable().destroy();
  }
  
  $('#Table').DataTable({
    paging: false,
    searching: true,
    ordering: true,
    info: false,
    lengthChange: false,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
    },
    columnDefs: [
      { orderable: false, targets: [1, 2] }
    ],
    ajax: {
      url: "/Users", // ⚡ CORRECTION: Enlever localhost
      dataSrc: "",
      error: function (xhr) {
        console.error("❌ Erreur DataTable Users :", xhr.responseText);
      }
    },
    columns: [
      { data: "nom" },    
      { data: "role" },
    
  {
    data: null,
    render: (data, type, row) => 
      `<button class="btn btn-warning btn-sm" onclick="openPopupModifierUser('modalEdit', ${row.id})">Modifier</button>`
  }    ]
  });
}
function closeModal() {
  console.log("🔒 Fermeture modal");
  $("#modal").css("display", "none");
  $("#modal-body").empty();
  
  // Reset du flag listener
  isEquipementSelectListenerAdded = false;
}
function updateMotdePass(userId, newPassword) {
  return fetch(`/${userId}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }) // ✅ objet JSON
  })
  .then(res => {
    if (!res.ok) throw new Error("Erreur HTTP " + res.status);
    return res.text(); // 🔹 si le backend renvoie un texte simple
  });
}
//---------- Gestion du clic sur le bouton "Modifier"plateforme user
$(document).on("click", ".updateMotdePass", function () {
  const modal = $("#modalEdit");
  const userId = modal.data("user-id");
  const newPassword = $("#newPassword").val();

  if (!newPassword.trim()) {
    customAlert("Veuillez saisir un mot de passe.");
    return;
  }

  console.log("🔐 Mise à jour du mot de passe pour ID :", userId);

  updateMotdePass(userId, newPassword)
    .then(msg => {
      customAlert("mise a jour faite avec success " + msg);
      modal.hide();
    })
    .catch(err => {
      customAlert("❌ Erreur lors de la mise à jour");
      console.error(err);
    });
});
function openPopupModifierUser( Id,userId) {
    const modal = document.getElementById( Id);
    if (modal) {
        modal.style.display = "flex";
    }if (modal) {
    // stocke l'id utilisateur dans le modal
    $(modal).data("user-id", userId);

    // affiche le modal
    modal.style.display = "flex";
  } else {
    console.error("❌ Modal introuvable :", Id);
  }
}
function closePopupModifierUser(Id) {
    const modal = document.getElementById(Id);
    if (modal) {
        modal.style.display = "none";
    }
}