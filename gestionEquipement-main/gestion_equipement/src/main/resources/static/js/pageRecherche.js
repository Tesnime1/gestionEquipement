
// Variables globales (déclarées une seule fois)
let allEquipements = []; // Cache pour les équipements
let isEquipementSelectListenerAdded = false; // Flag pour éviter les doublons
let currentFicheEquipementId = null;
let equipementTableInstance = null;
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