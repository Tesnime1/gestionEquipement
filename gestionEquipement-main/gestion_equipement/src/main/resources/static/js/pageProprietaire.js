// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
function openModalProprietaire(url, defaultNom, title) {
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
    
    // Reset du flag listener
    isEquipementSelectListenerAdded = false;
    
    // Charger les équipements et configurer le listener
    setTimeout(() => {
     
      loadFilialesInSelect();
      populateEquipementSelectFromCache();
      setupEquipementChangeListener();
      setupFilialeChangePourListeEmployes();
      onProprietaireSelect()
      
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
function initEquipementProprietaireTable() {
 
   // Détruire l'instance existante si elle existe
  if ($.fn.DataTable.isDataTable('#TableEquipementProprietaire')) {
    $('#TableEquipementProprietaire').DataTable().destroy();
  }
  

 $('#TableEquipementProprietaire').DataTable({
  paging: false,
  searching: true,
  ordering: true,
  info: false,
  lengthChange: false,
  language: {
    url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
  },
  ajax: {
    url: "/details",
    dataSrc: ""
  },
  columns: [
        {data:"matricule"},
    { data: "nomProprietaire" },
     { data: "prenomProprietaire" },
    { data: "equipement" },
    { data: "ajouterPar" },

    {
      data: "dateDajout",
      render: function(data) {
        return data ? new Date(data).toLocaleDateString("fr-FR") : "—";
      }
    },
     {
      data: null,
      render: (data, type, row) =>  `<button class="btn btn-success btn-sm" onclick='showDetailsProprietaire(${JSON.stringify(row)})'>Modifier Proprietaire </button>`
    },
 {
      data: null,
      render: (data, type, row) =>  `<button class="btn btn-success btn-sm" onclick='showDetailsFicheTechValues(${JSON.stringify(row)})'>Modifier Fiche Technique</button>`
    },

  ]
});
}
// ===== updateDetailsProprietaire =====
function updateDetailsProprietaire(idEquipementInst) {
  // Récupérer les valeurs sélectionnées
  const nomProprietaireValue = document.getElementById("nomProprietaire-select").value;
  const filialeId = document.getElementById("filiale-select").value;
  
  if (!nomProprietaireValue) {
    customAlert("Veuillez sélectionner un propriétaire");
    return;
  }

  if (!filialeId) {
    customAlert("Veuillez sélectionner une filiale");
    return;
  }

  // Récupérer l'option sélectionnée
  const selectedOption = document.getElementById("nomProprietaire-select").options[
    document.getElementById("nomProprietaire-select").selectedIndex
  ];

  // Récupérer tous les attributs data stockés dans l'option
  const matricule = selectedOption.getAttribute('data-matricule') || '';
  const nom = selectedOption.getAttribute('data-nom') || '';
  const prenom = selectedOption.getAttribute('data-prenom') || '';
  const direction = selectedOption.getAttribute('data-direction') || '';
  const departement = selectedOption.getAttribute('data-departement') || '';
  const fonction = selectedOption.getAttribute('data-fonction') || '';
  const unite = selectedOption.getAttribute('data-unite') || '';
  
  // Récupérer le nom de la filiale
  const filialeOption = document.getElementById("filiale-select").options[
    document.getElementById("filiale-select").selectedIndex
  ];
  const nomFiliale = filialeOption.text;

  // Construire le payload
  const payload = {
    nomProprietaire: nom,
    prenomProprietaire: prenom,
    matricule: matricule,
    departement: departement,
    direction: direction,
    fonction: fonction,
    unite: unite,
    filialeId: parseInt(filialeId),
    nomFiliale: nomFiliale
  };

  console.log("📤 Données à envoyer :", payload);

  fetch(`/${idEquipementInst}/proprietaire`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error("Erreur HTTP " + res.status);
    return res.json();
  })
  .then(data => {
    console.log("✅ Mise à jour réussie :", data);
    customAlert("Mise à jour effectuée avec succès !");
    $("#modal").hide();

    // Rafraîchir la datatable
    $('#TableEquipementProprietaire').DataTable().ajax.reload();
  })
  .catch(err => {
    console.error("❌ Erreur mise à jour :", err);
    customAlert("Erreur lors de la mise à jour : " + err.message);
  });
}
function  showDetailsFicheTechValues(row) {
  console.log("📋 Détail propriétaire :", row);

  let html = ` <div class="p-3">
      <h6 class="mt-3">Fiche technique :</h6>
      <ul class="list-group" id="fiche-tech-list">
  `;
 // Charger les fiches techniques via AJAX
  $.ajax({
    url: `/equipement-instance/${row.idEquipementInst}`,
    method: 'GET',
    success: function(valeurs) {
        console.log("✅ Fiches techniques chargées:", valeurs);

  if (valeurs && valeurs.length > 0) {
    valeurs.forEach(v => {
      html += `
        <li class="list-group-item" >
          <label class="form-label">${v.libelleFiche}</label>
          <input class="form-control fiche-input"   data-id="${v.idValeur}"  value="${v.valeur}" >
        </li>`;
    });
  } else {
    html += `<li class="list-group-item">Aucune fiche technique disponible</li>`;
  }

  html += `
      </ul>
      <div class="mt-3 text-end">
        <button class="btn btn-success btn-sm" onclick="updateDetailsFicheValues(${row.idEquipementInst})">Modifier</button>
      </div>
    </div>
  `;
  console.log("👉 Valeurs reçues :", row.valeurs);
  $("#modal-body").html(html);
  $("#modal .nav-popup h4").text("Détail propriétaire");
  $("#modal").css("display", "flex");
}});
}
// Fonction pour initialiser Select2, Événement lors de la sélection d'une filiale, Fonction pour charger les employés quand la filiale change
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
function showDetailsProprietaire(row) {
  console.log("📋 Détail propriétaire :", row);

  let html = ` <div class="p-3">
      <div class="mb-2">
        <label class="form-label">Équipement :</label>
        <input class="form-control" value="${row.equipement}" readonly>
      </div>

      <div class="mb-2">
        <label class="form-label">Propriétaire :</label>
        <input class="form-control" id="input-nom-proprietaire" type="hidden" value="${row.nomFiliale}" ><br>
       <input class="form-control" id="input-nom-proprietaire" value="${row.matricule}" ><br>
        <input class="form-control" id="input-nom-proprietaire" value="${row.nomProprietaire}"><br>
         <input class="form-control" id="input-nom-proprietaire" value="${row.prenomProprietaire}" >   
          
      </div>
      <div class="mb-2">
       <label for="filiale-select">nouvelle Filiale :</label>
       <select class="form-control"  name="filiale" id="filiale-select" required>
       <option value="">⏳ Chargement des filiales...</option>
      </select>
      </div>

       <div class="mb-2">
        <label class="form-label">nouveau Proprietaire :</label>
       <select name="nomProprietaire" id="nomProprietaire-select" required>
        <option value="">⏳ Chargement des proprietaires..</option>
       </select> 
      </div>

      <div class="mb-2">
      <input type="hidden" name="matricule" id="matricule-hidden">
      <input type="hidden" name="nom" id="nom-hidden">
      <input type="hidden" name="prenom"  id="prenom-hidden">

      <div class="proprietaireDetailInput"  id="proprietaire-details">
       <input type="text" id="direction" name="direction" readonly>
       <input type="text" id="departement" name="departement" readonly>
       <input type="text"  id="fonction"name="fonction" readonly>
       <input type="text"  id="unite"name="unite" readonly>
      </div>
      <div class="mb-2">
        <label class="form-label">Ajouté par :</label>
        <input class="form-control" value="${row.ajouterPar}" readonly>
      </div>

      <div class="mb-2">
        <label class="form-label">Date :</label>
        <input class="form-control" value="${new Date(row.dateDajout).toLocaleDateString("fr-FR")}" readonly>
      </div>

      <h6 class="mt-3">Fiche technique :</h6>
        <div id="fiche-tech-loader" class="text-center">
        <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    <ul class="list-group" id="fiche-tech-list"></ul>
  `;

  html += `
      </ul>
      <div class="mt-3 text-end">
        <button class="btn btn-success btn-sm" onclick="updateDetailsProprietaire(${row.idEquipementInst})">Modifier</button>
      </div>
    </div>
  `;
  $("#modal-body").html(html);
  $("#modal .nav-popup h4").text("Détail propriétaire");
  $("#modal").css("display", "flex");
   setTimeout(() => {
    loadFilialesInSelect();
    setupFilialeChangePourListeEmployes(); 
    onProprietaireSelect();
    initSelect2();
    // Charger les fiches techniques
    chargerFichesTeechniques(row.idEquipementInst);
    chargerDetailsFiliale();
  }, 100);
}