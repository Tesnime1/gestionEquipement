// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;

function initEquipementTable() {
  // Détruire l'instance existante si elle existe
  if ($.fn.DataTable.isDataTable("#TableEquipement")) {
    $("#TableEquipement").DataTable().destroy();
  }

  // Initialiser le DataTable
  let table = $("#TableEquipement").DataTable({
    paging: false,
    responsive: true,
    scrollCollapse: true,
    scrollY: getScrollHeight(),
    autoWidth: false,
    searching: true,
    ordering: true,
    orderCellsTop: true,

    info: false,
    lengthChange: false,
    language: {
      url: "/js/i18n/fr-FR.json",
      emptyTable: "Aucun équipement disponible",
      zeroRecords: "Aucun équipement trouvé",
      loadingRecords: "Chargement en cours...",
    },
    ajax: {
      url: "/equipementFiches",
      dataSrc: "",
      complete: function (xhr) {
        allEquipements = xhr.responseJSON || [];
      },
      error: function (error) {
        console.error("Erreur lors du chargement des données:", error);
      },
    },
    columns: [
      {
        data: "libelleEquipement",
        className: "text-left",
      },
      {
        data: "fiches",
        className: "text-left",
        render: function (fiches) {
          if (!fiches || fiches.length === 0) return "—";
          return fiches.map((f) => f.libelle).join(", ");
        },
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        className: "text-center",
        render: function (data, type, row) {
          const id = row.idEquipement || row.id;
          return `<button class="btn btn-success btn-sm" onclick="openFicheModal(${id})">Modifier</button>`;
        },
      },
    ],
    drawCallback: function () {},
  });

  // 🔍 Configuration des filtres UNIQUEMENT pour les colonnes 0 et 1
  $("#TableEquipement thead tr:eq(1) th").each(function (index) {
    if (index === 0 || index === 1) {
      // Ajouter l'événement de filtrage pour les colonnes Nom et Détail
      $("input", this).on("keyup change clear", function () {
        const searchValue = this.value;

        if (table.column(index).search() !== searchValue) {
          table.column(index).search(searchValue).draw();
        }
      });
    } else {
      // Pour la colonne Action (index 2), on vide le contenu
      $(this).html("");
    }
  });

  // Fonction pour réinitialiser tous les filtres
  window.resetTableFilters = function () {
    $("#TableEquipement thead tr:eq(1) input").val("");
    table.columns().search("").draw();
  };
  return table;
}
// --------Popup equipement et filiale ,user
function openModal(url, defaultNom, title) {
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
  $("#modal").css("display", "none");
  $("#modal-body").empty();

  // Reset du flag listener
  isEquipementSelectListenerAdded = false;
}
// Fonction pour mettre à jour une fiche
function updateFiche(ficheId, newLibelle) {
  "📝 Mise à jour de la fiche:", ficheId, "=>", newLibelle;

  return fetch(`/${ficheId}/updateFiche`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ libelle: newLibelle }),
  }).then((res) => {
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
  if (!newLibelle) {
    customAlert("❌ Le libellé de la fiche ne peut pas être vide !", "error");
    return;
  }

  updateFiche(Id, newLibelle)
    .then(() => {
      customAlert("✅ Fiche technique mise à jour !", "success", false);
      $("#TableEquipement").DataTable().ajax.reload(null, false);
    })
    .catch((err) => {
      customAlert("❌ Erreur lors de la mise à jour", "error");
      console.error(err);
    });
});
// Fonction pour mettre à jour une fiche
function updateEquipement(IdEquipement, nouveauLibelle) {
  console.log(
    "📝 Mise à jour de la fiche:",
    IdEquipement,
    "=>",
    nouveauLibelle
  );

  return fetch(`/${IdEquipement}/updateEquipement`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ libelle: nouveauLibelle }),
  }).then((res) => {
    if (!res.ok) throw new Error("Erreur HTTP " + res.status);
    return res.json();
  });
}

// Gestion du clic sur le bouton "Modifier fiche tech"
$(document).on("click", ".updateEquipement", function () {
  const modal = $("#modal");
  const parent = $(this).closest(".list-group-item");
  const IdEquipement = currentFicheEquipementId; // <-- c’est l'équipement !
  const nouveauLibelle = $("#libelleEquipement").val();

  if (!nouveauLibelle) {
    customAlert("❌ Le nom de l'équipement ne peut pas être vide !", "error");
    return;
  }
  updateEquipement(IdEquipement, nouveauLibelle)
    .then(() => {
      customAlert("✅ équipement mise à jour !", "success", false);
      $("#TableEquipement").DataTable().ajax.reload(null, false);
    })
    .catch((err) => {
      customAlert("❌ Erreur lors de la mise à jour", "error");
      console.error(err);
    });
});

function openFicheModal(equipementId) {
  if (!equipementId) {
    console.error("openFicheModal: equipementId manquant");
    return;
  }

  currentFicheEquipementId = equipementId;

  //  Récupérer l’équipement depuis le cache
  const eq = allEquipements.find(
    (e) => (e.idEquipement || e.id) == equipementId
  );

  if (!eq) {
    console.error("Équipement introuvable dans allEquipements");
    return;
  }

  const equipementName = eq.libelleEquipement;
  const fiches = eq.fiches || [];

  // 🖼️ Affichage de la modale
  $("#modal .nav-popup h4").text(`Fiche technique — ${equipementName}`);
  $("#modal-body").html("<p>Chargement...</p>");
  $("#modal").css("display", "flex");

  // 📝 Construire la liste des fiches
  let html = `<div class="list-group">`;

  // ⭐ Input avec libelleEquipement
  html += `
     <div class="list-group-item d-flex gap-2 justify-content-between align-items-center">
      <label>Équipement:</label>
      <input class="form-control" id="libelleEquipement" value="${equipementName.replace(
        /"/g,
        "&quot;"
      )}">
      <button class="btn btn-warning btn-sm updateEquipement">Modifier</button>
    </div>
  `;

  // ⭐ Fiches techniques
  if (fiches.length === 0) {
    html += `<p>Aucune fiche technique pour cet équipement.</p>`;
  } else {
    fiches.forEach((f) => {
      const ficheId = f.idFicheTechnique || f.id || f.id_ficheTechnique;

      html += `
        <div class="list-group-item d-flex justify-content-between align-items-center fiche-item" data-fiche-id="${ficheId}">
         <div> <input class="form-control fiche-input" value="${f.libelle}"> </div> 
          <button class="btn btn-warning btn-sm updateft">Modifier</button> 
        </div>
     
      `;
    });
  }

  html += `</div>`;
  html += `
    <div class="text-end mt-3">
      <button id="btnModifierFiches" onclick="modifierEquipement()" class="btn btn-success">Modifier</button>
    </div>
  `;
  $("#modal-body").html(html);
}
function modifierEquipement() {
  const idEquipement = currentFicheEquipementId;
  const libelle = document.querySelector("#libelleEquipement").value;
  if (!libelle) {
    customAlert("❌ Le nom de l’équipement est obligatoire !", "error");
    return;
  }
  // Récupérer la liste des fiches
  const fiches = [];
  let erreur = false;
  document.querySelectorAll(".fiche-item").forEach((div) => {
    const id = div.dataset.ficheId;
    const lib = div.querySelector(".fiche-input").value.trim();

    if (!lib) {
      erreur = true;
    }

    fiches.push({
      idFicheTechnique: id,
      libelle: lib,
    });
  });

  if (erreur) {
    customAlert("❌ Toutes les fiches doivent être remplies !", "error");
    return;
  }

  const payload = {
    idEquipement,
    libelleEquipement: libelle,
    fiches,
    date: new Date().toISOString(),
  };

  fetch("/equipement/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erreur lors de la mise à jour !");
      return response.json();
    })
    .then((data) => {
      customAlert("Équipement modifié avec succès !", "success");
      "Réponse server :", data;
    })
    .catch((err) => console.error("Erreur :", err));
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
  return $(window).height() - 200 + "px";
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
function afficherFicheTechnique() {
  $(".container-add-ficheTech").css("display", "flex");
  $(".grp-btn").css("display", "none");
  $("#fiche-container").empty();
}

document.addEventListener("DOMContentLoaded", function () {
  initEquipementTable();
});
