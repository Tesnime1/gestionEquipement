// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
function loadFilialesInSelect() {
  // Un seul select à cibler
  const selectFiliale = document.querySelector("#filiale-select");
  if (selectFiliale) {
    selectFiliale.innerHTML =
      '<option value="" > -- Sélectionnez une filiale--</option>';
  }
  fetch("/NomIdFiliales")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur HTTP : " + response.status);
      return response.json();
    })
    .then((filiales) => {
      // Ajouter les options
      filiales.forEach((filiale) => {
        const option = document.createElement("option");
        option.value = filiale.idfiliale;
        option.textContent = filiale.nomFiliale;
        selectFiliale.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("❌ Erreur chargement filiales :", error);
      selectFiliale.innerHTML =
        '<option value="">❌ Erreur de chargement</option>';
    });
}
function loadEquipementsInSelect() {
  console.log("📦 Chargement des équipements");

  const searchSelect = document.querySelector(
    ".rechercheContainer #equipement-select"
  );
  const addSelect = document.querySelector(".container-add #equipement-select");

  // Reset affichage initial
  [searchSelect, addSelect].forEach((select) => {
    if (select) {
      select.innerHTML = '<option value="">⏳ Chargement...</option>';
    }
  });

  fetch("/Equipements", {
    method: "GET",
    credentials: "include",
    headers: { "Cache-Control": "no-cache" },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erreur HTTP : " + response.status);
      return response.json();
    })
    .then((equipements) => {
      console.log(`✅ ${equipements.length} équipements chargés`);

      allEquipements = equipements;

      [searchSelect, addSelect].forEach((select, index) => {
        if (select) {
          select.innerHTML =
            '<option value="">-- Choisir un équipement --</option>';

          equipements.forEach((equipement) => {
            const option = document.createElement("option");
            option.value = equipement.idEquipement || equipement.id;
            option.textContent = equipement.libelle;
            select.appendChild(option);
          });

          // ✅ Utiliser des namespaces différents pour éviter les conflits
          if (index === 0) {
            $(select)
              .off("change.search")
              .on("change.search", handleSearchEquipementChange);
          } else {
            $(select)
              .off("change.add")
              .on("change.add", handleEquipementChange);
          }
        }
      });
    })
    .catch((error) => {
      console.error("❌ Erreur chargement équipements :", error);
      [searchSelect, addSelect].forEach((select) => {
        if (select) {
          select.innerHTML =
            '<option value="">❌ Erreur de chargement</option>';
        }
      });
    });
}
function loadFichesTechniquesAndValeurs(equipementId) {
  // ✅ Permettre de passer l'ID en paramètre OU le récupérer du select
  if (!equipementId) {
    const select = document.getElementById("equipement-select");
    equipementId = select ? select.value : null;
  }
  if (!equipementId) {
    console.warn("⚠️ Aucun équipement sélectionné");
    const container = document.getElementById("ficheTechContainer");
    if (container) container.innerHTML = "";
    return;
  }

  console.log(
    "📊 Chargement des fiches techniques pour l'équipement ID:",
    equipementId
  );
  fetch(`/byEquipement?idEquipement=${equipementId}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Erreur HTTP: " + res.status);
      }
      return res.json();
    })
    .then((data) => {
      console.log("✅ Fiches reçues:", data);

      // Regrouper par ficheTechnique.libelle
      const grouped = {};
      data.forEach((item) => {
        const libelle = item.libelleFiche;
        if (!grouped[libelle]) {
          grouped[libelle] = [];
        }
        grouped[libelle].push({
          id: item.idValeur,
          valeur: item.valeur,
        });
      });
      const container = document.getElementById("ficheTechContainer");
      if (!container) {
        console.warn("⚠️ Conteneur ficheTechContainer introuvable");
        return;
      }
      container.innerHTML = "";

      if (Object.keys(grouped).length === 0) {
        container.innerHTML =
          '<p class="no-data">Aucune fiche technique disponible pour cet équipement</p>';
        return;
      }

      // Générer les divs
      Object.keys(grouped).forEach((libelle) => {
        const div = document.createElement("div");
        div.classList.add("fiche-row");

        const label = document.createElement("label");
        label.textContent = libelle;
        label.classList.add("fiche-label");

        const select = document.createElement("select");
        select.classList.add("fiche-select");

        // Option par défaut
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Toutes";
        select.appendChild(defaultOption);

        // Ajouter les valeurs uniques
        const seen = new Set();
        grouped[libelle].forEach((obj) => {
          if (!seen.has(obj.valeur)) {
            seen.add(obj.valeur);
            const opt = document.createElement("option");
            opt.value = obj.valeur;
            opt.textContent = obj.valeur;
            select.appendChild(opt);
          }
        });

        div.appendChild(label);
        div.appendChild(select);
        container.appendChild(div);
      });

      console.log(
        `✅ ${Object.keys(grouped).length} fiche(s) technique(s) affichée(s)`
      );
    })
    .catch((err) => {
      console.error("❌ Erreur chargement fiches:", err);
      const container = document.getElementById("ficheTechContainer");
      if (container) {
        container.innerHTML =
          '<p class="error-message">❌ Erreur lors du chargement des fiches techniques</p>';
      }
    });
}

function initTableSearchEquipement() {
  const equipementId = document.querySelector("#equipement-select").value;
  const filialeId = document.querySelector("#filiale-select")?.value;

  // Récupérer les valeurs des fiches techniques
  let valeurs = [];
  document.querySelectorAll(".fiche-select").forEach((select) => {
    if (select.value) {
      valeurs.push(select.value);
    }
  });

  // Récupérer les détails de la filiale (direction, département, etc.)
  let filialeDetails = {};
  document
    .querySelectorAll("#filialeDetailsContainer select")
    .forEach((select) => {
      if (select.value) {
        filialeDetails[select.name] = select.value;
      }
    });

  // Construire l'URL
  let url = `/search?equipementId=${equipementId}`;

  if (filialeId) {
    url += `&filialeId=${filialeId}`;
  }

  if (valeurs.length > 0) {
    url += `&valeurs=${valeurs.map((v) => encodeURIComponent(v)).join(",")}`;
  }

  // Ajouter les détails de la filiale (direction, département, fonction, unité)
  if (Object.keys(filialeDetails).length > 0) {
    Object.entries(filialeDetails).forEach(([key, value]) => {
      url += `&${key}=${encodeURIComponent(value)}`;
    });
  }
  // Conteneur
  const container = document.querySelector("#table-container");
  container.innerHTML = `
    <table id="TableParValeur" class="table table-striped">
      <thead>
        <tr>
           <th>Mat</th>
          <th>Nom </th>
          <th>Prénom</th>
          <th>Direction</th>        
          <th>Fonction</th>
          <th>Matériel</th>
          <th>Ajouté Par</th>
          <th>Date d'ajout</th>
          <th>Valeurs</th>
          <th>Historique</th>
        </tr>
      </thead>
    </table>
  `;

  // Détruire et recréer la table
  if ($.fn.DataTable.isDataTable("#TableParValeur")) {
    $("#TableParValeur").DataTable().destroy();
  }

  $("#TableParValeur").DataTable({
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
    ajax: {
      url: url,
      dataSrc: "",
      error: function (xhr, status, error) {
        console.error("❌ Erreur chargement données:", error);
        customAlert("Erreur lors du chargement des données", "error");
      },
    },
    columns: [
      { data: "matricule" },
      { data: "nomProprietaire" },
      { data: "prenomProprietaire" },

      { data: "direction" },
      { data: "fonction" },
      { data: "equipement" },
      { data: "ajouterPar" },
      {
        data: "dateDajout",
        render: function (data) {
          return data ? new Date(data).toLocaleDateString("fr-FR") : "—";
        },
      },
      {
        data: "valeurs",
        render: function (valeurs) {
          if (!valeurs || valeurs.length === 0) return "—";
          return valeurs
            .map((v) => `${v.libelleFiche}: ${v.valeur}`)
            .join(" |");
        },
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        className: "text-center",
        render: (data, type, row) => {
          return `
        <button class="btn btn-success btn-sm" 
                data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}'
                onclick='showhistoriqueEquipement(this)'>
         historique
        </button>`;
        },
      },
    ],
  });
}
function showhistoriqueEquipement(btn) {
  const row = JSON.parse(btn.getAttribute("data-row"));
  const idInst = row.idEquipementInst;

  if (!idInst) {
    console.error("❌ idEquipementInst introuvable");
    return;
  }

  fetch(`/historique/${idInst}`)
    .then((res) => res.json())
    .then((data) => afficherHistoriquePopup(data))
    .catch((err) => console.error("Erreur chargement historique:", err));
}
function afficherHistoriquePopup(list) {
  if (!list || list.length === 0) {
    customAlert("Aucun historique disponible", "error");
    return;
  }
  let html = `
        <div class="modal fade show" style="display:flex; background:rgba(0,0,0,.5)">
           
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Historique des propriétaires</h5>
                        <button class="btn btn-danger" onclick="closeHistoriquePopup()">X</button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Ancien Proprietaire </th>
                                     <th>nouveau proprietaire</th>
                                    <th>Date Début</th>
                                    <th>Date Fin</th>
                                </tr>
                            </thead>
                            <tbody>
    `;

  list.forEach((h) => {
    html += `
            <tr>
                <td>${
                  h.ancienneMatricule + " " + " " + h.ancienProprietaire || "—"
                }</td>
              
                
                <td>${h.nouveauProprietaire || "—"}</td>
                
                <td>${
                  h.ancienneDate
                    ? new Date(h.ancienneDate).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "—"
                }</td>
         <td>${
           h.dateModification
             ? new Date(h.dateModification).toLocaleDateString("fr-FR", {
                 day: "2-digit",
                 month: "2-digit",
                 year: "numeric",
                 hour: "2-digit",
                 minute: "2-digit",
                 second: "2-digit",
               })
             : "—"
         }</td>
            </tr>
        `;
  });

  html += `
                            </tbody>
                        </table>
                    </div>
            </div>
        </div>
    `;

  // Injecter dans la page
  document.body.insertAdjacentHTML("beforeend", html);
}
function closeHistoriquePopup() {
  document.querySelectorAll(".modal").forEach((m) => m.remove());
}
function setupEquipementChangeListener() {
  if (isEquipementSelectListenerAdded) {
    console.log("⚠️ Listener déjà attaché");
    return;
  }

  const equipementSelect = document.getElementById("equipement-select");

  if (!equipementSelect) {
    console.warn("⚠️ Select equipement-select introuvable");
    return;
  }

  // ✅ Utiliser jQuery avec namespace
  $(equipementSelect)
    .off("change.fichetech")
    .on("change.fichetech", handleEquipementChange);
  isEquipementSelectListenerAdded = true;
  console.log("✅ Listener équipement attaché");
}

function handleEquipementChange(event) {
  const equipementId = event.target.value;
  const container = document.getElementById("fiche-valeurs-container");

  console.log("📋 Changement équipement:", equipementId);

  if (!container) {
    console.error("❌ Container 'fiche-valeurs-container' non trouvé !");
    return;
  }

  container.innerHTML = "";

  if (!equipementId || equipementId === "") {
    container.innerHTML =
      "<p class='text-muted'>Veuillez sélectionner un équipement</p>";
    return;
  }

  container.innerHTML = "<p>🔄 Chargement des fiches techniques...</p>";

  fetch(`/equipement/${equipementId}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((fiches) => {
      if (!fiches || !Array.isArray(fiches) || fiches.length === 0) {
        container.innerHTML =
          "<p class='alert alert-warning'>⚠️ Aucune fiche technique trouvée</p>";
        return;
      }

      let html = "<div class='fiches-techniques'><h6>Fiches techniques :</h6>";

      fiches.forEach((fiche) => {
        const ficheId =
          fiche.id_ficheTechnique || fiche.idFicheTechnique || fiche.id;

        if (!ficheId) {
          console.error("❌ ID fiche manquant:", fiche);
          return;
        }

        html += `
          <div class="fiche-valeur-item mb-3 p-3 border rounded" data-fiche-id="${ficheId}">
            <label class="form-label fw-bold">${fiche.libelle}</label>
            <input type="hidden" name="ficheId_${ficheId}" value="${ficheId}">
            <input type="text" 
                   class="form-control" 
                   name="valeur_${ficheId}" 
                   placeholder="Entrez la valeur pour ${fiche.libelle}" 
                   required>
          </div>
        `;
      });

      html += "</div>";
      container.innerHTML = html;

      console.log("✅ Fiches techniques affichées");
    })
    .catch((error) => {
      console.error("❌ Erreur chargement fiches :", error);
      container.innerHTML = `
        <div class="alert alert-danger">
          <strong>❌ Erreur</strong><br>
          ${error.message}
        </div>
      `;
    });
}
function handleFilialeChange(event) {
  const filialeId = event.target.value;
  console.log("🏢 Filiale sélectionnée:", filialeId);

  if (!filialeId) {
    console.warn("⚠️ Aucune filiale sélectionnée");
    const container = document.getElementById("filialeDetailsContainer");
    if (container) container.innerHTML = "";
    return;
  }

  chargerDetailsFiliale(filialeId, "#filialeDetailsContainer");
}
// --------- GESTION ÉQUIPEMENTS DANS SELECT-------
function populateEquipementSelectFromCache() {
  console.log("📋 Population du select depuis le cache");

  const select = document.getElementById("equipement-select");
  if (!select) {
    console.warn("⚠️ Select equipement-select introuvable");
    return;
  }

  // Si pas d'équipements en cache, essayer de les charger
  if (allEquipements.length === 0) {
    console.log("📥 Cache vide, chargement des équipements...");
    loadEquipementsInSelect();
    return;
  }

  select.innerHTML =
    '<option value="">-- Sélectionnez un équipement --</option>';

  allEquipements.forEach((eq) => {
    const option = document.createElement("option");
    option.value = eq.idEquipement || eq.id;
    option.textContent = eq.libelleEquipement || eq.libelle;
    select.appendChild(option);
  });

  console.log(`✅ ${allEquipements.length} équipements ajoutés au select`);
}
function handleSearchEquipementChange(event) {
  const equipementId = event.target.value;
  console.log("🔍 Recherche pour équipement:", equipementId);
  if (equipementId) {
    loadFichesTechniquesAndValeurs(equipementId);
  }
}

function handleFilialeChange(event) {
  const filialeId = event.target.value;
  console.log("🏢 Filiale sélectionnée:", filialeId);

  if (!filialeId) {
    console.warn("⚠️ Aucune filiale sélectionnée");
    const container = document.getElementById("filialeDetailsContainer");
    if (container) container.innerHTML = "";
    return;
  }

  chargerDetailsFiliale(filialeId, "#filialeDetailsContainer");
}
function chargerDetailsFiliale(filialeId, containerSelector) {
  const container = $(containerSelector);
  console.log("📦 Container jQuery trouvé:", container.length, "élément(s)");

  if (container.length === 0) {
    console.error(`❌ Container ${containerSelector} introuvable dans le DOM`);
    console.log(
      "🔍 Containers disponibles:",
      Array.from(document.querySelectorAll('[id*="filiale"]')).map(
        (el) => "#" + el.id
      )
    );
    return;
  }

  if (!filialeId) {
    console.warn("⚠️ filialeId vide ou null");
    container.html(
      '<p class="text-muted">Veuillez sélectionner une filiale</p>'
    );
    return;
  }

  fetch(`/details-filiale/${filialeId}`)
    .then((response) => {
      console.log("📡 Réponse reçue, status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((details) => {
      container.empty();
      if (!details || details.length === 0) {
        container.append(
          '<p class="alert alert-warning">Aucune donnée disponible pour cette filiale.</p>'
        );
        return;
      }

      const keys = Object.keys(details[0]).filter(
        (key) =>
          key !== "filialeId" &&
          key !== "idFiliale" &&
          key !== "idfiliale" &&
          key !== "id"
      );
      console.log("🔑 Clés trouvées:", keys);

      keys.forEach((key) => {
        // Créer la div conteneur
        const divContainer = $("<div>").addClass("fiche-row"); // ou toute autre classe CSS que tu veux

        const label = $("<label>")
          .attr("for", `${key}-select`)
          .addClass("form-label")
          .text(key.charAt(0).toUpperCase() + key.slice(1));

        const select = $("<select>")
          .attr("id", `${key}-select`)
          .attr("name", key)
          .addClass("form-select");
        select.append(`<option value="">-- Tous --</option>`);

        const uniqueValues = new Set();
        details.forEach((item) => {
          if (item[key]) uniqueValues.add(item[key]);
        });

        console.log(`   ${key}: ${uniqueValues.size} valeurs uniques`);

        uniqueValues.forEach((val) => {
          select.append(`<option value="${val}">${val}</option>`);
        });
        // Ajouter le label et le select à la div
        divContainer.append(label);
        divContainer.append(select);

        container.append(divContainer);
      });

      console.log("✅ Formulaire généré avec succès");
    })
    .catch((err) => {
      console.error("❌ Erreur chargement détails filiale:", err);
      container.html(`
                <div class="alert alert-danger">
                    <strong>❌ Erreur</strong><br>
                    ${err.message}
                </div>
            `);
    });
}
function initSearchPageListeners() {
  console.log("🔧 Initialisation listeners page recherche");

  // Attendre que le DOM soit vraiment prêt
  const checkAndAttach = () => {
    const searchSelect = document.querySelector(
      ".rechercheContainer #equipement-select"
    );
    const searchSelectFiliale = document.querySelector("#filiale-select");

    if (!searchSelect || !searchSelectFiliale) {
      console.warn("⚠️ Éléments non trouvés, nouvelle tentative...");
      return false;
    }

    // Supprimer les anciens listeners avec namespace
    $(searchSelect).off("change.search");
    $(searchSelectFiliale).off("change.search");

    // Attacher les nouveaux avec namespace
    $(searchSelect).on("change.search", handleSearchEquipementChange);
    $(searchSelectFiliale).on("change.search", handleFilialeChange);

    console.log("✅ Listeners attachés avec succès");
    return true;
  };

  // Essayer d'attacher immédiatement, sinon réessayer
  if (!checkAndAttach()) {
    setTimeout(checkAndAttach, 100);
  }
}
function getScrollHeight() {
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
document.addEventListener("DOMContentLoaded", function () {
  loadFilialesInSelect();
  loadEquipementsInSelect();
  initSearchPageListeners();
});
