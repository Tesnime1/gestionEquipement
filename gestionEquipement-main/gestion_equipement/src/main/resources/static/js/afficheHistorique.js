// ---------Popup proprietaie
// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
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
function getScrollHeight() {
  return ($(window).height() - 180) + "px";
}
function initEquipementHistoriqueTable() {
console.log("📊 Initialisation tableau historique équipements");
 
    $('#TableEquipementHistorique').DataTable({
      paging: false,
    responsive: true,   // ✅ tableau adaptable
    scrollCollapse: true, 
    scrollY: getScrollHeight(),
    autoWidth: false,   // ✅ empêche DataTables de fixer des largeurs figées
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
      }
    });
   

}
document.addEventListener("DOMContentLoaded", initEquipementHistoriqueTable);
// Variables globales (déclarées une seule fois)
// ----- GESTION UNIFIÉE DES FORMULAIRES

// Événement lors de la sélection d'une filiale
// Fonction pour charger les employés quand la filiale change
// Fonction pour initialiser Select2
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
// ========================================
function prepareProprietaireData(form, data) {
  console.log("📦 Préparation des données");
  
  const getFieldValue = (selector) => {
    const element = form.querySelector(selector);
    return element?.value?.trim() || null;
  };

  const equipementId = getFieldValue('select[name="equipement"]');
  const filialeId = getFieldValue('select[name="filiale"]');

  const valeurs = Array.from(document.querySelectorAll(".fiche-valeur-item"))
    .map(item => {
      const ficheId = item.getAttribute("data-fiche-id");
      const valeur = item.querySelector("input[name^='valeur']")?.value?.trim();
      if (!ficheId || !valeur) return null;
      return { ficheTechId: Number(ficheId), valeur };
    })
    .filter(Boolean);

  return {
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