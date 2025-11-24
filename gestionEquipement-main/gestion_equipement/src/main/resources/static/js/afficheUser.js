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
function initUserTable() {
  $("#Table").DataTable({
    paging: false,
    responsive: true, // ✅ tableau adaptable
    scrollCollapse: true,
    scrollY: getScrollHeight(),
    autoWidth: false, // ✅ empêche DataTables de fixer des largeurs figées
    searching: true,
    ordering: true,
    info: false,
    lengthChange: false,
    language: {
      url: "/js/i18n/fr-FR.json",
    },
    columnDefs: [{ orderable: false, targets: [1, 2] }],
    ajax: {
      url: "/Users", //  CORRECTION: Enlever localhost
      dataSrc: "",
      error: function (xhr) {
        console.error("❌ Erreur DataTable Users :", xhr.responseText);
      },
    },
    columns: [
      { data: "nom" },
      { data: "role" },

      {
        data: null,
        render: (data, type, row) =>
          `<button class="btn btn-warning btn-sm" onclick="openPopupModifierUser('modalEdit', ${row.id})">Modifier</button>`,
      },
    ],
  });
}
// -------Fonction pour appeler l'API de mise à jour du mot de passe
function updateMotdePass(userId, newPassword) {
  return fetch(`/${userId}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }), // ✅ objet JSON
  }).then((res) => {
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
    customAlert("Veuillez saisir un mot de passe.", "error");
    return;
  }
  updateMotdePass(userId, newPassword)
    .then((msg) => {
      customAlert("mise a jour faite avec success " + msg, "success", true);
      modal.hide();
    })
    .catch((err) => {
      customAlert("❌ Erreur lors de la mise à jour", "error");
      console.error(err);
    });
});
// ------------GESTION MODALES--------
function openPopupModifierUser(Id, userId) {
  const modal = document.getElementById(Id);
  if (modal) {
    modal.style.display = "flex";
  }
  if (modal) {
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
document.addEventListener("DOMContentLoaded", initUserTable);
