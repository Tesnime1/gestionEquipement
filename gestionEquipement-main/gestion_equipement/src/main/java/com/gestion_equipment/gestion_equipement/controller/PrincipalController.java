package com.gestion_equipment.gestion_equipement.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gestion_equipment.gestion_equipement.dto.*;
import com.gestion_equipment.gestion_equipement.model.*;
import com.gestion_equipment.gestion_equipement.repository.FicheTechValeur_Repo;
import com.gestion_equipment.gestion_equipement.repository.FilialeRepo;
import com.gestion_equipment.gestion_equipement.service.*;





@RestController
public class PrincipalController{
@Autowired
private ConnexionDB connexionDB;

@Autowired
private FilialeRepo filialeRepo;

@Autowired
 private  FicheTechValeur_Repo ficheTechValeurRepo;

@Autowired
 private  RapportService rapportService;

 
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
   
    // @PostMapping("/addProprietaire")
    // public ResponseEntity<EquipementInstance> addProprietaire(@RequestBody EquipementInstDTO dto,Principal principal) {

    // EquipementInstance saved = equipmentInstService.createProprietaireWithValeurs(dto, principal.getName());
    //     return ResponseEntity.ok(saved);
    // }
    

    @GetMapping("/Proprietaires")
    public List<ProprietaireEquipementDTO> getAllProprietaires() {
    return equipmentInstService.getAllProprietaire();
    }

 // Dans votre contrôleur
    @GetMapping("/equipementFiches" )
    public List<EquipementFichesDTO> getAllEquipements() {
    return equipementService.getAllEquipementsWithFiches();
    }
   
    @GetMapping("/equipement/{idEquipement}") 
    public ResponseEntity<List<FicheTechnique>> getFichesByEquipement(@PathVariable Long idEquipement)
     { return ResponseEntity.ok(ficheTechService.getFichesByEquipement(idEquipement)); }

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
        
        System.out.println("🔍 Recherche des fiches pour l'équipement instance : " + idEquipementInstance);
        
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
    
    // @GetMapping("/Proprietaires/FicheTechvalue")
    // public List<ProprietaireEquipementDTO> getAllProprietairesAndFTV() {
    // return equipmentInstService.getAllProprietaireAndFTV();
    // }
}