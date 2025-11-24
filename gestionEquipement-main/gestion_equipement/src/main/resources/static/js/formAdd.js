function setupFormHandling() {
  console.log("🎯 Configuration gestion des formulaires");

  const formConfigs = {
    addAdmin: {
      endpoint: "/addUser",
      successMessage: (result) => `✅ Utilisateur ajouté : ${result.nom}`,
      tableToReload: "#Table",
    },
    addEquipementform: {
      endpoint: "/addEquipementAndFicheTech",
      successMessage: (result) => `✅ Équipement ajouté : ${result.libelle}`,
      customDataProcessor: processEquipementWithFichesData,
      tableToReload: "#TableEquipement",
    },
    addFichetech: {
      endpoint: "/addFichTech",
      successMessage: (result) =>
        `✅ ${result.length} fiche(s) technique(s) ajoutée(s)`,
      customDataProcessor: processFicheTechData2024,
      tableToReload: "#TableEquipement",
    },
    addProprietaire: {
      endpoint: "/addProprietaire",
      successMessage: (result) =>
        `✅ Propriétaire ajouté : ${result.nomProprietaire}`,
      tableToReload: "#TableEquipementProprietaire",
      customDataProcessor: processProprietaireData,
      setupFilialeChangePourListeEmployes,
      // Appelle cette fonction au chargement de la page ou lors de l’ouverture du formulaire
    },

    addFiliale: {
      endpoint: "/addFiliale",
      successMessage: (result) => `✅ filiale ajouté : ${result.nomFiliale}`,
      tableToReload: "#TableFiliale",
    },
  };
  console.log("📋 Formulaires configurés :", Object.keys(formConfigs));
  // Supprimer les anciens écouteurs pour éviter les doublons
  $(document).off(
    "submit",
    Object.keys(formConfigs)
      .map((id) => `#${id}`)
      .join(",")
  );

  // Gestion unifiée avec délégation d'événements
  $(document).on(
    "submit",
    Object.keys(formConfigs)
      .map((id) => `#${id}`)
      .join(","),
    function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const formId = this.id;
      const config = formConfigs[formId];

      if (!config) {
        console.warn(`⚠️ Configuration introuvable pour : ${formId}`);
        return;
      }

      handleFormSubmission(this, config);
    }
  );

  // Gestion bouton ajout caractéristique
  $(document).off("click", "#add-caracteristique-btn");
  $(document).on(
    "click",
    '[onclick="addFiche()"], #add-caracteristique-btn',
    function (e) {
      e.preventDefault();
      addFiche();
    }
  );
}
//  Fonction utilitaire pour recharger la table
function reloadEquipementTable() {
  console.log("🔄 Rechargement table Équipements");

  if (equipementTableInstance) {
    equipementTableInstance.ajax.reload(null, false);
    console.log("✅ Table rechargée avec succès");
  } else {
    console.warn("⚠️ Pas d'instance trouvée, tentative standard...");
    if ($.fn.DataTable.isDataTable("#TableEquipement")) {
      $("#TableEquipement").DataTable().ajax.reload();
    }
  }
}

function handleFormSubmission(form, config) {
  console.log(`🚀 Soumission formulaire : ${form.id}`);

  if ($(form).data("submitting")) {
    console.log("⚠️ Soumission déjà en cours");
    return;
  }
  $(form).data("submitting", true);

  const $button = $(form).find('button[type="submit"]');
  const originalText = $button.text();
  $button.prop("disabled", true).text("En cours...");

  const formData = new FormData(form);
  let data = Object.fromEntries(formData.entries());

  if (config.customDataProcessor) {
    data = config.customDataProcessor(form, data);
  }

  console.log(`📤 Envoi données :`, data);

  fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erreur serveur : " + res.status);
      return res.json();
    })
    .then((result) => {
      customAlert("✅ Mise à jour faite avec succès !", "success", true);

      //  UTILISER LA FONCTION DÉDIÉE pour recharger
      if (config.tableToReload === "#TableEquipement") {
        console.log("🎯 Rechargement via fonction dédiée");
        reloadEquipementTable();
      } else if (config.tableToReload) {
        console.log(` Rechargement standard pour ${config.tableToReload}`);
        // Pour les autres tables
        setTimeout(() => {
          if ($.fn.DataTable.isDataTable(config.tableToReload)) {
            $(config.tableToReload).DataTable().ajax.reload();
          }
        }, 50);
      } else {
        console.warn("⚠️ Pas de tableToReload défini!");
      }

      form.reset();
    })
    .catch((err) => {
      console.error(`❌ Erreur :`, err);
      customAlert("❌ Données existe Déja, Données non envoyées !", "error");
    })
    .finally(() => {
      $(form).data("submitting", false);
      $button.prop("disabled", false).text(originalText);
    });
}
// --------- CHARGEMENT ÉQUIPEMENTS DANS SELECTS -------
function loadEquipementsInSelect() {
  console.log("📥 Chargement des équipements pour tous les selects");

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

  fetch("/Equipements")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur HTTP : " + response.status);
      return response.json();
    })
    .then((equipements) => {
      console.log("✅ Équipements récupérés :", equipements);

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

          // ✅ Attacher le listener avec le bon contexte
          if (index === 0) {
            // Recherche : utiliser une fonction fléchée pour préserver le contexte
            select.removeEventListener("change", handleSearchEquipementChange);
            select.addEventListener("change", handleSearchEquipementChange);
            console.log("🔗 Listener recherche branché");
          } else {
            // Ajout propriétaire
            select.removeEventListener("change", handleEquipementChange);
            select.addEventListener("change", handleEquipementChange);
            console.log("🔗 Listener ajout branché");
          }
        }
      });

      console.log(`✅ ${equipements.length} équipements ajoutés aux selects`);
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
// form fichetech_valeur (form add proprietaire)
function handleEquipementChange(event) {
  console.log("🔄 Changement d'équipement détecté");

  const equipementId = event.target.value;
  const container = document.getElementById("fiche-valeurs-container");

  console.log("📋 Equipement sélectionné :", equipementId);

  if (!container) {
    console.error("❌ Container 'fiche-valeurs-container' non trouvé !");
    return;
  }
  // Reset du container
  container.innerHTML = "";
  // Si aucun équipement sélectionné
  if (!equipementId || equipementId === "") {
    console.log("ℹ Aucun équipement sélectionné");
    container.innerHTML =
      "<p class='text-muted'>Veuillez sélectionner un équipement</p>";
    return;
  }

  // Afficher un loader pendant le chargement
  container.innerHTML = "<p>🔄 Chargement des fiches techniques...</p>";
  console.log("🌐 Appel API vers :", `/equipement/${equipementId}`);

  fetch(`/equipement/${equipementId}`)
    .then((response) => {
      console.log("📡 Réponse reçue, status :", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((fiches) => {
      console.log("📋 Fiches reçues :", fiches);

      if (!fiches || !Array.isArray(fiches) || fiches.length === 0) {
        container.innerHTML =
          "<p class='alert alert-warning'>⚠️ Aucune fiche technique trouvée pour cet équipement</p>";
        return;
      }

      // Créer les éléments pour chaque fiche
      let html = "<div class='fiches-techniques  p-3 border rounded'>";
      html += "<h6>Fiches techniques de l'équipement :</h6>";

      fiches.forEach((fiche, index) => {
        // ✅ CORRECTION: Le bon nom de propriété est "id_ficheTechnique"
        const ficheId =
          fiche.id_ficheTechnique || fiche.idFicheTechnique || fiche.id;
        console.log(`📄 ficheId final:`, ficheId);

        if (!ficheId) {
          console.error("❌ Impossible de récupérer l'ID de la fiche:", fiche);
          return; // Ignorer cette fiche
        }

        html += `
          <div class="fiche-valeur-item " data-fiche-id="${ficheId}">
            <div class="input-group flex-nowrap">
            <span class="input-group-text" id="addon-wrapping">${fiche.libelle}:</span>
              <input type="text" 
                   class="form-control" 
                   name="valeur_${ficheId}" 
                   placeholder="Entrez la valeur pour ${fiche.libelle}" 
                   required>
                   </div>
            <input type="hidden" 
                   name="ficheId_${ficheId}" 
                   value="${ficheId}">
            
          </div>
        `;
      });

      html += "</div>";
      container.innerHTML = html;

      console.log("✅ Fiches techniques affichées avec succès");
    })
    .catch((error) => {
      console.error("❌ Erreur lors du chargement des fiches :", error);
      container.innerHTML = `
        <div class="alert alert-danger">
          <strong>❌ Erreur de chargement</strong><br>
          ${error.message}<br>
          <small>Vérifiez la console pour plus de détails</small>
        </div>
      `;
    });
}
// ---- TRAITEMENT SPÉCIAL FICHE TECHNIQUE
function processFicheTechData2024(form, data) {
  console.log("🔧 Traitement données addFichetech (format 2024)");

  const equipementId = $(form).find('select[name="equipement"]').val();
  const libelles = [];

  // Récupérer le libellé principal
  const libellePrincipal = $(form).find('input[name="libelle"]').val();
  if (libellePrincipal && libellePrincipal.trim()) {
    libelles.push(libellePrincipal.trim());
  }

  // Récupérer les caractéristiques dynamiques
  $(form)
    .find('#fiche-container input[type="text"]')
    .each(function () {
      if ($(this).val().trim() !== "") {
        libelles.push($(this).val().trim());
      }
    });

  const processedData = {
    equipementId: parseInt(equipementId),
    libelles: libelles,
  };

  console.log("🔧 Données traitées (format 2024) :", processedData);
  return processedData;
}
// -------GESTION CARACTÉRISTIQUES DYNAMIQUE-----------
function addFiche() {
  console.log("➕ Ajout caractéristique");

  const container = document.getElementById("fiche-container");
  if (!container) {
    console.error("❌ Container fiche-container introuvable");
    return;
  }

  const index = container.children.length + 1;
  const div = document.createElement("div");
  div.className = "fiche-item";
  div.style.cssText =
    "margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;";

  div.innerHTML = `
    <label>Caractéristique ${index} :</label>
    <input type="text" name="caracteristique_${index}" placeholder="Ex: RAM , Processeur ..." >
    <button type="button" onclick="removeFiche(this)" style="background: #dc3545; color: white; border: none;border-radius: 3px; cursor: pointer;">Supprimer</button>
  `;

  container.appendChild(div);
  // Attacher l'événement au bouton qui vient d'être créé
  div.querySelector(".btn-remove-fiche").addEventListener("click", function () {
    removeFiche(this);
  });
}
function removeFiche(button) {
  console.log("🗑️ Suppression caractéristique");
  button.closest(".fiche-item").remove();
}
$(document).ready(function () {
  setupFormHandling();
  console.log("✅ Gestion des formulaires initialisée");
});
$(document).on("keydown", "form", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Empêche la soumission
    return false;
  }
});

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
function processProprietaireData(form, data) {
  // Récupération optimisée des champs via destructuring-like pattern
  const getFieldValue = (selector) => {
    const element = form.querySelector(selector);
    return element ? element.value : "";
  };

  // Récupérer toutes les valeurs en une seule passe
  const [equipementId, filialeId] = [
    getFieldValue('select[name="equipement"]'),
    getFieldValue('select[name="filiale"]'),
  ].map((v) => (v ? Number(v) : null));

  const [nom, prenom, fonction, departement, direction, matricule, unite] = [
    "nom",
    "prenom",
    "fonction",
    "departement",
    "direction",
    "matricule",
    "unite",
    "scanner",
  ].map((name) => getFieldValue(`input[name="${name}"]`));

  // Récupérer et transformer les valeurs des fiches techniques
  const valeurs = Array.from(document.querySelectorAll(".fiche-valeur-item"))
    .map((item) => {
      const ficheId = item.getAttribute("data-fiche-id");
      const valeur = item.querySelector("input[name^='valeur']")?.value?.trim();

      if (!ficheId || !valeur) return null;

      console.log(`📊 Fiche ID: ${ficheId}, Valeur: ${valeur}`);
      return {
        ficheTechId: Number(ficheId),
        valeur,
      };
    })
    .filter(Boolean); // Supprime les entrées null

  // Construire le DTO
  const processedData = {
    nom,
    prenom,
    fonction,
    departement,
    direction,
    matricule,
    unite,
    equipementId,
    filialeId,
    valeurs,
  };

  return processedData;
}

function processEquipementWithFichesData(form, data) {
  // Récupérer le libellé de l'équipement
  const libelleEquipement = data.libelle;

  // Récupérer toutes les fiches techniques du conteneur
  const ficheInputs = document.querySelectorAll(
    '#fiche-content input[type="text"]'
  );
  const fiches = Array.from(ficheInputs)
    .map((input) => {
      const libelle = input.value.trim();
      return libelle ? { libelle: libelle } : null;
    })
    .filter((fiche) => fiche !== null); // Supprimer les valeurs nulles

  // Construire l'objet DTO
  const dto = {
    libelleEquipement: libelleEquipement,
    fiches: fiches.length > 0 ? fiches : null,
  };

  console.log("📦 DTO construit :", dto);
  return dto;
}
// Fonction pour charger les employés quand la filiale change
function setupFilialeChangePourListeEmployes() {
  const filialeSelect = document.getElementById("filiale-select");
  const proprietaireSelect = $("#nomProprietaire-select");

  if (!filialeSelect || !proprietaireSelect.length) {
    console.warn("⚠️ Éléments non trouvés");
    return;
  }

  $(filialeSelect)
    .off("change.filiale")
    .on("change.filiale", async function (e) {
      const filialeId = e.target.value;
      console.log("🏢 Filiale sélectionnée:", filialeId);

      // Si aucune filiale → réinitialiser proprement
      if (!filialeId) {
        proprietaireSelect.html(
          '<option value="">-- Sélectionner une filiale d\'abord --</option>'
        );
        proprietaireSelect.prop("disabled", true);
        proprietaireSelect.trigger("change.select2");
        return;
      }

      // 💡 Ajouter un indicateur visuel de chargement sans bloquer le select
      proprietaireSelect.html('<option value="">⏳ Chargement...</option>');
      proprietaireSelect.prop("disabled", false);
      proprietaireSelect.trigger("change.select2");

      try {
        const response = await fetch(`/${filialeId}/proprietaires`);
        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        const employes = await response.json();
        proprietaireSelect.empty();

        if (!employes || employes.length === 0) {
          proprietaireSelect.append(
            '<option value="">Aucun employé trouvé</option>'
          );
        } else {
          proprietaireSelect.append(
            '<option value="">-- Sélectionner un employé --</option>'
          );
          employes.forEach((emp) => {
            proprietaireSelect.append(
              `<option value="${emp.matricule}"
              data-matricule="${emp.matricule || ""}"
                data-nom="${emp.nom || ""}"
                data-prenom="${emp.prenom || ""}"
                data-direction="${emp.direction || ""}"
                data-departement="${emp.departement || ""}"
                data-fonction="${emp.fonction || ""}"
                data-unite="${emp.unite || ""}">
              ${emp.matricule} - ${emp.nom} ${emp.prenom}
            </option>`
            );
          });
        }

        // 🔄 Rafraîchir Select2 sans le recréer complètement
        proprietaireSelect.trigger("change.select2");

        console.log("✅ Employés chargés :", employes.length);
      } catch (error) {
        console.error("❌ Erreur chargement employés:", error);
        proprietaireSelect.html(
          '<option value="">Erreur de chargement</option>'
        );
      }
    });
}
