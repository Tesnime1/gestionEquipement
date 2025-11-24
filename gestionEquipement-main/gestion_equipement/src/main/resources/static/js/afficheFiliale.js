// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
function initFilialeTable() {
  // Détruire l'instance existante s'il y en a déjà une
  if ($.fn.DataTable.isDataTable("#TableFiliale")) {
    $("#TableFiliale").DataTable().destroy();
  }

  try {
    $("#TableFiliale").DataTable({
      paging: false,
      searching: true,
      ordering: true,
      info: false,
      lengthChange: false,
      language: {
        url: "/js/i18n/fr-FR.json",
      },
      ajax: {
        url: "/Filiales",
        dataSrc: "",
        complete: function (xhr) {
          console.log("✅ AJAX Historique - Réponse complète:", xhr.status);
          console.log("📊 Données reçues filiales:", xhr.responseJSON);
          console.log(JSON.stringify(xhr.responseJSON, null, 2));
        },
        error: function (xhr, status, error) {
          console.error("❌ Erreur AJAX Historique:", error);
          console.error("❌ Status:", status);
          console.error("❌ Response:", xhr.responseText);
        },
      },
      columns: [
        { data: "nomFiliale" },
        { data: "adresseIp" },
        { data: "nomBdd" },
        { data: "userBdd" },
        { data: "passwordBdd" },
        {
          data: "dateCreation",
          render: function (data) {
            return data ? new Date(data).toLocaleDateString("fr-FR") : "—";
          },
        },

        {
          data: null,
          render: function (data, type, row) {
            return `<button class="btn btn-success btn-sm" 
                      onclick='showDetailsFiliale(${JSON.stringify(row)})'>
                     Modifier
                    </button>`;
          },
        },
      ],
      initComplete: function () {
        console.log("✅ DataTable Historique initialisée avec succès!");
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création de la DataTable:", error);
  }
}
function showDetailsFiliale(row) {
  console.log("📋 Détail Filiale :", row);

  let html = ` <div class="p-3"  data-id-filiale="${row.idFiliale}">
      <div class="mb-2">
        <label class="form-label">Nom Fililale :</label>
        <input class=" form-control nom-filiale" value="${
          row.nomFiliale
        }" required>
      </div>

      <div class="mb-2">
        <label class="form-label">Adresse Ip :</label>
        <input  class="form-control ip-filiale"  value="${
          row.adresseIp
        }" required>
      </div>

      <div class="mb-2">
        <label class="form-label">Nom Bdd :</label>
        <input class="form-control bdd-filiale" value="${row.nomBdd}" required>
      </div>

      <div class="mb-2">
        <label class="form-label">User Bdd:</label>
        <input  class="form-control user-filiale" value="${
          row.userBdd
        }"required>
      </div>
<div class="mb-2">
        <label class="form-label">password bdd:</label>
        <input class="form-control psw-filiale" value="${
          row.passwordBdd
        }"required>
      </div>
      <div class="mb-2">
        <label class="form-label">Date de creation:</label>
        <input class="form-control" value="${
          row.dateCreation
            ? new Date(row.dateCreation).toLocaleDateString("fr-FR")
            : ""
        }" readonly>
      </div>
      
  `;

  html += `
      </ul>
      <div class="mt-3 text-end">
        <button class="btn btn-success btn-sm btn-updateFiliale">Modifier</button>
      </div>
    </div>
  `;
  $("#modal-body").html(html);
  $("#modal .nav-popup h4").text("Détail filiale");
  $("#modal").css("display", "flex");
}
function updateFiliale(idFiliale, updatedData) {
  return fetch(`/${idFiliale}/updateFiliale`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  }).then((res) => {
    if (!res.ok) throw new Error("Erreur HTTP " + res.status);
    return res.json();
  });
}
$(document).on("click", ".btn-updateFiliale", function () {
  const $container = $(this).closest(".p-3");
  const filialeId = $container.data("id-filiale");

  const updatedData = {
    nomFiliale: $container.find(".nom-filiale").val(),
    adresseIp: $container.find(".ip-filiale").val(),
    nomBdd: $container.find(".bdd-filiale").val(),
    userBdd: $container.find(".user-filiale").val(),
    passwordBdd: $container.find(".psw-filiale").val(),
  };
  //verification de champs vides
  for (let key in updatedData) {
    if (!updatedData[key]) {
      customAlert("❌ Merci de remplir tous les champs !", "error");
      return; // ⛔ stop l'exécution
    }
  }

  updateFiliale(filialeId, updatedData)
    .then((data) => {
      customAlert("✅ Filiale mise à jour avec succès !", "success", true);
      console.log("📦 Réponse :", data);
      $("#TableFiliale").DataTable().ajax.reload(null, false);
    })
    .catch((err) => {
      customAlert("❌ Erreur lors de la mise à jour", "error");
      console.error(err);
    });
});
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
function closeModal() {
  $("#modal").css("display", "none");
  $("#modal-body").empty();

  // Reset du flag listener
  isEquipementSelectListenerAdded = false;
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

document.addEventListener("DOMContentLoaded", initFilialeTable);
