
// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;

$(document).ready(function () {
  console.log("✅ Application initialisée");
  
  // Initialiser les menus déroulants
  toggleMenu(".filiale", ".detailF");
  toggleMenu(".equipement", ".detailE");
  toggleMenu(".admins", ".detailA");
   toggleMenu(".recherche", ".detailR");
  
  // Initialiser la gestion des formulaires
  setupFormHandling();
  
  // Initialiser le chargement dynamique
  enableDynamicLoad("a.load-page", "#content");
  
  // Vérifier les éléments requis au chargement initial

});
// ---- CHARGEMENT DYNAMIQUE DES PAGES ----------------
function enableDynamicLoad(selector, targetSelector) {
  const links = document.querySelectorAll(selector);
  const target = document.querySelector(targetSelector);

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const url = this.getAttribute("href");
      loadContent(url);
    });
  });
}

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

function loadContent(url) {
  console.log("📥 LoadContent appelé pour :", url);
  const target = document.querySelector("#content");

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Erreur réseau : " + response.status);
      return response.text();
    })
    .then(html => {
      console.log("✅ Contenu chargé :", url);
      target.innerHTML = html;

      // Délai plus long pour certaines pages
      const delay = url === "/showHistory" ? 200 : 
                    url === "/pageAddFiliale" ? 150 : 100;

      if (initMap[url]) {
        setTimeout(initMap[url], delay);
      }
      
      if (url.includes("Proprietaire") || url.includes("proprietaire")) {
        setTimeout(() => {
          populateEquipementSelectFromCache();
          setupEquipementChangeListener();
        }, 100);
      }
    })
    .catch(err => {
      console.error("❌ Erreur loadContent :", err);
      target.innerHTML = "<p style='color:red'>Erreur de chargement : " + err.message + "</p>";
    });
}
//---- MENUS DÉROULANTS-------
function toggleMenu(triggerSelector, submenuSelector) {
  $(triggerSelector).on("mouseenter", function () {
    $("nav div").not(submenuSelector).slideUp();
    $(submenuSelector)
      .stop(true, true)
      .slideDown(function () {
        $(this).css("display", "flex").css("flex-direction", "column");
      });
  });

  $(submenuSelector).on("mouseleave", function () {
    $(this).slideUp();
  });
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

//----- fonction pour gérer le changement dans la recherche
function handleSearchEquipementChange(event) {
  const equipementId = event.target.value;
  console.log("🔍 Recherche - Équipement sélectionné:", equipementId);
  loadFichesTechniquesAndValeurs(equipementId);
}
function handleFilialeChange(event) {
    const filialeId = event.target.value;
  
    if (!filialeId) {
        console.warn("⚠️ Aucune filiale sélectionnée");
        return;
    }
    
    chargerDetailsFiliale(filialeId, '#filialeDetailsContainer');
}


// -------- GESTION DES DATATABLES -------------
function initUserTable() {
  console.log("📊 Initialisation DataTable Utilisateurs");
  
  // Détruire l'instance existante si elle existe
  if ($.fn.DataTable.isDataTable('#Table')) {
    $('#Table').DataTable().destroy();
  }
  
  $('#Table').DataTable({
    paging: false,
    searching: true,
    ordering: true,
    info: false,
    lengthChange: false,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
    },
    columnDefs: [
      { orderable: false, targets: [1, 2] }
    ],
    ajax: {
      url: "/Users", // ⚡ CORRECTION: Enlever localhost
      dataSrc: "",
      error: function (xhr) {
        console.error("❌ Erreur DataTable Users :", xhr.responseText);
      }
    },
    columns: [
      { data: "nom" },    
      { data: "role" },
    
  {
    data: null,
    render: (data, type, row) => 
      `<button class="btn btn-warning btn-sm" onclick="openPopupModifierUser('modalEdit', ${row.id})">Modifier</button>`
  }    ]
  });
}

function initEquipementTable() {
  console.log("📊 Initialisation DataTable Équipements");
  
  // Détruire l'instance existante si elle existe
  if ($.fn.DataTable.isDataTable('#TableEquipement')) {
    console.log("🗑️ Destruction instance existante");
    $('#TableEquipement').DataTable().destroy();
    equipementTableInstance = null; // ✅ Réinitialiser la référence
  }
  
  equipementTableInstance = $('#TableEquipement').DataTable({
    paging: false,
    searching: true,
    ordering: true,
    info: false,
    lengthChange: false,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
    },
    columnDefs: [
      { orderable: false, targets: [1] }
    ],
    ajax: {
      url: "/equipementFiches", 
      dataSrc: function(json) {
        allEquipements = json;
        console.log("📦 Équipements stockés dans le cache :", allEquipements.length);
        return json;
      },
      error: function (xhr) {
        console.error("❌ Erreur DataTable Equipements :", xhr.responseText);
      }
    },
    columns: [
      { data: "libelleEquipement" },
      {
        data: "fiches",
        render: function (fiches) {
          if (!fiches || fiches.length === 0) {
            return "—";
          }
          return fiches.map(f => f.libelle).join(", ");
        }
      },
      {
        data: null,
        render: function(data, type, row) {
          const id = row.idEquipement || row.id || row.id_equipement;
          return `<button class="btn btn-success btn-sm" onclick="openFicheModal(${id})">Modifier</button>`;
        }
      }
    ]
  });
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
function initEquipementHistoriqueTable() {

  // Détruire l'instance existante s'il y en a déjà une
  if ($.fn.DataTable.isDataTable('#TableEquipementHistorique')) {
    console.log("🗑️ Destruction de l'ancienne instance DataTable");
    $('#TableEquipementHistorique').DataTable().destroy();
  }

  try {
    $('#TableEquipementHistorique').DataTable({
      paging: false,
      searching: true,
      ordering: true,
      info: false,
      lengthChange: false,
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
      },
      ajax: {
        url: "/historique",
        dataSrc: "",
        complete: function(xhr) {
         
          console.log("📊 Données reçues:", xhr.responseJSON);
        },
        error: function(xhr, status, error) {
          console.error(" Erreur AJAX Historique:", error);
          console.error(" Status:", status);
          console.error(" Response:", xhr.responseText);
        }
      },
      columns: [
        { data: "ancienProprietaire" },
        { data: "nouveauProprietaire" },
        { data: "modifiePar" },
        {
          data: "dateModification",
          render: function(data) {
            return data ? new Date(data).toLocaleDateString("fr-FR") : "—";
          }
        },
        {
          data: "ancienneDate",
          render: function(data) {
            return data ? new Date(data).toLocaleDateString("fr-FR") : "—";
          }
        },
        {
          data: null,
          render: function(data, type, row) {
            return `<button class="btn btn-success btn-sm" 
                      onclick='showDetailsFicheTechHistoriqueValues(${JSON.stringify(row)})'>
                      Fiche Technique
                    </button>`;
          }
        }
      ],
      initComplete: function() {
        console.log("✅ DataTable Historique initialisée avec succès!");
      }
    });
  } catch(error) {
    console.error("❌ Erreur lors de la création de la DataTable:", error);
  }

}
function initFilialeTable() {
 
  // Détruire l'instance existante s'il y en a déjà une
  if ($.fn.DataTable.isDataTable('#TableFiliale')) {
    console.log("🗑️ Destruction de l'ancienne instance DataTable");
    $('#TableFiliale').DataTable().destroy();
  }

  try {
    $('#TableFiliale').DataTable({
      paging: false,
      searching: true,
      ordering: true,
      info: false,
      lengthChange: false,
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
      },
      ajax: {
        url: "/Filiales",
        dataSrc: "",
        complete: function(xhr) {
          console.log("✅ AJAX Historique - Réponse complète:", xhr.status);
          console.log("📊 Données reçues filiales:", xhr.responseJSON);
          console.log(JSON.stringify(xhr.responseJSON,null,2))
        },
        error: function(xhr, status, error) {
          console.error("❌ Erreur AJAX Historique:", error);
          console.error("❌ Status:", status);
          console.error("❌ Response:", xhr.responseText);
        }
      },
      columns: [
        { data: "nomFiliale" },
        { data: "adresseIp" },
        { data: "nomBdd" },
          { data: "userBdd" },
            { data: "passwordBdd" },
        {
          data: "dateCreation",
          render: function(data) {
            return data ? new Date(data).toLocaleDateString("fr-FR") : "—";
          }
        },
        
        {
          data: null,
          render: function(data, type, row) {
            return `<button class="btn btn-success btn-sm" 
                      onclick='showDetailsFiliale(${JSON.stringify(row)})'>
                     Modifier
                    </button>`;
          }
        }
      ],
      initComplete: function() {
        console.log("✅ DataTable Historique initialisée avec succès!");
      }
    });
  } catch(error) {
    console.error("❌ Erreur lors de la création de la DataTable:", error);
  }

}

function initTableSearchEquipement() {
  const equipementId = document.querySelector("#equipement-select").value;
  const filialeId = document.querySelector("#filiale-select")?.value;

 
  // Récupérer les valeurs des fiches techniques
  let valeurs = [];
  document.querySelectorAll(".fiche-select").forEach(select => {
    if (select.value) {
      valeurs.push(select.value);
    }
  });

  // Récupérer les détails de la filiale (direction, département, etc.)
  let filialeDetails = {};
  document.querySelectorAll('#filialeDetailsContainer select').forEach(select => {
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
    url += `&valeurs=${valeurs.map(v => encodeURIComponent(v)).join(",")}`;
  }

  // Ajouter les détails de la filiale (direction, département, fonction, unité)
  if (Object.keys(filialeDetails).length > 0) {
    Object.entries(filialeDetails).forEach(([key, value]) => {
      url += `&${key}=${encodeURIComponent(value)}`;
    });
  }

  console.log("🔍 URL de recherche:", url);

  // Conteneur
  const container = document.querySelector("#table-container");
  container.innerHTML = `
    <table id="TableParValeur" class="table table-striped">
      <thead>
        <tr>
          <th>Nom Propriétaire</th>
          <th>Prénom</th>
          <th>Matricule</th>
          <th>Direction</th>
          <th>Département</th>
          <th>Fonction</th>
          <th>Unité</th>
          <th>Équipement</th>
          <th>Ajouté Par</th>
          <th>Date d'ajout</th>
          <th>Valeurs</th>
        </tr>
      </thead>
    </table>
  `;

  // Détruire et recréer la table
  if ($.fn.DataTable.isDataTable('#TableParValeur')) {
    $('#TableParValeur').DataTable().destroy();
  }

  $('#TableParValeur').DataTable({
    paging: false,
    searching: true,
    ordering: true,
    info: false,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
    },
    ajax: {
      url: url,
      dataSrc: "",
      error: function(xhr, status, error) {
        console.error("❌ Erreur chargement données:", error);
        customAlert("Erreur lors du chargement des données", "error");
      }
    },
    columns: [
      { data: "nomProprietaire" },
      { data: "prenomProprietaire" },
      { data: "matricule" },
      { data: "direction" },
      { data: "departement" },
      { data: "fonction" },
      { data: "unite" },
      { data: "equipement" },
      { data: "ajouterPar" },
      {
        data: "dateDajout",
        render: function(data) {
          return data ? new Date(data).toLocaleDateString("fr-FR") : "—";
        }
      },
      {
        data: "valeurs",
        render: function(valeurs) {
          if (!valeurs || valeurs.length === 0) return "—";
          return valeurs.map(v => `${v.libelleFiche}: ${v.valeur}`).join("<br>");
        }
      }
    ]
  });
}
// --- LISTENER ÉQUIPEMENTS (NOUVELLE FONCTION)-----------------
function setupEquipementChangeListener() {
  // Éviter les doublons d'event listeners
  if (isEquipementSelectListenerAdded) {
    console.log("⚠️ Listener équipement déjà ajouté");
    return;
  }

  const equipementSelect = document.getElementById("equipement-select");
  
  if (!equipementSelect) {
    console.log("⚠️ Element 'equipement-select' non trouvé, tentative ultérieure...");
    return;
  }
  
  console.log("✅ Configuration du listener pour equipement-select");
  
  equipementSelect.addEventListener("change", handleEquipementChange);
  isEquipementSelectListenerAdded = true;
}
// // ----- GESTION UNIFIÉE DES FORMULAIRES
// function setupFormHandling() {
//   console.log("🎯 Configuration gestion des formulaires");

//   const formConfigs = {
//     'addAdmin': {
//       endpoint: '/addUser',
//       successMessage: (result) => `✅ Utilisateur ajouté : ${result.nom}`,
//       tableToReload: '#Table'
//     },
//     'addEquipementform': {
//       endpoint: '/addEquipement',
//       successMessage: (result) => `✅ Équipement ajouté : ${result.libelle}`,
//       tableToReload: '#TableEquipement',
//     },
//     'addFichetech': {
//       endpoint: '/addFichTech',
//       successMessage: (result) => `✅ ${result.length} fiche(s) technique(s) ajoutée(s)`,
//       customDataProcessor: processFicheTechData2024,
//       tableToReload: '#TableEquipement'
//     },
//     'addProprietaire': {
//        endpoint: '/addProprietaire',
//     successMessage: (result) => `✅ Propriétaire ajouté : ${result.nomProprietaire}`,
//           customDataProcessor: ajouterProprietaireEtGenererRapport,  setupFilialeChangePourListeEmployes 
//     //   // Appelle cette fonction au chargement de la page ou lors de l’ouverture du formulaire
       
//      },
//        'addFiliale': {
//       endpoint: '/addFiliale',
//       successMessage: (result) => `✅ filiale ajouté : ${result.nomFiliale}`,
//       tableToReload: '#TableFiliale',
       
//     }
//   };

//   // Supprimer les anciens écouteurs pour éviter les doublons
//   $(document).off('submit', Object.keys(formConfigs).map(id => `#${id}`).join(','));

//   // Gestion unifiée avec délégation d'événements
//   $(document).on('submit', Object.keys(formConfigs).map(id => `#${id}`).join(','), function(e) {
//     e.preventDefault();
//     e.stopImmediatePropagation();

//     const formId = this.id;
//     const config = formConfigs[formId];
    
//     if (!config) {
//       console.warn(`⚠️ Configuration introuvable pour : ${formId}`);
//       return;
//     }

//     handleFormSubmission(this, config);
//   });

//   // Gestion bouton ajout caractéristique
//   $(document).off('click', '#add-caracteristique-btn');
//   $(document).on('click', '[onclick="addFiche()"], #add-caracteristique-btn', function(e) {
//     e.preventDefault();
//     addFiche();
//   });
// }
// //  Fonction utilitaire pour recharger la table
// function reloadEquipementTable() {
//   console.log("🔄 Rechargement table Équipements");
  
//   if (equipementTableInstance) {
//     equipementTableInstance.ajax.reload(null, false);
//     console.log("✅ Table rechargée avec succès");
//   } else {
//     console.warn("⚠️ Pas d'instance trouvée, tentative standard...");
//     if ($.fn.DataTable.isDataTable('#TableEquipement')) {
//       $('#TableEquipement').DataTable().ajax.reload();
//     }
//   }
// }
// function handleFormSubmission(form, config) {
//   console.log(`🚀 Soumission formulaire : ${form.id}`);

//   if ($(form).data('submitting')) {
//     console.log("⚠️ Soumission déjà en cours");
//     return;
//   }
//   $(form).data('submitting', true);

//   const $button = $(form).find('button[type="submit"]');
//   const originalText = $button.text();
//   $button.prop('disabled', true).text('En cours...');

//   const formData = new FormData(form);
//   let data = Object.fromEntries(formData.entries());

//   if (config.customDataProcessor) {
//     data = config.customDataProcessor(form, data);
//   }

//   console.log(`📤 Envoi données :`, data);

//   fetch(config.endpoint, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data)
//   })
//     .then(res => {
//       if (!res.ok) throw new Error("Erreur serveur : " + res.status);
//       return res.json();
//     })
//     .then(result => {
   
//       customAlert("✅ Mise à jour faite avec succès !", "success", true);
      
//       // ✅ UTILISER LA FONCTION DÉDIÉE pour recharger
//       if (config.tableToReload === '#TableEquipement') {
//         console.log("🎯 Rechargement via fonction dédiée");
//         reloadEquipementTable();
//       } else if (config.tableToReload) {
//         console.log(` Rechargement standard pour ${config.tableToReload}`);
//         // Pour les autres tables
//         setTimeout(() => {
//           if ($.fn.DataTable.isDataTable(config.tableToReload)) {
//             $(config.tableToReload).DataTable().ajax.reload();
//           }
//         }, 50);
//       } else {
//         console.warn("⚠️ Pas de tableToReload défini!");
//       }
      
//       form.reset();
//     })
//     .catch(err => {
//       console.error(`❌ Erreur :`, err);
//       customAlert("❌ Données non envoyées !", "error");
//     })
//     .finally(() => {
//       $(form).data('submitting', false);
//       $button.prop('disabled', false).text(originalText);
//     });
// }
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
      
      fiches.forEach((fiche) => {
    
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

// function processProprietaireData(form, data) {
//   console.log("🔧 Traitement données Proprietaire");
//   console.log("📋 Data brute reçue:", data);
  
//   // Récupération optimisée des champs via destructuring-like pattern
//   const getFieldValue = (selector) => {
//     const element = form.querySelector(selector);
//     return element?.value?.trim() || null;
//   };
  
//   // Récupérer toutes les valeurs en une seule passe
//   const [equipementId, filialeId] = [
//     getFieldValue('select[name="equipement"]'),
//     getFieldValue('select[name="filiale"]')
//   ].map(v => v ? Number(v) : null);
  
//   const [nom, prenom, fonction, departement, direction, matricule, unite] = [
//     'nom', 'prenom', 'fonction', 'departement', 'direction', 'matricule', 'unite'
//   ].map(name => getFieldValue(`input[name="${name}"]`));
  
//   // Récupérer et transformer les valeurs des fiches techniques
//   const valeurs = Array.from(document.querySelectorAll(".fiche-valeur-item"))
//     .map(item => {
//       const ficheId = item.getAttribute('data-fiche-id');
//       const valeur = item.querySelector("input[name^='valeur']")?.value?.trim();
      
//       if (!ficheId || !valeur) return null;
      
//       console.log(`📊 Fiche ID: ${ficheId}, Valeur: ${valeur}`);
//       return {
//         ficheTechId: Number(ficheId), 
//         valeur
//       };
//     })
//     .filter(Boolean); // Supprime les entrées null
  
//   // Construire le DTO
//   const processedData = {
//     nom,
//     prenom,
//     fonction,
//     departement,
//     direction,
//     matricule,
//     unite,
//     equipementId,
//     filialeId,
//     valeurs
//   };
  
//   console.log("✅ Données traitées Proprietaire:", processedData);
//   console.log("📊 Nombre de valeurs:", valeurs.length);
  
//   return processedData;
// }
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

// ------------GESTION MODALES--------
function openPopupModifierUser( Id,userId) {
    const modal = document.getElementById( Id);
    if (modal) {
        modal.style.display = "flex";
    }if (modal) {
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

// --------Popup equipement et filiale ,user
function openModal(url, defaultNom, title) {
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
    
  
 
  });
}
// ---------Popup proprietaie
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

//-----------Popup Fiche technique
function openModalFt(url, defaultNom, title) {
  console.log("📥 Ouverture modal :", url);
  
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
  console.log("🔒 Fermeture modal");
  $("#modal").css("display", "none");
  $("#modal-body").empty();
  
  // Reset du flag listener
  isEquipementSelectListenerAdded = false;
}


function showDetailft(equipementNom) {
  console.log("🔍 Chargement fiche technique pour :", equipementNom);

  $.ajax({
    url: `/ficheTechnique/${equipementNom}`, // ⚡ endpoint backend qui retourne la fiche complète
    method: "GET",
    success: function(data) {
      console.log("📦 Fiche technique :", data);

      // Construire le HTML du contenu
      let content = `
        <h5>Fiche technique : ${equipementNom}</h5>
        <ul class="list-group mt-3">
          ${data.map(item => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              ${item.attribut}
              <span class="badge bg-primary rounded-pill">${item.valeur}</span>
            </li>
          `).join("")}
        </ul>
      `;

      // Injecter dans le modal
      $("#modal-body").html(content);
      $("#modal .nav-popup h4").text("Détails Fiche Technique");
      $("#modal").css("display", "flex");
    },
    error: function(xhr) {
      console.error("❌ Erreur lors du chargement de la fiche technique :", xhr.responseText);
      customAlert("Impossible de charger la fiche technique !");
    }
  });
}
function openFicheModal(equipementId) {
  if (!equipementId) {
    console.error("openFicheModal: equipementId manquant");
    return;
  }

  currentFicheEquipementId = equipementId;
  console.log("🔎 Ouvrir modal fiches pour equipement:", equipementId);

  // Optional: trouver le nom de l'équipement depuis le cache allEquipements
  const eq = allEquipements.find(e => (e.idEquipement || e.id || e.id_equipement) == equipementId);
  const equipementName = eq ? eq.libelleEquipement : `#${equipementId}`;
 console.error("name manquant",eq  );
  // loader
  $("#modal .nav-popup h4").text(`Fiche technique — ${equipementName}`);
  $("#modal-body").html("<p>🔄 Chargement des fiches...</p>");
  $("#modal").css("display", "flex");

  fetch(`/equipement/${equipementId}`)
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(fiches => {
      if (!Array.isArray(fiches) || fiches.length === 0) {
        $("#modal-body").html("<p>Aucune fiche technique pour cet équipement.</p>");
        return;
      }

      let html = `<div class="list-group">`;
      fiches.forEach(f => {
        // adapter le nom de l'id suivant le JSON (id_ficheTechnique / idFicheTechnique / id)
        const ficheId = f.id_ficheTechnique || f.idFicheTechnique || f.id || f.id_ficheTechnique;
        const libelle = f.libelle || "—";
        html += `
          <div class="list-group-item d-flex justify-content-between align-items-center" data-fiche-id="${ficheId}">
            <div>
            <input class="form-control"  value="${libelle}">
            </div>
            <button class="btn btn-warning btn-sm updateft" >Modifier</button>

          </div>
        `;
      });
      html += `</div>`;

      $("#modal-body").html(html);
    })
    .catch(err => {
      console.error("Erreur chargement fiches :", err);
      $("#modal-body").html(`<div class="alert alert-danger">Erreur: ${err.message}</div>`);
    });
}
// Fonction pour mettre à jour une fiche
function updateFiche(ficheId, newLibelle) {
  console.log("📝 Mise à jour de la fiche:", ficheId, "=>", newLibelle);

  return fetch(`/${ficheId}/updateFiche`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ libelle: newLibelle })
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur HTTP " + res.status);
      return res.json();
    });
}
function updateFiliale(idFiliale, updatedData) {
  return fetch(`/${idFiliale}/updateFiliale`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  })
  .then(res => {
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
    passwordBdd: $container.find(".psw-filiale").val()
  };

  console.log("📡 ID Filiale :", filialeId);
  console.log("📝 Données à envoyer :", updatedData);

  updateFiliale(filialeId, updatedData)
    .then(data => {
      customAlert("✅ Filiale mise à jour avec succès !");
      console.log("📦 Réponse :", data);
         $('#TableFiliale').DataTable().ajax.reload(null, false);
      $("#modal").hide();
    })
    .catch(err => {
      customAlert("❌ Erreur lors de la mise à jour");
      console.error(err);
    });
});

// Gestion du clic sur le bouton "Modifier fiche tech"
$(document).on("click", ".updateft", function () {
  const parent = $(this).closest(".list-group-item");
  const Id = parent.data("fiche-id");
  const newLibelle = parent.find("input").val();

  updateFiche(Id, newLibelle)
    .then(data => {
      customAlert("✅ Fiche technique mise à jour !","success");
         $('#TableEquipement').DataTable().ajax.reload(null, false);
      console.log("Réponse backend:", data);
    })
    .catch(err => {
      customAlert("❌ Erreur lors de la mise à jour","error");
      console.error(err);
    });
});

// -------Fonction pour appeler l'API de mise à jour du mot de passe
function updateMotdePass(userId, newPassword) {
  return fetch(`/${userId}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }) // ✅ objet JSON
  })
  .then(res => {
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
    customAlert("Veuillez saisir un mot de passe.");
    return;
  }

  console.log("🔐 Mise à jour du mot de passe pour ID :", userId);

  updateMotdePass(userId, newPassword)
    .then(msg => {
      customAlert("mise a jour faite avec success " + msg);
      modal.hide();
    })
    .catch(err => {
      customAlert("❌ Erreur lors de la mise à jour");
      console.error(err);
    });
});

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

function showDetailsFiliale(row) {
  console.log("📋 Détail Filiale :", row);

  let html = ` <div class="p-3"  data-id-filiale="${row.idFiliale}">
      <div class="mb-2">
        <label class="form-label">Nom Fililale :</label>
        <input class=" form-control nom-filiale" value="${row.nomFiliale}" >
      </div>

      <div class="mb-2">
        <label class="form-label">Adresse Ip :</label>
        <input  class="form-control ip-filiale"  value="${row.adresseIp}" >
      </div>

      <div class="mb-2">
        <label class="form-label">Nom Bdd :</label>
        <input class="form-control bdd-filiale" value="${row.nomBdd}" >
      </div>

      <div class="mb-2">
        <label class="form-label">User Bdd:</label>
        <input  class="form-control user-filiale" value="${row.userBdd}">
      </div>
<div class="mb-2">
        <label class="form-label">password bdd:</label>
        <input class="form-control psw-filiale" value="${row.passwordBdd}">
      </div>
      <div class="mb-2">
        <label class="form-label">Date de creation:</label>
        <input class="form-control" value="${row.dateCreation ? new Date(row.dateCreation).toLocaleDateString('fr-FR') : ''}" readonly>
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
    customAlert("Mise à jour effectuée avec succès !");
    $("#modal").hide();

    // rafraîchir la datatable
    $('#TableEquipementProprietaire').DataTable().ajax.reload();
  })
  .catch(err => {
    console.error("❌ Erreur mise à jour :", err);
    customAlert("Erreur lors de la mise à jour.");
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

    console.log("📊 Chargement des fiches techniques pour l'équipement ID:", equipementId);
    fetch(`/byEquipement?idEquipement=${equipementId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Erreur HTTP: ' + res.status);
            }
            return res.json();
        })
        .then(data => {
            console.log("✅ Fiches reçues:", data);

            // Regrouper par ficheTechnique.libelle
            const grouped = {};
            data.forEach(item => {
                const libelle = item.libelleFiche;
                if (!grouped[libelle]) {
                    grouped[libelle] = [];
                }
                grouped[libelle].push({
                    id: item.idValeur,
                    valeur: item.valeur
                });
            });
            const container = document.getElementById("ficheTechContainer");
            if (!container) {
                console.warn("⚠️ Conteneur ficheTechContainer introuvable");
                return;
            }
            container.innerHTML = "";

            if (Object.keys(grouped).length === 0) {
                container.innerHTML = '<p class="no-data">Aucune fiche technique disponible pour cet équipement</p>';
                return;
            }

            // Générer les divs
            Object.keys(grouped).forEach(libelle => {
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
                grouped[libelle].forEach(obj => {
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

            console.log(`✅ ${Object.keys(grouped).length} fiche(s) technique(s) affichée(s)`);
        })
        .catch(err => {
            console.error("❌ Erreur chargement fiches:", err);
            const container = document.getElementById("ficheTechContainer");
            if (container) {
                container.innerHTML = '<p class="error-message">❌ Erreur lors du chargement des fiches techniques</p>';
            }
        });
}

function customAlert(message,type = "success", closeModal = false) {
  // Créer le fond semi-transparent
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0, 0, 0, 0.6)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "9999";
  const buttonColor = type === "success" ? "#198754" : "#dc3545"; // vert / rouge

  // Créer la boîte d’alerte
  const box = document.createElement("div");
  box.style.background = "#fff";
  box.style.fontWeight="600"
  box.style.padding = "2vw";
  box.style.borderRadius = "5px";
  box.style.textAlign = "center";
  box.style.minWidth = "40vw";
  box.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
  box.innerHTML = `
    <p style="font-family:sans-serif; font-size:16px;">${message}</p>
    <button id="ok-btn" style="
      background:${buttonColor};
      border:none; 
      padding:8px 16px;
      border-radius:6px; 
      color:white;
      font-weight:bold; 
      cursor:pointer;">
      OK
    </button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

 // Fermer l’alerte et le modal
  document.getElementById("ok-btn").addEventListener("click", () => {
    overlay.remove();
    if (closeModal) $("#modal").hide(); 
 //  ferme le modal  proprement
  });
}
function showDetailsFicheTechHistoriqueValues(row) {
  console.log("📋 Détail propriétaire :", row);
  
  // Afficher le modal avec un loader
  let html = `
    <div class="p-3">
      <h6 class="mt-3">Fiche technique :</h6>
      <div class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
    </div>
  `;
  $("#modal-body").html(html);
  $("#modal .nav-popup h4").text("Détail propriétaire");
  $("#modal").css("display", "flex");
  
  // Charger les fiches techniques via AJAX
  $.ajax({
    url: `/equipement-instance/${row.idEquipementInst}`,
    method: 'GET',
    success: function(valeurs) {
    
      
      let ficheHtml = `
        <div class="p-3">
          <h6 class="mt-3">Fiche technique :</h6>
          <ul class="list-group" id="fiche-tech-list">
      `;
      
      if (valeurs && valeurs.length > 0) {
        valeurs.forEach(v => {
          ficheHtml += `
            <li class="list-group-item">
              <label class="form-label">${v.libelleFiche}</label>
              <input class="form-control fiche-input" 
                     data-id="${v.idValeur}" 
                     value="${v.valeur}" readonly>
            </li>`;
        });
      } else {
        ficheHtml += `<li class="list-group-item">Aucune fiche technique disponible</li>`;
      }
      
      $("#modal-body").html(ficheHtml);
    },
    error: function(xhr, status, error) {
      console.error("❌ Erreur lors du chargement des fiches:", error);
      $("#modal-body").html(`
        <div class="alert alert-danger">
          Erreur lors du chargement des fiches techniques
        </div>
      `);
    }
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
// Événement lors de la sélection d'une filiale
// Fonction pour charger les employés quand la filiale change
// Fonction pour initialiser Select2
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

// async function ajouterProprietaireEtGenererRapport(form) {
//   console.log("🚀 Soumission du formulaire pour créer le propriétaire + générer le rapport");

//   // ✅ Petite fonction utilitaire pour récupérer la valeur d'un champ
//   const getFieldValue = (selector) => {
//     const element = form.querySelector(selector);
//     return element?.value?.trim() || null;
//   };

//   // 🧭 Récupération des champs principaux
//   const [equipementId, filialeId] = [
//     getFieldValue('select[name="equipement"]'),
//     getFieldValue('select[name="filiale"]')
//   ].map(v => (v ? Number(v) : null));

//   const [nom, prenom, fonction, departement, direction, matricule, unite] = [
//     'nom', 'prenom', 'fonction', 'departement', 'direction', 'matricule', 'unite'
//   ].map(name => getFieldValue(`input[name="${name}"]`));

//   // 🧾 Récupération des valeurs Fiche Technique
//   const valeurs = Array.from(document.querySelectorAll(".fiche-valeur-item"))
//     .map(item => {
//       const ficheId = item.getAttribute("data-fiche-id");
//       const valeur = item.querySelector("input[name^='valeur']")?.value?.trim();

//       if (!ficheId || !valeur) return null;

//       console.log(`📊 Fiche ID: ${ficheId}, Valeur: ${valeur}`);
//       return {
//         ficheTechId: Number(ficheId),
//         valeur
//       };
//     })
//     .filter(Boolean);

//   // 📦 DTO envoyé au backend
//   const dto = {
//     nom,
//     prenom,
//     fonction,
//     departement,
//     direction,
//     matricule,
//     unite,
//     equipementId,
//     filialeId,
//     valeurs
//   };

//   console.log("📤 Données envoyées au backend:", dto);

//   try {
//     const response = await fetch("/addProprietaire", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(dto)
//     });

//     if (!response.ok) {
//       throw new Error("❌ Erreur lors de la création du propriétaire");
//     }

//     // 📄 Récupérer le PDF envoyé par le backend
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     window.open(url, "_blank"); // ouvrir dans un nouvel onglet 🧾

//     console.log("✅ Rapport généré et ouvert avec succès");

//     // 🧼 Nettoyer le formulaire
//     form.reset();
//     document.getElementById("fiche-valeurs-container").innerHTML = "<p>Veuillez sélectionner un équipement</p>";
//   } catch (error) {
//     console.error("❌ Erreur:", error);
//     alert("Erreur lors de la génération du rapport");
//   }
// }

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
      successMessage: () => `✅ Propriétaire ajouté et rapport généré avec succès`,
      customDataProcessor: prepareProprietaireData,
      responseType: 'blob', // ⚠️ Indique que la réponse est un PDF
      onSuccess: handlePdfResponse // ⚠️ Callback spécial pour gérer le PDF
    },
    'addFiliale': {
      endpoint: '/addFiliale',
      successMessage: (result) => `✅ Filiale ajouté : ${result.nomFiliale}`,
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

// Fonction utilitaire pour recharger la table
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

// ✅ FONCTION DE GESTION UNIFIÉE AMÉLIORÉE
function handleFormSubmission(form, config) {
  console.log(`🚀 Soumission formulaire : ${form.id}`);

  if ($(form).data('submitting')) {
    console.log("⚠️ Soumission déjà en cours");
    return;
  }
  $(form).data('submitting', true);

  const $button = $(form).find('button[type="submit"]');
  const originalText = $button.text();
  $button.prop('disabled', true).text(config.responseType === 'blob' ? 'Génération en cours...' : 'En cours...');

  const formData = new FormData(form);
  let data = Object.fromEntries(formData.entries());

  // ✅ Permettre au customDataProcessor de transformer les données
  if (config.customDataProcessor) {
    data = config.customDataProcessor(form, data);
  }

  console.log(`📤 Envoi données :`, data);

  fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur serveur : " + res.status);
      
      // ✅ Gérer les réponses blob (PDF) ou JSON selon config
      if (config.responseType === 'blob') {
        return res.blob();
      }
      return res.json();
    })
    .then(result => {
      // ✅ Si c'est un PDF, utiliser le callback personnalisé
      if (config.responseType === 'blob' && config.onSuccess) {
        config.onSuccess(result, form);
      } else {
        // Gestion standard pour JSON
        customAlert(config.successMessage(result), "success", true);
        
        // Recharger les tables si nécessaire
        if (config.tableToReload === '#TableEquipement') {
          console.log("🎯 Rechargement via fonction dédiée");
          reloadEquipementTable();
        } else if (config.tableToReload) {
          console.log(`🔄 Rechargement standard pour ${config.tableToReload}`);
          setTimeout(() => {
            if ($.fn.DataTable.isDataTable(config.tableToReload)) {
              $(config.tableToReload).DataTable().ajax.reload();
            }
          }, 50);
        }
        
        form.reset();
      }
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

// ✅ FONCTION SIMPLIFIÉE : PRÉPARE UNIQUEMENT LES DONNÉES
function prepareProprietaireData(form, data) {
  console.log("📦 Préparation des données du propriétaire");

  // ✅ Fonction utilitaire pour récupérer la valeur d'un champ
  const getFieldValue = (selector) => {
    const element = form.querySelector(selector);
    return element?.value?.trim() || null;
  };

  // 🧭 Récupération des champs principaux
  const equipementId = getFieldValue('select[name="equipement"]');
  const filialeId = getFieldValue('select[name="filiale"]');

  // 🧾 Récupération des valeurs Fiche Technique
  const valeurs = Array.from(document.querySelectorAll(".fiche-valeur-item"))
    .map(item => {
      const ficheId = item.getAttribute("data-fiche-id");
      const valeur = item.querySelector("input[name^='valeur']")?.value?.trim();

      if (!ficheId || !valeur) return null;

      console.log(`📊 Fiche ID: ${ficheId}, Valeur: ${valeur}`);
      return {
        ficheTechId: Number(ficheId),
        valeur
      };
    })
    .filter(Boolean);

  // 📦 Construction du DTO
  const dto = {
    nom: getFieldValue('input[name="nom"]'),
    prenom: getFieldValue('input[name="prenom"]'),
    fonction: getFieldValue('input[name="fonction"]'),
    departement: getFieldValue('input[name="departement"]'),
    direction: getFieldValue('input[name="direction"]'),
    matricule: getFieldValue('input[name="matricule"]'),
    unite: getFieldValue('input[name="unite"]'),
    equipementId: equipementId ? Number(equipementId) : null,
    filialeId: filialeId ? Number(filialeId) : null,
    valeurs
  };

  console.log("✅ Données préparées:", dto);
  return dto;
}

// ✅ FONCTION QUI GÈRE L'AFFICHAGE DU PDF
function handlePdfResponse(blob, form) {
  console.log("📄 Traitement de la réponse PDF");

  try {
    // ✅ Vérifier que c'est bien un PDF
    if (blob.type !== 'application/pdf') {
      throw new Error("❌ Le fichier reçu n'est pas un PDF");
    }

    // 📋 Récupérer le nom du propriétaire pour le nom du fichier
    const nom = form.querySelector('input[name="nom"]')?.value?.trim() || 'proprietaire';
    const prenom = form.querySelector('input[name="prenom"]')?.value?.trim() || '';
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_${nom}_${prenom}_${Date.now()}.pdf`;
    
    // 🖱️ Ouvrir dans un nouvel onglet ET télécharger
    window.open(url, "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 🧹 Libérer la mémoire après un délai
    setTimeout(() => window.URL.revokeObjectURL(url), 100);

    console.log("✅ Rapport généré et ouvert avec succès");

    // ✅ Afficher message de succès
    customAlert("✅ Propriétaire créé et rapport généré avec succès !", "success", true);

    // 🧼 Nettoyer le formulaire
    form.reset();
    const container = document.getElementById("fiche-valeurs-container");
    if (container) {
      container.innerHTML = "<p>Veuillez sélectionner un équipement</p>";
    }

  } catch (error) {
    console.error("❌ Erreur lors du traitement du PDF:", error);
    customAlert(`❌ Erreur lors de l'affichage du rapport: ${error.message}`, "error");
  }
}

// // ==========================================
// // 🎯 FONCTIONS GLOBALES
// // ==========================================
// window.loadContent = loadContent;
// window.addFiche = addFiche;
// window.removeFiche = removeFiche;
// window.openModal = openModal;
// window.closeModal = closeModal;

// window.chargerDetailsFiliale = chargerDetailsFiliale;
// window.handleFilialeChange = handleFilialeChange;
// window.initTableSearchEquipement = initTableSearchEquipement;
