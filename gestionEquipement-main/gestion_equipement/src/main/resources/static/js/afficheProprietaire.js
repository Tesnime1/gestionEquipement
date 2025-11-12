
// ------ Popup proprietaie
// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
// Variable globale pour stocker l'ID de l'équipement actuel
let currentEquipementId = null;

function getScrollHeight() {
  return ($(window).height() -170) + "px";
}

function initEquipementProprietaireTable() {
  console.log("📊 Initialisation DataTable Équipements Propriétaire");

  if ($.fn.DataTable.isDataTable('#TableEquipementProprietaire')) {
    $('#TableEquipementProprietaire').DataTable().destroy();
  }

  let table = $('#TableEquipementProprietaire').DataTable({
      dom: 'ft',
    searching: true,
    paging: false,
    scrollCollapse: true,
    scrollY: getScrollHeight(),
    autoWidth: true,
    ordering: true,
    info: false,
    lengthChange: false,
    
    language: { 
      url: "/js/i18n/fr-FR.json",
      emptyTable: "Aucune donnée disponible",
      zeroRecords: "Aucun résultat trouvé"
    },
 ajax: { 
      url: "/details",
      dataSrc: "",
      error: function( error) {
        console.error("❌ Erreur chargement:", error);
        console.log("Réponse serveur:", xhr.responseText);
      }
    },
    columns: [
   
      { data: "matricule", className: "text-left" },
      { data: "nomProprietaire", className: "text-left" },
      { data: "prenomProprietaire", className: "text-left" },
      { data: "equipement", className: "text-left" },
      { data: "ajouterPar", className: "text-left" },
      { 
        data: "dateDajout",
        className: "text-center",
        render: function(data) {
          return data ? new Date(data).toLocaleDateString("fr-FR") : "—";
        }
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
                onclick='showDetailsProprietaire(this)'>
          Modifier
        </button>`;
    }
  },
  {
    data: null,
    orderable: false,
    searchable: false,
    className: "text-left",
    render: (data, type, row) => {
      return `
        <button class="btn btn-info btn-sm" 
                data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}'
                onclick='showDetailsFicheTechValues(this)'>
          Fiche Tech
        </button>`;
    }
  },
  {
    data: null,
    orderable: false,
    searchable: false,
    className: "text-left",
    render: (data, type, row) => {
      return `
        <button data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}'
                onclick='showPdf(this)'>
          <img src="/images/pdf.png" width="24" alt="PDF">
        </button>`;
    }
  },
  {
    data: null,
    orderable: false,
    searchable: false,
    className: "text-left",
    render: (data, type, row) => {
      if (row.scanner === false) {
        return `
          <button data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}'
                  onclick='showScanner(this)'>
            <img src="/images/scannerr.png" width="24" alt="Scanner">
          </button>`;
      } else {
        return `
          <button data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}'
                  onclick='showExistingScanner(this)'>
            <img src="/images/document.png" width="24" alt="Voir le document">
          </button>`;
      }
    }
  },
  { data: "idEquipementInst", visible: false },  
],
        
   
    

    drawCallback: function() {
      // Ajuste les colonnes pour bien aligner le thead/tbody après le rendu
      table.columns.adjust();
    }
  });

  return table;
}

function showExistingScanner(button) {
   const row = JSON.parse(button.getAttribute('data-row'));
  console.log(row);
  const id = row.idEquipementInst;
  console.log("📄 Afficher le document scanné...");

  // Construire l'URL du document
  const url = `http://localhost:8080/scanner/${id}`;

  // Insérer le PDF dans la modale via un iframe
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <iframe 
      src="${url}" 
      style="width:100%; height:80vh; border:none;"
      title="Document scanné de l'équipement ${id}">
    </iframe>
  `;
  $("#modal").css("display", "flex");
}


function showScanner(button) {
   const row = JSON.parse(button.getAttribute('data-row'));
  console.log(row);
  console.log("📷 Ouvrir le scanner...");
  currentEquipementId = row.idEquipementInst;

  const fileInput = document.getElementById('fileInput');

  // ✅ Réinitialiser avant d'ouvrir (mais pas après le click)
  fileInput.value = "";

  // Ouvrir l’explorateur de fichiers
  fileInput.click();

  // Quand un fichier est sélectionné
  fileInput.onchange = function(event) {
    const file = event.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      showPopup(fileURL);
    }
  };
}

function showPopup(fileURL) {
  const modal = document.getElementById('modal-document');
  const modalBody = document.getElementById('modalDocument-body');

  modalBody.innerHTML = `
    <iframe src="${fileURL}" allow="none"
            style="width:100%;height:80vh;border:none;border-radius:8px;">
    </iframe>
  `;
  modal.style.display = 'flex';
}

function updateScanner() {
    if (!currentEquipementId) {
        alert('Aucun équipement sélectionné');
        return;
    }

    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files[0]) {
        alert("Veuillez choisir un fichier à uploader !");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const button = event.target;
    button.disabled = true;
    button.textContent = 'Mise à jour...';

    fetch(`/${currentEquipementId}/scanner`, {
        method: 'PUT', // ✅ ou PUT si ton controller l’accepte bien
        body: formData
        // ❌ ne pas mettre Content-Type ici
    })
    .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
        return response.json();
    })
    .then(data => {
        button.textContent = data.scanner ? 'Document scanné ✓' : 'Document non scanné';
        button.classList.add(data.scanner ? 'btn-success' : 'btn-warning');
        customAlert('Document mis à jour avec succès!', 'success');
        $('#TableEquipementProprietaire').DataTable().ajax.reload();
    })
    .catch(error => {
        console.error('Erreur:', error);
        button.textContent = 'Erreur - Réessayer';
        button.classList.add('btn-danger');
        customAlert('Erreur lors de la mise à jour', 'error');
    })
    .finally(() => {
        button.disabled = false;
    });
}

function openModalProprietaire(url, defaultNom, title) {
  
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
      onProprietaireSelect();
        initSelect2();

      
    }, 100);
  });
}
function closeModal() { 
  $("#modal").css("display", "none");
  $("#modal-body").empty();
  
  // Reset du flag listener
  isEquipementSelectListenerAdded = false;
}
function closeModalDoc() { 
  $("#modal-document").css("display", "none");
  $("#modalDocument-body").empty();
  
  // Reset du flag listener
  isEquipementSelectListenerAdded = false;
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
function  showDetailsFicheTechValues(button) {
 const row = JSON.parse(button.getAttribute('data-row'));
  console.log(row);

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
function showDetailsProprietaire(button) {
 const row = JSON.parse(button.getAttribute('data-row'));
  console.log(row);
  let html = ` <div class="p-3">
      <div class="mb-2">
        <label class="form-label">Équipement :</label>
        <input class="form-control" value="${row.equipement}" readonly>
      </div>

      <div class="mb-2">
        <label class="form-label">Propriétaire :</label>
        <input class="form-control" id="input-nom-proprietaire" type="hidden" value="${row.nomFiliale}" ><br>
       <input class="form-control" id="input-nom-proprietaire" value="${row.matricule}" readonly><br>
        <input class="form-control" id="input-nom-proprietaire" value="${row.nomProprietaire}"readonly><br>
         <input class="form-control" id="input-nom-proprietaire" value="${row.prenomProprietaire}" readonly>   
          
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
        <label class="form-label">scanner:</label>
        <input class="form-control" value="${row.scanner}" readonly>
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
function chargerFichesTeechniques(idEquipementInst) {
  $.ajax({
    url: `/equipement-instance/${idEquipementInst}`,
    method: 'GET',
    success: function(valeurs) {
      let html = '';
      if (valeurs && valeurs.length > 0) {
        valeurs.forEach(v => {
          html += `
            <li class="list-group-item">
              <label class="form-label">${v.libelleFiche}</label>
              <input class="form-control fiche-input" data-id="${v.idValeur}" value="${v.valeur}" readonly>
            </li>`;
        });
      } else {
        html = '<li class="list-group-item">Aucune fiche technique disponible</li>';
      }
      $("#fiche-tech-list").html(html);
      $("#fiche-tech-loader").hide();
    },
    error: function(xhr, status, error) {
      console.error("❌ Erreur :", error);
      $("#fiche-tech-list").html('<li class="list-group-item text-danger">Erreur lors du chargement</li>');
      $("#fiche-tech-loader").hide();
    }
  });
}
function initSelect2() {
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
 
        $select.select2('destroy');
    }
    
    // Initialiser Select2
    try {
        $select.select2({
            placeholder: " Rechercher un employé...",
            allowClear:false,
            width: '85%',
            padding:'5px',
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

  
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de Select2:', error);
    }
}

// Fonction pour charger les employés quand la filiale change
function setupFilialeChangePourListeEmployes() {
  const filialeSelect = document.getElementById('filiale-select');
  const proprietaireSelect = $('#nomProprietaire-select');

  if (!filialeSelect || !proprietaireSelect.length) {
    console.warn('⚠️ Éléments non trouvés');
    return;
  }

  $(filialeSelect).off('change.filiale').on('change.filiale', async function (e) {
    const filialeId = e.target.value;
    console.log('🏢 Filiale sélectionnée:', filialeId);

    // Si aucune filiale → réinitialiser proprement
    if (!filialeId) {
      proprietaireSelect.html('<option value="">-- Sélectionner une filiale d\'abord --</option>');
      proprietaireSelect.prop('disabled', true);
      proprietaireSelect.trigger('change.select2');
      return;
    }

    // 💡 Ajouter un indicateur visuel de chargement sans bloquer le select
    proprietaireSelect.html('<option value="">⏳ Chargement...</option>');
    proprietaireSelect.prop('disabled', false);
    proprietaireSelect.trigger('change.select2');

    try {
      const response = await fetch(`/${filialeId}/proprietaires`);
      if (!response.ok) throw new Error(`Erreur ${response.status}`);

      const employes = await response.json();
      proprietaireSelect.empty();

      if (!employes || employes.length === 0) {
        proprietaireSelect.append('<option value="">Aucun employé trouvé</option>');
      } else {
        proprietaireSelect.append('<option value="">-- Sélectionner un employé --</option>');
        employes.forEach(emp => {
          proprietaireSelect.append(
            `<option value="${emp.matricule}"
              data-matricule="${emp.matricule || ''}"
                data-nom="${emp.nom || ''}"
                data-prenom="${emp.prenom || ''}"
                data-direction="${emp.direction || ''}"
                data-departement="${emp.departement || ''}"
                data-fonction="${emp.fonction || ''}"
                data-unite="${emp.unite || ''}">
              ${emp.matricule} - ${emp.nom} ${emp.prenom}
            </option>`
          );
        });
      }

      // 🔄 Rafraîchir Select2 sans le recréer complètement
      proprietaireSelect.trigger('change.select2');

      console.log('✅ Employés chargés :', employes.length);
    } catch (error) {
      console.error('❌ Erreur chargement employés:', error);
      proprietaireSelect.html('<option value="">Erreur de chargement</option>');
    }
  });
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

const keys = Object.keys(details[0]).filter(key => key !== "filialeId" && key !== "idFiliale" && key !== "idfiliale" && key !== "id");         
   console.log('🔑 Clés trouvées:', keys);

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

function loadFilialesInSelect() {

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
      // Ajouter les options
      filiales.forEach(filiale => {
        const option = document.createElement('option');
        option.value = filiale.idfiliale ;
        option.textContent = filiale.nomFiliale;
        selectFiliale.appendChild(option);
      });
    })
    .catch(error => {
      console.error("❌ Erreur chargement filiales :", error);
      selectFiliale.innerHTML = '<option value="">❌ Erreur de chargement</option>';
    });
}
function loadEquipementsInSelect() {
  console.log("📦 Chargement des équipements");
  
  const searchSelect = document.querySelector('.rechercheContainer #equipement-select');
  const addSelect = document.querySelector('.container-add #equipement-select');

  // Reset affichage initial
  [searchSelect, addSelect].forEach(select => {
    if (select) {
      select.innerHTML = '<option value="">⏳ Chargement...</option>';
    }
  });

  fetch('/Equipements', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Cache-Control': 'no-cache' }
  })
    .then(response => {
      if (!response.ok) throw new Error("Erreur HTTP : " + response.status);
      return response.json();
    })
    .then(equipements => {
      console.log(`✅ ${equipements.length} équipements chargés`);
      
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

          // ✅ Utiliser des namespaces différents pour éviter les conflits
          if (index === 0) {
            $(select).off('change.search').on('change.search', handleSearchEquipementChange);
          } else {
            $(select).off('change.add').on('change.add', handleEquipementChange);
          }
        }
      });
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
    container.innerHTML = "<p class='text-muted'>Veuillez sélectionner un équipement</p>";
    return;
  }

  container.innerHTML = "<p>🔄 Chargement des fiches techniques...</p>";

  fetch(`/equipement/${equipementId}`, {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(fiches => {
      if (!fiches || !Array.isArray(fiches) || fiches.length === 0) {
        container.innerHTML = "<p class='alert alert-warning'>⚠️ Aucune fiche technique trouvée</p>";
        return;
      }

      let html = "<div class='fiches-techniques'><h6>Fiches techniques :</h6>";
      
      fiches.forEach((fiche) => {
        const ficheId = fiche.id_ficheTechnique || fiche.idFicheTechnique || fiche.id;
        
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
    .catch(error => {
      console.error("❌ Erreur chargement fiches :", error);
      container.innerHTML = `
        <div class="alert alert-danger">
          <strong>❌ Erreur</strong><br>
          ${error.message}
        </div>
      `;
    });
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
  $(equipementSelect).off('change.fichetech').on('change.fichetech', handleEquipementChange);
  isEquipementSelectListenerAdded = true;
  console.log("✅ Listener équipement attaché");
}
function updateDetailsFicheValues(idEquipementInst) {

  // Récupérer toutes les valeurs des fiches techniques
  const valeurs = [];
  document.querySelectorAll("#fiche-tech-list .fiche-input").forEach(input => {
    valeurs.push({
 idValeur: input.dataset.id,
    valeur: input.value
    });
  });
  const payload = { valeurs: valeurs };
  console.log("📤 Données à envoyer :", payload);

  fetch(`/${idEquipementInst}/ficheTechvalue`, {
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
    customAlert("Mise à jour effectuée avec succès !","success", true);
    $("#modal").hide();

    // rafraîchir la datatable
    $('#TableEquipementProprietaire').DataTable().ajax.reload();
  })
  .catch(err => {
    console.error("❌ Erreur mise à jour :", err);
    customAlert("Erreur lors de la mise à jour.");
  });
}
function customAlert(message, type = "success", closeModal = false) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:9999;";
  
  const buttonColor = type === "success" ? "#198754" : "#dc3545";
  
  const box = document.createElement("div");
  box.style.cssText = "background:#fff;padding:2vw;border-radius:5px;text-align:center;min-width:40vw;box-shadow:0 5px 15px rgba(0,0,0,0.3);";
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
function showPdf(button) {
  const row = JSON.parse(button.getAttribute('data-row'));
  console.log(row);
  const id =  row.idEquipementInst;
  console.log("📄 Génération du PDF pour l'équipement ID:", id);

  // Création du modal si pas déjà présent
  let pdfModal = document.getElementById("pdfModal");
  if (!pdfModal) {
    pdfModal = document.createElement("div");
    pdfModal.id = "pdfModal";
    pdfModal.className = "modal";
    pdfModal.innerHTML = `
      <div class="modal-content" style="width:90%;height:90%;">
        <div class="nav-popup">
          <h4>Rapport</h4>
          <span class="close" onclick="closePdfModal()">&times;</span>
        </div>
        <iframe id="pdfFrame" style="width:100%;height:90%;border:none;"></iframe>
      </div>`;
    document.body.appendChild(pdfModal);
  }

  // Charger le PDF dans l'iframe
  const pdfFrame = document.getElementById("pdfFrame");
  pdfFrame.src = `/scannerr/${id}`; // appelle ton endpoint

  // Afficher le modal
  pdfModal.style.display = "flex";
}

function closePdfModal() {
  document.getElementById("pdfModal").style.display = "none";
}
document.addEventListener("DOMContentLoaded", initEquipementProprietaireTable,updateDetailsProprietaire,updateDetailsFicheValues,);
