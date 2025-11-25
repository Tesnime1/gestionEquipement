package com.gestion_equipment.gestion_equipement.controller;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.gestion_equipment.gestion_equipement.dto.*;
import com.gestion_equipment.gestion_equipement.model.*;
import com.gestion_equipment.gestion_equipement.repository.EquipementInstance_Repo;
import com.gestion_equipment.gestion_equipement.repository.FilialeRepo;
import com.gestion_equipment.gestion_equipement.service.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;



@RestController
public class PrincipalController{
@Autowired
private ConnexionDB connexionDB;

@Autowired
private FilialeRepo filialeRepo;
@Autowired
private EquipementInstance_Repo equipementInstrepo;

    private FilialeService serviceService;
    private UtilisateurService utilisateurService;
    private EquipementService equipementService;
    private FicheTechService ficheTechService;
    private EquipmentInstService equipmentInstService;
    private HistoriqueService historiqueService;
    private FtValService ftValeurService;
    private FilialeService filialeService;

    public PrincipalController(FilialeService serviceService,UtilisateurService utilisateurService,FicheTechService ficheTechService 
    ,EquipementService equipementService,EquipmentInstService equipmentInstService,HistoriqueService historiqueService ,
    FtValService ftValeurService ,FilialeService filialeService) {
        this.serviceService=serviceService;
        this.utilisateurService=utilisateurService;
        this.ficheTechService=ficheTechService;
        this.equipementService=equipementService;
        this.equipmentInstService=equipmentInstService;
        this.historiqueService=historiqueService;
        this.ftValeurService=ftValeurService;
        this.filialeService=filialeService;

    }



    @PostMapping("/addFiliale")
    public ResponseEntity<Filiale> addFiliale(@RequestBody Filiale filiale){
      Filiale saved =filialeService.creatFiliale(filiale);
      return ResponseEntity.ok(saved); 
    }
   
    @GetMapping("/Filiales")
    public List<FilialeDetailDTO> getAllFiliales() {
    return serviceService.getAllFiliales();
    }

    @GetMapping("/NomIdFiliales")
     public ResponseEntity<List<FilialeDTO>> getAllFilialesIdAndNom() {
        List<FilialeDTO> filiales = filialeService.getAllFilialesIdAndNom();
        return ResponseEntity.ok(filiales);
    }

    @PostMapping("/addUser")
    public ResponseEntity<Utilisateur> addUtilisateur(@RequestBody Utilisateur utilisateur){
    utilisateur.setDateCreation(LocalDateTime.now());
    Utilisateur saved = utilisateurService.creatUtilisateur(utilisateur);
    return ResponseEntity.ok(saved);
    }
   
    @GetMapping(value="/Users" ,produces=MediaType.APPLICATION_JSON_VALUE)
    public List<UtilisateurDTO> getAllUtilisateurs() {
    return utilisateurService.getAllUtilisateurs();
    }
   
    @PostMapping("/addEquipement")
    public ResponseEntity<Equipement> addEquipement(@RequestBody Equipement equipement){
    equipement.setDateCreation(LocalDateTime.now());
    Equipement saves = equipementService.creatEquipement(equipement);
    return ResponseEntity.ok(saves);
    }
   
    @GetMapping("/Equipements")
    public List<Equipement> getAllEquipement() {
    return equipementService.getAllEquipements();
    }
    
    @GetMapping("/details")
    public ResponseEntity<List<EquipementInstProprietaireDTO>> getDetailsInstances() {
        List<EquipementInstProprietaireDTO> details = equipmentInstService.getDetailsInstances();
        return ResponseEntity.ok(details);
    }
   
    @PostMapping("/addFichTech")
    public ResponseEntity<List<FicheTechnique>> addFicheTech(@RequestBody FicheTechRequest request) {
    
    List<FicheTechnique> saved = ficheTechService.createFichesForEquipement(request.getEquipementId(),request.getLibelles());
    return ResponseEntity.ok(saved);
    }
   
    @GetMapping("/FicheTechs")
    public List<FicheTechnique> getAllFicheTechniques() {
    return ficheTechService.getAllFicheTechs();
    }
   
    @GetMapping("/Proprietaires")
    public List<ProprietaireEquipementDTO> getAllProprietaires() {
    return equipmentInstService.getAllProprietaire();
    }

 // Dans votre contrôleur
    @GetMapping("/equipementFiches" )
    public List<EquipementFichesDTO> getAllEquipements() {
    return equipementService.getAllEquipementsWithFiches();
    }
   
 
    @PutMapping("/{idEquipementInst}/proprietaire")
    public ResponseEntity<ProprietaireEquipementDTO> updateProprietaireEtFiches(@PathVariable Long idEquipementInst,@RequestBody ProprietaireEquipementDTO dto) {
    ProprietaireEquipementDTO updated = equipmentInstService.updateProprietaire(idEquipementInst, dto);
    return ResponseEntity.ok(updated);
     }
   
    @PutMapping("/{idEquipementInst}/ficheTechvalue")
    public ResponseEntity<List<FicheTechValeurDTO>> updateFiche(  @PathVariable Long idEquipementInst,@RequestBody EquipementInstDTO dto) {
       List<FicheTechValeurDTO> updatedvalues = equipmentInstService.updateFicheTechValeurs(idEquipementInst, dto.getValeurs());
        return ResponseEntity.ok(updatedvalues);
    }
   
    @GetMapping("/historique")
    public ResponseEntity<List<HistoriqueCompletDTO>> getHistory() {
      return ResponseEntity.ok( historiqueService.getAllHistorique() );
     }
   
    @GetMapping("/ProprietairesParEquipement")
    public List<EquipementInstance> getProprietairesParEquipement(@RequestParam Long equipementId) {
    return equipmentInstService.getProprietairebyEquipement(equipementId);
    }
   
    @GetMapping("/byEquipement")
    public List<FicheTechValeurDTO> getFichesAvecValeurByEquipement(@RequestParam Long idEquipement) {
        return ftValeurService.getFichesAvecValeurByEquipement(idEquipement);
    }
    
    @PutMapping("/{id}/updateFiche")
    public ResponseEntity<FicheTechnique> updateFiche( @PathVariable Long id, @RequestBody FicheTechnique ficheMaj) {
        FicheTechnique updated = ficheTechService.updateLibelle(id, ficheMaj.getLibelle());
        return ResponseEntity.ok(updated);
    }
        
    @PutMapping("/{id}/updateEquipement")
    public ResponseEntity<Equipement> updateEquipement( @PathVariable Long id, @RequestBody Equipement equiMaj) {
        Equipement updatedEqui = equipementService.updateEquipement(id, equiMaj.getLibelle());
                System.out.println("📤 Retourne : " + updatedEqui);

        return ResponseEntity.ok(updatedEqui);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProprietaireEquipementDTO>> getProprietairesAvecValeurs(
            @RequestParam(required = false) Long equipementId,
            @RequestParam(required = false) Long filialeId,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String fonction,
            @RequestParam(required = false) String unite,
            @RequestParam(required = false) List<String> valeurs
    ) {
        List<ProprietaireEquipementDTO> result =
                equipmentInstService.getProprietairesAvecValeurs(
                        equipementId,
                        filialeId,
                        valeurs,
                        direction,
                        departement,
                        fonction,
                        unite
                );

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {

    String newPassword = body.get("password");
    boolean updated = utilisateurService.updatePassword(id, newPassword);

    if (updated) {
        return ResponseEntity.ok("Mot de passe mis à jour avec succès !");
    } else {
        return ResponseEntity.notFound().build();
    }
}
    
    @PutMapping("/{id}/updateFiliale")
    public ResponseEntity<Filiale> updateFiliale(
            @PathVariable Long id,
            @RequestBody Filiale filiale
    ) {
        Filiale updated = filialeService.updateFiliale(id, filiale);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/equipement-instance/{idEquipementInstance}")
    public ResponseEntity<List<FicheTechValeurDTO>> getFichesByEquipementInstance(
            @PathVariable Long idEquipementInstance) {
        List<FicheTechValeurDTO> fiches = ftValeurService.getFichesByEquipementInstance(idEquipementInstance);
        
        System.out.println("✅ Nombre de fiches trouvées : " + fiches.size());
        fiches.forEach(f -> System.out.println("   - " + f));
        
        return ResponseEntity.ok(fiches);
    }
      
    /*** Teste la connexion à une filiale* POST /api/filiales/test-connexion*/
    @PostMapping("/test-connexion")
    public ResponseEntity<?> testerConnexion(@RequestBody Filiale filiale) {
        boolean success = connexionDB.testerConnexion(filiale);
        
        if (success) {
            return ResponseEntity.ok()
                .body("Connexion réussie à la base de données '" 
                      + filiale.getNomBdd() + "'");
        } else {
            return ResponseEntity.status(500)
                .body("Échec de la connexion. Vérifiez les paramètres.");
        }
    }

    /*** Récupère les propriétaires d'une filiale * GET /api/filiales/1/proprietaires*/
@GetMapping(value="/{id}/proprietaires",produces=MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<?> getEmployes(@PathVariable Long id) {
        return filialeRepo.findById(id)
            .<ResponseEntity<?>>map(filiale -> {
                try {
                    List<EmployeDTO> employes = connexionDB.getEmployes(filiale);
                    return ResponseEntity.ok(employes);
                } catch (RuntimeException ex) {
                    return ResponseEntity.status(500)
                        .body("Erreur de connexion à la base de données: " + ex.getMessage());
                }
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
@GetMapping("/details-filiale/{filialeId}")
public ResponseEntity<List<EquipementInstFilialeDTO>> getDetailsByFiliale(
            @PathVariable Long filialeId) {
        try {
            List<EquipementInstFilialeDTO> details = equipmentInstService.getDetailsByFiliale(filialeId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
}
   
@PostMapping("/addEquipementAndFicheTech")
public ResponseEntity<?> createEquipement(@RequestBody EquipementFichesDTO dto) {
    try {
        // Validation basique
        if (dto.getLibelleEquipement() == null || dto.getLibelleEquipement().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Le libellé de l'équipement est obligatoire"
            ));
        }
        
        Equipement equipement = ficheTechService.createEquipementWithFiches(dto);      
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Équipement créé avec succès",
            "equipement", equipement
        ));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "Erreur lors de la création : " + e.getMessage()
        ));
    }
}

@GetMapping("/detailsReport")
public ResponseEntity<List<EquipementInstProprietaireDTO>> getDetailInstForReport() {
    List<EquipementInstProprietaireDTO> details = equipmentInstService.getDetailsInstancesAvecFicheTech();
    return ResponseEntity.ok(details);
}

@PostMapping("/addProprietaire")
public ResponseEntity<EquipementInstance> addProprietaire(@RequestBody EquipementInstDTO dto,Principal principal) {

    EquipementInstance saved = equipmentInstService.createProprietaireWithValeurs(dto, principal.getName());
        return ResponseEntity.ok(saved);
    }
 
// recuperer le document scanner depui le D:/rapports_scannes
@GetMapping("/scanner/{id}")
public ResponseEntity<Resource> getScannedDocument(@PathVariable Long id) throws IOException {
    
    EquipementInstance equipement = equipementInstrepo.findById(id).orElseThrow();
    String matricule = equipement.getMatricule();
    String nomFichier = "DocumentEquipementScanné_"+ matricule + "_"+ id + ".pdf";
    Path filePath = Paths.get("D:\\rapports_scannes").resolve(nomFichier);

    if (!Files.exists(filePath)) {
        return ResponseEntity.notFound().build();
    }
System.out.println("🔍 Vérification du fichier : " + filePath.toAbsolutePath());
    Resource resource = new UrlResource(filePath.toUri());

    return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF) // 👈 on force le type PDF
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nomFichier + "\"")
            .body(resource);
}

//pour generer le document d'attribution d'un equipement
@GetMapping("/scannerr/{id}")
public  void getDetailReport(@PathVariable Long id , HttpServletResponse response) throws JRException, IOException {
    // 1️⃣ Récupérer les données de ton DTO
       EquipementInstProprietaireDTO dto = equipmentInstService.getDetailsInstancesAvecFicheTech()
        .stream()
        .filter(item -> id.equals(item.getIdEquipementInst()))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Aucun équipement trouvé avec ID " + id));  

    // 2️⃣ Charger le fichier .jrxml
    InputStream reportStream = getClass().getResourceAsStream("/reports/detailsEquipement.jrxml");
    JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

    // 3️⃣ Préparer les paramètres ($P{})
    Map<String, Object> params = new HashMap<>();
    params.put("proprietaire", dto.getProprietaire());
    params.put("direction", dto.getDirection());
    params.put("departement", dto.getDepartement());
    params.put("fonction", dto.getFonction());
    params.put("dateDajout", java.sql.Timestamp.valueOf(dto.getDateDajout())); // 🕒 corrige le format
    params.put("equipement", dto.getEquipement());
    params.put("matricule", dto.getMatricule());
    params.put("nomFiliale", dto.getNomFiliale());

    // ⚙️ Si ton rapport affiche la liste des valeurs techniques
    // (FicheTechValeurDTO : nom, valeur, etc.)
    // tu peux les passer comme une dataSource secondaire
     // 5️⃣ Créer la source de données principale (une seule ligne)
    // 4️⃣ Sous-dataset : valeurs techniques (Dataset1 dans le .jrxml)
    List<FicheTechValeurDTO> valeurs = dto.getValeurs() != null ? dto.getValeurs() : List.of();
    JRBeanCollectionDataSource sousData = new JRBeanCollectionDataSource(valeurs);
    params.put("Dataset1", sousData);

    // 5️⃣ DataSource principale : une seule ligne du DTO
    JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(List.of(dto));

    JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);

    // 8️⃣ Configuration de la réponse HTTP — 📄 affichage inline (pas de téléchargement)
    response.setContentType("application/pdf");
    response.setHeader("Content-Disposition", "inline; filename=DocumentEquipement_" + id + ".pdf");

    // 9️⃣ Écrire le PDF dans le flux de réponse
    JasperExportManager.exportReportToPdfStream(jasperPrint, response.getOutputStream());
}

//pour generer le document de restitution d'un equipement
@GetMapping("/documentRestitution/{id}")
public void getDetailReportRestitution(@PathVariable Long id, HttpServletResponse response)
        throws JRException, IOException {

    // 1️⃣ Récupérer le DTO complet
    HistoriqueCompletDTO dto = historiqueService.getHistoryById(id);

    if (dto == null) {
        throw new RuntimeException("Aucun historique trouvé avec l'ID " + id);
    }

    // 🔥 Construire une chaîne HTML contenant toutes les caractéristiques
    StringBuilder liste = new StringBuilder();

    if (dto.getValeurs() != null && !dto.getValeurs().isEmpty()) {
        for (FicheTechValeurDTO v : dto.getValeurs()) {
            liste.append("<b>")
                 .append(v.getLibelleFiche())
                 .append(" :</b> ")
                 .append(v.getValeur())
                 .append("<br><br>");
        }
    } else {
        liste.append("Aucune caractéristique trouvée");
    }

    // 2️⃣ Charger le fichier JRXML
    InputStream reportStream = getClass().getResourceAsStream("/reports/rapportRestitution.jrxml");
    JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

    // 3️⃣ Paramètres du rapport
    Map<String, Object> params = new HashMap<>();
    params.put("ancienProprietaire", dto.getAncienProprietaire());
    params.put("equipement", dto.getEquipement());

    params.put("dateModification",
            java.util.Date.from(dto.getDateModification()
                    .atZone(ZoneId.systemDefault())
                    .toInstant()));

    params.put("listeCaracteristique", liste.toString()); // ⬅️ IMPORTANT !!

    // 4️⃣ DataSource (même si non utilisé dans le rapport)
    JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(List.of(dto));

    // 5️⃣ Génération PDF
    JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);

    // 6️⃣ Réponse HTTP
    response.setContentType("application/pdf");
    response.setHeader("Content-Disposition", "inline; filename=DocumentRestitution_" + id + ".pdf");

    JasperExportManager.exportReportToPdfStream(jasperPrint, response.getOutputStream());
}

// pour enregistrer le document scanné dans le dossier D:/rapportsScannes et modifier l'etat de scanne a true
@PutMapping("/{id}/scanner")
public ResponseEntity<?> updateScanner(
        @PathVariable Long id,
        @RequestParam(value = "file", required = false) MultipartFile file) {

    try {
        // 1️⃣ Mettre à jour le flag scanner dans la BDD
        EquipementInstance equipement = equipmentInstService.updateScanner(id);
          // 2️⃣ Récupérer matricule (ex : "MAT2025")
        String matricule = equipement.getMatricule();
        Long idEquipement = equipement.getIdEquipementInstance();

        // 2️⃣ Si un fichier est envoyé, on le sauvegarde
        if (file != null && !file.isEmpty()) {
            // Dossier de stockage (à adapter à ton chemin réel)
            Path dossier = Paths.get("D:\\rapports_scannes");
            if (!Files.exists(dossier)) {
                Files.createDirectories(dossier);
            }

            // Nom du fichier, exemple: equipement_1.pdf
            String nomFichier = "DocumentEquipementScanné_" + matricule + "_" + idEquipement + ".pdf";
            Path cheminFichier = dossier.resolve(nomFichier);

            // Sauvegarde sur disque
            Files.copy(file.getInputStream(), cheminFichier, StandardCopyOption.REPLACE_EXISTING);

            // Enregistrer le chemin du fichier en base (si tu as un champ pour ça)
            // equipement.setScannerPath(cheminFichier.toString());
            // equipementInstrepo.save(equipement);
        }

        // ✅ Retourner une réponse JSON
        Map<String, Object> response = new HashMap<>();
        response.put("idEquipementInstance", equipement.getIdEquipementInstance());
        response.put("scanner", equipement.isScanner());

        return ResponseEntity.ok(response);

    } catch (EntityNotFoundException e) {
        return ResponseEntity.notFound().build();
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la mise à jour du scanner");
    }
}
  
@GetMapping("/detailsRapport/{id}")
public void getDetailReportById(@PathVariable Long id, HttpServletResponse response) throws Exception {
    // 1️⃣ Récupérer les infos d’un seul équipement
    EquipementInstProprietaireDTO dto = equipmentInstService.getDetailsInstancesAvecFicheTech()
            .stream()
            .filter(item -> id.equals(item.getIdEquipementInst()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Aucun équipement trouvé avec ID " + id));

    List<EquipementInstProprietaireDTO> list = List.of(dto);
    JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(list);

    // 2️⃣ Charger le rapport
    InputStream reportStream = getClass().getResourceAsStream("/reports/detailsEquipement.jrxml");
    if (reportStream == null) {
        throw new IllegalStateException("Le fichier Document_Equipement.jrxml est introuvable !");
    }

    JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

    // 3️⃣ Paramètres
    Map<String, Object> params = new HashMap<>();
    params.put("TitreRapport", "Document - " + dto.getEquipement());

    JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);

    // 4️⃣ Envoyer le PDF dans la réponse HTTP
    response.setContentType("application/pdf");
    response.setHeader("Content-Disposition", "inline; filename=fiche_technique_" + id + ".pdf");
    JasperExportManager.exportReportToPdfStream(jasperPrint, response.getOutputStream());
}

@GetMapping("/equipement/{idEquipement}") 
public ResponseEntity<List<FicheTechnique>> getFichesByEquipement(@PathVariable Long idEquipement)
     { return ResponseEntity.ok(ficheTechService.getFichesByEquipement(idEquipement)); }

@PutMapping("/equipement/update")
public ResponseEntity<EquipementFichesDTO> updateEquipement(@RequestBody EquipementFichesDTO dto) {
    return ResponseEntity.ok(ficheTechService.updateEquipementAndFiches(dto));
}

@GetMapping("/historique/{idEquipementInstance}")
public List<HistoriqueCompletDTO> getHistoriqueParEquipementInstance(@PathVariable Long idEquipementInstance) {
        return historiqueService.getHistoriqueByEquipementInstance(idEquipementInstance);
    }

}
