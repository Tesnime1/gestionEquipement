// ----- GESTION UNIFIÉE DES FORMULAIRES
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