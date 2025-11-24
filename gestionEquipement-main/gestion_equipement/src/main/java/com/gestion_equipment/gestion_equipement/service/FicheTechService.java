package com.gestion_equipment.gestion_equipement.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.gestion_equipment.gestion_equipement.dto.EquipementFichesDTO;
import com.gestion_equipment.gestion_equipement.model.Equipement;
import com.gestion_equipment.gestion_equipement.model.FicheTechnique;
import com.gestion_equipment.gestion_equipement.model.Utilisateur;
import com.gestion_equipment.gestion_equipement.repository.EquipementRepo;
import com.gestion_equipment.gestion_equipement.repository.FicheTech_Repo;
import com.gestion_equipment.gestion_equipement.repository.Utilisateur_Repo;

import jakarta.transaction.Transactional;

@Service
public class FicheTechService {
    private final FicheTech_Repo ficheTechRepo;
    private final EquipementRepo equipementRepo;
    private final Utilisateur_Repo utilisateurRepo;
    
    public FicheTechService(FicheTech_Repo ficheTechRepo,EquipementRepo equipementRepo ,Utilisateur_Repo utilisateurRepo){
        this.ficheTechRepo=ficheTechRepo;
        this.equipementRepo=equipementRepo;
        this.utilisateurRepo=utilisateurRepo;

    }
    
    public FicheTechnique creatFicheTech(FicheTechnique ficheTech ) {
        return ficheTechRepo.save(ficheTech);
    }
    
    public List<FicheTechnique> getAllFicheTechs( ) {
        return ficheTechRepo.findAll();
    }
    
    public List<FicheTechnique> createFichesForEquipement(Long equipementId, List<String> libelles) {
    Equipement equipement = equipementRepo.findById(equipementId)
            .orElseThrow(() -> new RuntimeException("Équipement introuvable avec ID: " + equipementId));
    // 👤 Récupérer l'utilisateur connecté
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        //  Chercher l'utilisateur en base
        Utilisateur user = utilisateurRepo.findByNom(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + username));

    List<FicheTechnique> fiches = new ArrayList<>();

    for (String libelle : libelles) {
        FicheTechnique fiche = new FicheTechnique();
       fiche.setDateCreation(LocalDateTime.now());
        fiche.setLibelle(libelle);
        fiche.setEquipement(equipement);
        fiche.setDateCreation(LocalDateTime.now());
        fiches.add(fiche);
        fiche.setUtilisateur(user);
    }  
    return ficheTechRepo.saveAll(fiches);
}
   
    public List<FicheTechnique> getFichesByEquipement(Long  idEquipement) {
        return ficheTechRepo.findByEquipement_IdEquipement(idEquipement);
    }
   
   public FicheTechnique updateLibelle(Long id, String newLibelle) {
        FicheTechnique fiche = ficheTechRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiche introuvable avec id " + id));

        fiche.setLibelle(newLibelle);
        return ficheTechRepo.save(fiche);
    }

    @Transactional
    public EquipementFichesDTO updateEquipementAndFiches(EquipementFichesDTO dto) {

     // Récupérer l'utilisateur connecté
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    Utilisateur user = utilisateurRepo.findByNom(username)
            .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + username));

    LocalDateTime now = LocalDateTime.now();

    // ---- ÉQUIPEMENT ----
    Equipement equipement = equipementRepo.findById(dto.getIdEquipement())
        .orElseThrow(() -> new RuntimeException("Équipement introuvable"));

    equipement.setLibelle(dto.getLibelleEquipement());
    equipement.setDateCreation(now);
    equipement.setUtilisateur(user);

    equipementRepo.save(equipement);

    // ---- FICHES TECHNIQUES ----
    if (dto.getFiches() != null) {
        for (FicheTechnique ficheDTO : dto.getFiches()) {

            FicheTechnique fiche = ficheTechRepo.findById(ficheDTO.getIdFicheTechnique())
                .orElseThrow(() -> new RuntimeException("Fiche introuvable"));

            fiche.setLibelle(ficheDTO.getLibelle());
            fiche.setDateCreation(now);
            fiche.setUtilisateur(user);

            ficheTechRepo.save(fiche);
        }
    }

    dto.setDate(now);
    return dto;
}

    @Transactional
    public Equipement createEquipementWithFiches(EquipementFichesDTO dto) {
    // Récupérer l'utilisateur connecté
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    Utilisateur user = utilisateurRepo.findByNom(username)
            .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + username));

    // Créer l'équipement
    Equipement equipement = new Equipement();
    equipement.setLibelle(dto.getLibelleEquipement());
    equipement.setDateCreation(LocalDateTime.now());
    equipement.setUtilisateur(user);
    
    // Sauvegarder l'équipement d'abord
    equipement = equipementRepo.save(equipement);

    // Si des fiches techniques sont fournies, les créer
    if (dto.getFiches() != null && !dto.getFiches().isEmpty()) {
        List<FicheTechnique> fichesToSave = new ArrayList<>();
        
        for (FicheTechnique fiche : dto.getFiches()) {
            // Ignorer les fiches nulles ou avec libellé vide
            if (fiche != null && fiche.getLibelle() != null && !fiche.getLibelle().trim().isEmpty()) {
                // Créer une nouvelle instance pour éviter les problèmes de détachement
                FicheTechnique nouvelleFiche = new FicheTechnique();
                nouvelleFiche.setLibelle(fiche.getLibelle().trim());
                nouvelleFiche.setDateCreation(LocalDateTime.now());
                nouvelleFiche.setEquipement(equipement);
                nouvelleFiche.setUtilisateur(user);
                
                // Si votre FicheTechnique a d'autres propriétés à copier
                // Ajoutez-les ici, par exemple :
                // nouvelleFiche.setDescription(fiche.getDescription());
                // nouvelleFiche.setValeur(fiche.getValeur());
                
                fichesToSave.add(nouvelleFiche);
            }
        }
        
        if (!fichesToSave.isEmpty()) {
            ficheTechRepo.saveAll(fichesToSave);
        }
    }

    return equipement;
}
}
