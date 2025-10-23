// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
const initMap = {
  "/showUsers": () => initUserTable(),
  "/showEquipements": () => initEquipementTable(),
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
function setupFormHandling() {
  console.log("🎯 Configuration gestion des formulaires");

  const formConfigs = {
    'addAdmin': {
      endpoint: '/addUser',
      successMessage: (result) => `✅ Utilisateur ajouté : ${result.nom}`,
      tableToReload: '#Table'
    },
    'addEquipementform': {
      endpoint: '/addEquipement',
      successMessage: (result) => `✅ Équipement ajouté : ${result.libelle}`,
      tableToReload: '#TableEquipement',
    },
    'addFichetech': {
      endpoint: '/addFichTech',
      successMessage: (result) => `✅ ${result.length} fiche(s) technique(s) ajoutée(s)`,
      customDataProcessor: processFicheTechData2024,
      tableToReload: '#TableEquipement'
    },
    'addProprietaire': {
      endpoint: '/addProprietaire',
      successMessage: (result) => `✅ Propriétaire ajouté : ${result.nomProprietaire}`,
      tableToReload: '#TableEquipementProprietaire',
      customDataProcessor: processProprietaireData,  setupFilialeChangePourListeEmployes 
      // Appelle cette fonction au chargement de la page ou lors de l’ouverture du formulaire
       
    },
       'addFiliale': {
      endpoint: '/addFiliale',
      successMessage: (result) => `✅ filiale ajouté : ${result.nomFiliale}`,
      tableToReload: '#TableFiliale',
       
    }
  };

  // Supprimer les anciens écouteurs pour éviter les doublons
  $(document).off('submit', Object.keys(formConfigs).map(id => `#${id}`).join(','));

  // Gestion unifiée avec délégation d'événements
  $(document).on('submit', Object.keys(formConfigs).map(id => `#${id}`).join(','), function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const formId = this.id;
    const config = formConfigs[formId];
    
    if (!config) {
      console.warn(`⚠️ Configuration introuvable pour : ${formId}`);
      return;
    }

    handleFormSubmission(this, config);
  });

  // Gestion bouton ajout caractéristique
  $(document).off('click', '#add-caracteristique-btn');
  $(document).on('click', '[onclick="addFiche()"], #add-caracteristique-btn', function(e) {
    e.preventDefault();
    addFiche();
  });
}
//  Fonction utilitaire pour recharger la table
function reloadEquipementTable() {
  console.log("🔄 Rechargement table Équipements");
  
  if (equipementTableInstance) {
    equipementTableInstance.ajax.reload(null, false);
    console.log("✅ Table rechargée avec succès");
  } else {
    console.warn("⚠️ Pas d'instance trouvée, tentative standard...");
    if ($.fn.DataTable.isDataTable('#TableEquipement')) {
      $('#TableEquipement').DataTable().ajax.reload();
    }
  }
}
function handleFormSubmission(form, config) {
  console.log(`🚀 Soumission formulaire : ${form.id}`);

  if ($(form).data('submitting')) {
    console.log("⚠️ Soumission déjà en cours");
    return;
  }
  $(form).data('submitting', true);

  const $button = $(form).find('button[type="submit"]');
  const originalText = $button.text();
  $button.prop('disabled', true).text('En cours...');

  const formData = new FormData(form);
  let data = Object.fromEntries(formData.entries());

  if (config.customDataProcessor) {
    data = config.customDataProcessor(form, data);
  }
  fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur serveur : " + res.status);
      return res.json();
    })
    .then(result => {
   
      customAlert("✅ Mise à jour faite avec succès !", "success", true);
      
      // ✅ UTILISER LA FONCTION DÉDIÉE pour recharger
      if (config.tableToReload === '#TableEquipement') {
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
    .catch(err => {
      console.error(`❌ Erreur :`, err);
      customAlert("❌ Données non envoyées !", "error");
    })
    .finally(() => {
      $(form).data('submitting', false);
      $button.prop('disabled', false).text(originalText);
    });
}
function loadEquipementsInSelect() {
  console.log("📥 Chargement des équipements pour tous les selects");

  const searchSelect = document.querySelector('.rechercheContainer #equipement-select');
  const addSelect = document.querySelector('.container-add #equipement-select');

  // Reset affichage initial
  [searchSelect, addSelect].forEach(select => {
    if (select) {
      select.innerHTML = '<option value="">⏳ Chargement...</option>';
    }
  });

  fetch('/Equipements')
    .then(response => {
      if (!response.ok) throw new Error("Erreur HTTP : " + response.status);
      return response.json();
    })
    .then(equipements => {
      console.log("✅ Équipements récupérés :", equipements);

      allEquipements = equipements;

      [searchSelect, addSelect].forEach((select, index) => {
        if (select) {
          select.innerHTML = '<option value="">-- Choisir un équipement --</option>';

          equipements.forEach(equipement => {
            const option = document.createElement('option');
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
    .catch(error => {
      console.error("❌ Erreur chargement équipements :", error);

      [searchSelect, addSelect].forEach(select => {
        if (select) {
          select.innerHTML = '<option value="">❌ Erreur de chargement</option>';
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

  select.innerHTML = '<option value="">-- Sélectionnez un équipement --</option>';
  
  allEquipements.forEach(eq => {
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
    container.innerHTML = "<p class='text-muted'>Veuillez sélectionner un équipement</p>";
    return;
  }

  // Afficher un loader pendant le chargement
  container.innerHTML = "<p>🔄 Chargement des fiches techniques...</p>";
  console.log("🌐 Appel API vers :", `/equipement/${equipementId}`);

  fetch(`/equipement/${equipementId}`)
    .then(response => {
      console.log("📡 Réponse reçue, status :", response.status);
  
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(fiches => {
      console.log("📋 Fiches reçues :", fiches);
      
      if (!fiches || !Array.isArray(fiches) || fiches.length === 0) {
        container.innerHTML = "<p class='alert alert-warning'>⚠️ Aucune fiche technique trouvée pour cet équipement</p>";
        return;
      }

      // Créer les éléments pour chaque fiche
      let html = "<div class='fiches-techniques'>";
      html += "<h6>Fiches techniques de l'équipement :</h6>";
      
      fiches.forEach((fiche, index) => {
        console.log(`📄 Traitement fiche ${index + 1} :`, fiche);
        console.log(`📄 Propriétés de la fiche:`, Object.keys(fiche));
        console.log(`📄 fiche.idFicheTechnique:`, fiche.idFicheTechnique);
        console.log(`📄 fiche.id:`, fiche.id);
        console.log(`📄 fiche.id_fiche_technique:`, fiche.id_fiche_technique);
        
        // ✅ CORRECTION: Le bon nom de propriété est "id_ficheTechnique"
        const ficheId = fiche.id_ficheTechnique || fiche.idFicheTechnique || fiche.id;
        console.log(`📄 ficheId final:`, ficheId);
        
        if (!ficheId) {
          console.error("❌ Impossible de récupérer l'ID de la fiche:", fiche);
          return; // Ignorer cette fiche
        }
        
        html += `
          <div class="fiche-valeur-item mb-3 p-3 border rounded" data-fiche-id="${ficheId}">
            <label class="form-label fw-bold">${fiche.libelle}</label>
            <input type="hidden" 
                   name="ficheId_${ficheId}" 
                   value="${ficheId}">
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
      
      console.log("✅ Fiches techniques affichées avec succès");
    })
    .catch(error => {
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
  $(form).find('#fiche-container input[type="text"]').each(function() {
    if ($(this).val().trim() !== "") {
      libelles.push($(this).val().trim());
    }
  });

  const processedData = {
    equipementId: parseInt(equipementId),
    libelles: libelles
  };

  console.log("🔧 Données traitées (format 2024) :", processedData);
  return processedData;
}
// -------GESTION CARACTÉRISTIQUES DYNAMIQUE-----------
function addFiche() {
  console.log("➕ Ajout caractéristique");
  
  const container = document.getElementById('fiche-container');
  if (!container) {
    console.error("❌ Container fiche-container introuvable");
    return;
  }

  const div = document.createElement("div");
  div.className = 'fiche-item';
  div.style.cssText = 'margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;';
  
  const index = container.children.length + 1;
  
  div.innerHTML = `
    <label>Caractéristique ${index} :</label>
    <input type="text" name="caracteristique_${index}" placeholder="Ex: RAM , Processeur ..." >
    <button type="button" onclick="removeFiche(this)" style="background: #dc3545; color: white; border: none;border-radius: 3px; cursor: pointer;">Supprimer</button>
  `;
  
  container.appendChild(div);
}
function removeFiche(button) {
  console.log("🗑️ Suppression caractéristique");
  button.closest('.fiche-item').remove();
}