// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
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
function initSelect2() {
    console.log('🔍 Tentative d\'initialisation de Select2');
    
    const $select = $('#nomProprietaire-select');
    
    // Vérifier que l'élément existe
    if (!$select.length) {
        console.warn(' Element nomProprietaire-select non trouvé');
        return;
    }
    
    // Vérifier que Select2 est disponible
    if (typeof $.fn.select2 === 'undefined') {
        console.error('❌ Select2 n\'est pas chargé !');
        return;
    }
    
    // Détruire Select2 s'il existe déjà
    if ($select.hasClass("select2-hidden-accessible")) {
        console.log('🗑️ Destruction de Select2 existant');
        $select.select2('destroy');
    }
    
    // Initialiser Select2
    try {
        $select.select2({
            placeholder: " Rechercher un employé...",
            allowClear:false,
            width: '85%',
            dropdownParent: $('#modal').length ? $('#modal') : $(document.body), // Important pour les modals
            language: {
                noResults: function() {
                    return "Aucun résultat trouvé";
                },
                searching: function() {
                    return "Recherche en cours...";
                }
            }
        });
        $('#nomProprietaire-select').on('change', function () {
    const valeurChoisie = $(this).val();
    const messageDiv = document.getElementById('message');

    if (valeurChoisie) {
        // Si une valeur est sélectionnée → cacher le message rouge
        if (messageDiv) messageDiv.style.display = 'none';
    }
});

        console.log('✅ Select2 initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de Select2:', error);
    }
}
// Fonction pour charger les employés quand la filiale change
function setupFilialeChangePourListeEmployes() {
    console.log('🔧 Configuration du listener filiale');
    
    var filialeSelect = document.getElementById('filiale-select');
    if (!filialeSelect) {
        console.warn('⚠️ filiale-select non trouvé');
        return;
    }

    // Supprimer les anciens listeners pour éviter les doublons
    $(filialeSelect).off('change.filiale');

    $(filialeSelect).on('change.filiale', function (e) {
        var filialeId = e.target.value;
        var proprietaireSelect = document.getElementById('nomProprietaire-select');

        console.log('📋 Filiale sélectionnée:', filialeId);

        // Détruire Select2 s'il existe déjà
        if ($(proprietaireSelect).hasClass("select2-hidden-accessible")) {
            console.log('🗑️ Destruction de Select2 avant rechargement');
            $(proprietaireSelect).select2('destroy');
        }

        // Réinitialisation du select
        if (proprietaireSelect) {
            proprietaireSelect.innerHTML = '<option value="">⏳ Chargement...</option>';
            proprietaireSelect.disabled = true;
        }

        if (!filialeId) {
            if (proprietaireSelect) {
                proprietaireSelect.innerHTML = '<option value="">-- Sélectionner une filiale d\'abord --</option>';
            }
            return;
        }

        // ✅ SUPPRIMÉ : afficherMessage

        fetch('/' + filialeId + '/proprietaires')
            .then(function (response) {
                console.log('📡 Réponse reçue, status:', response.status);
                if (!response.ok) {
                    return response.text().then(function (errorText) {
                        throw new Error(errorText || 'Erreur serveur');
                    });
                }
                return response.json();
            })
            .then(function (employes) {
                console.log('👥 Employés reçus:', employes);
                
                if (!employes || employes.length === 0) {
                    // ✅ SUPPRIMÉ : afficherMessage
                    if (proprietaireSelect) {
                        proprietaireSelect.innerHTML = '<option value="">Aucun employé disponible</option>';
                        proprietaireSelect.disabled = true;
                    }
                    return;
                }

                // Vider complètement le select
                if (proprietaireSelect) {
                    proprietaireSelect.innerHTML = '';
                    
                    // Ajouter l'option par défaut
                    var defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = '-- Sélectionner un employé --';
                    proprietaireSelect.appendChild(defaultOption);
                    
                    // Ajouter les employés
                    employes.forEach(function (emp) {
                        var option = document.createElement('option');
                        option.value = emp.matricule;
                        var nom = (emp.nom || '').trim();
                        var prenom = (emp.prenom || '').trim();
                        option.textContent = emp.matricule + ' - ' + nom + ' ' + prenom;
                         option.setAttribute('data-nom', emp.nom || '');
                         option.setAttribute('data-prenom', emp.prenom || '');
                         option.setAttribute('data-matricule', emp.matricule || '');

                        option.setAttribute('data-direction', emp.direction || '');
                        option.setAttribute('data-departement', emp.departement || '');
                        option.setAttribute('data-fonction', emp.fonction || '');
                        option.setAttribute('data-unite', emp.unite || '');

                        proprietaireSelect.appendChild(option);
                    });
                      $('#nomProprietaire-select').val(proprietaireSelect.value).trigger('change');

                    console.log('✅ ' + employes.length + ' employés ajoutés au select');
                    
                    // Activer le select
                    proprietaireSelect.disabled = false;
                }

                // Attendre que le DOM soit mis à jour avant d'initialiser Select2
                setTimeout(function() {
                    console.log('🔄 Initialisation de Select2 après chargement des employés');
                    initSelect2();
                    
                    // ✅ SUPPRIMÉ : afficherMessage
                    if ($('#nomProprietaire-select').hasClass("select2-hidden-accessible")) {
                        console.log('✅ Select2 correctement initialisé avec ' + employes.length + ' employés');
                    }
                }, 100);
            })
            .catch(function (error) {
                console.error('❌ Erreur chargement employés:', error);
                // ✅ SUPPRIMÉ : afficherMessage
                
                if (proprietaireSelect) {
                    proprietaireSelect.innerHTML = '<option value="">Erreur de chargement</option>';
                    proprietaireSelect.disabled = true;
                }
            });
    });
    
    console.log('✅ Listener filiale configuré');
}
function onProprietaireSelect(){
$('#nomProprietaire-select').on('change', function () {
    const selectedOption = this.options[this.selectedIndex];

    if (!selectedOption || !selectedOption.value) {
        // Si rien n'est sélectionné → vider les champs + cacher le bloc
        $('#direction').val('');
        $('#departement').val('');
        $('#fonction').val('');
        $('#unite').val('');
        $('.proprietaireDetailInput').css('display', 'none');
        return;
    }

    // ✅ Récupérer les data-* stockées dans l'option sélectionnée
    
    // Récupération des attributs stockés dans l'option
    const matricule = selectedOption.value;
    const nom = selectedOption.getAttribute('data-nom') || '';
    const prenom = selectedOption.getAttribute('data-prenom') || '';
    const direction =  selectedOption.getAttribute('data-direction');
    const departement = selectedOption.getAttribute('data-departement');
    const fonction = selectedOption.getAttribute('data-fonction');
    const unite = selectedOption.getAttribute('data-unite');

   $('#matricule-hidden').val(matricule);
    $('#nom-hidden').val(nom);
    $('#prenom-hidden').val(prenom);
    //  Mettre les valeurs dans les inputs
    $('#direction').val(direction);
    $('#departement').val(departement);
    $('#fonction').val(fonction);
    $('#unite').val(unite);

    // ✅ Afficher les inputs
    $('.proprietaireDetailInput').css('display', 'flex');
});
}
function chargerDetailsFiliale(filialeId, containerSelector) {
    

    const container = $(containerSelector);
    console.log("📦 Container jQuery trouvé:", container.length, "élément(s)");
    
    if (container.length === 0) {
        console.error(`❌ Container ${containerSelector} introuvable dans le DOM`);
        console.log("🔍 Containers disponibles:", 
            Array.from(document.querySelectorAll('[id*="filiale"]')).map(el => '#' + el.id)
        );
        return;
    }

    if (!filialeId) {
        console.warn("⚠️ filialeId vide ou null");
        container.html('<p class="text-muted">Veuillez sélectionner une filiale</p>');
        return;
    }

    fetch(`/details-filiale/${filialeId}`)
        .then(response => {
            console.log("📡 Réponse reçue, status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(details => {
            container.empty();
            if (!details || details.length === 0) {
                container.append('<p class="alert alert-warning">Aucune donnée disponible pour cette filiale.</p>');
                return;
            }

const keys = Object.keys(details[0]).filter(key => key !== "filialeId" && key !== "idFiliale" && key !== "idfiliale" && key !== "id");            console.log('🔑 Clés trouvées:', keys);

          keys.forEach(key => {
    // Créer la div conteneur
    const divContainer = $('<div>')
        .addClass('fiche-row'); // ou toute autre classe CSS que tu veux

    const label = $('<label>')
        .attr('for', `${key}-select`)
        .addClass('form-label')
        .text(key.charAt(0).toUpperCase() + key.slice(1));

    const select = $('<select>')
        .attr('id', `${key}-select`)
        .attr('name', key)
        .addClass('form-select');
    select.append(`<option value="">-- Tous --</option>`);


                const uniqueValues = new Set();
                details.forEach(item => {
                    if (item[key]) uniqueValues.add(item[key]);
                });

                console.log(`   ${key}: ${uniqueValues.size} valeurs uniques`);

                uniqueValues.forEach(val => {
                    select.append(`<option value="${val}">${val}</option>`);
                });
                   // Ajouter le label et le select à la div
                   divContainer.append(label);
                   divContainer.append(select);

                  container.append(divContainer);
            });

            console.log("✅ Formulaire généré avec succès");
        })
        .catch(err => {
            console.error('❌ Erreur chargement détails filiale:', err);
            container.html(`
                <div class="alert alert-danger">
                    <strong>❌ Erreur</strong><br>
                    ${err.message}
                </div>
            `);
        });
    
    console.log("🏁 === FIN chargerDetailsFiliale ===");
}
function processProprietaireData(form, data) {
  console.log("🔧 Traitement données Proprietaire");
  console.log("📋 Data brute reçue:", data);
  
  // Récupération optimisée des champs via destructuring-like pattern
  const getFieldValue = (selector) => {
    const element = form.querySelector(selector);
    return element?.value?.trim() || null;
  };
  
  // Récupérer toutes les valeurs en une seule passe
  const [equipementId, filialeId] = [
    getFieldValue('select[name="equipement"]'),
    getFieldValue('select[name="filiale"]')
  ].map(v => v ? Number(v) : null);
  
  const [nom, prenom, fonction, departement, direction, matricule, unite] = [
    'nom', 'prenom', 'fonction', 'departement', 'direction', 'matricule', 'unite'
  ].map(name => getFieldValue(`input[name="${name}"]`));
  
  // Récupérer et transformer les valeurs des fiches techniques
  const valeurs = Array.from(document.querySelectorAll(".fiche-valeur-item"))
    .map(item => {
      const ficheId = item.getAttribute('data-fiche-id');
      const valeur = item.querySelector("input[name^='valeur']")?.value?.trim();
      
      if (!ficheId || !valeur) return null;
      
      console.log(`📊 Fiche ID: ${ficheId}, Valeur: ${valeur}`);
      return {
        ficheTechId: Number(ficheId), 
        valeur
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
    valeurs
  };
  
  console.log("✅ Données traitées Proprietaire:", processedData);
  console.log("📊 Nombre de valeurs:", valeurs.length);
  
  return processedData;
}
function loadFilialesInSelect() {
  console.log("📥 Chargement des filiales dans le select");

  // Un seul select à cibler
  const selectFiliale = document.querySelector('#filiale-select');

  if (selectFiliale) {
    selectFiliale.innerHTML = '<option value="" > -- Sélectionnez une filiale--</option>';

  }

  fetch('/NomIdFiliales')
    .then(response => {
      if (!response.ok) throw new Error("Erreur HTTP : " + response.status);
      return response.json();
    })
    .then(filiales => {
      console.log("✅ Filiales récupérées :", filiales);

      // Ajouter les options
      filiales.forEach(filiale => {
        const option = document.createElement('option');
        option.value = filiale.idfiliale ;
        option.textContent = filiale.nomFiliale;
        selectFiliale.appendChild(option);
      });

      console.log(`✅ ${filiales.length} filiale(s) ajoutée(s) dans le select`);
    })
    .catch(error => {
      console.error("❌ Erreur chargement filiales :", error);
      selectFiliale.innerHTML = '<option value="">❌ Erreur de chargement</option>';
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
