package com.gestion_equipment.gestion_equipement.service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.gestion_equipment.gestion_equipement.dto.FilialeDTO;
import com.gestion_equipment.gestion_equipement.dto.FilialeDetailDTO;
import com.gestion_equipment.gestion_equipement.model.Filiale;
import com.gestion_equipment.gestion_equipement.model.HistoriqueFiliale;
import com.gestion_equipment.gestion_equipement.model.Utilisateur;
import com.gestion_equipment.gestion_equipement.repository.FilialeRepo;
import com.gestion_equipment.gestion_equipement.repository.HistoriqueFilialeRepo;
import com.gestion_equipment.gestion_equipement.repository.Utilisateur_Repo;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class FilialeService {
    private final FilialeRepo filialeRepo;
    private final Utilisateur_Repo utilisateurRepo;
    private final HistoriqueFilialeRepo historiqueFilialeRepo;
  
public FilialeService(FilialeRepo filialeRepo ,Utilisateur_Repo utilisateurRepo,HistoriqueFilialeRepo historiqueFilialeRepo){
      this.filialeRepo=filialeRepo;
      this.utilisateurRepo=utilisateurRepo;
      this.historiqueFilialeRepo=historiqueFilialeRepo;
    }
    
public Filiale creatFiliale(Filiale filiale ){
         filiale.setDateCreation(LocalDateTime.now());
        // 👤 Récupérer l'utilisateur connecté
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        //  Chercher l'utilisateur en base
        Utilisateur user = utilisateurRepo.findByNom(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + username));
        filiale.setUtilisateur(user);
     return filialeRepo.save(filiale);
    }
// Récupérer l'utilisateur connecté depuis Spring Security
private Utilisateur getUtilisateurConnecte() {
        String currentUsername = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return utilisateurRepo.findByNom(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé"));
    }

public List<FilialeDetailDTO> getAllFiliales() {
        return filialeRepo.findAllFiliales();
    }
public List<FilialeDTO> getAllFilialesIdAndNom() {
        List<Object[]> results = filialeRepo.findIdAndNomFiliale();
        
        return results.stream().map(row -> new FilialeDTO(
                (Long) row[0],      // idFiliale
                (String) row[1]     // nomFiliale
           
            ))
            .collect(Collectors.toList());
    }
   
public Filiale updateFiliale(Long id, Filiale newData) {
    // 1️ Récupérer la filiale existante
    Filiale filiale = filialeRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Filiale introuvable"));
            Utilisateur utilisateurConnecte = getUtilisateurConnecte();
    // 2️ Sauvegarder l'ancien état dans l'historique
    HistoriqueFiliale historiqueFl = new HistoriqueFiliale();
    historiqueFl.setUtilisateur(utilisateurConnecte); 
    historiqueFl.setFiliale(filiale);
    historiqueFl.setAncienNomFl(filiale.getNomFiliale());
    historiqueFl.setAncienneAdrFl(filiale.getAdresseIp());
    historiqueFl.setAncienNomBddFl(filiale.getNomBdd());
    historiqueFl.setAncienUserBddFl(filiale.getUserBdd());
    historiqueFl.setAncienPswBddFl(filiale.getPasswordBdd());
    historiqueFl.setAncienneDateCFl(filiale.getDateCreation());
    historiqueFl.setAncienneFlAjouterPar(filiale.getUtilisateur().getNom());


    
    // Sauvegarder l'historique
    historiqueFilialeRepo.save(historiqueFl);
    
    // 3️ Mettre à jour la filiale EXISTANTE
    filiale.setNomFiliale(newData.getNomFiliale());
    filiale.setAdresseIp(newData.getAdresseIp());
    filiale.setNomBdd(newData.getNomBdd());
    filiale.setUserBdd(newData.getUserBdd());
    filiale.setPasswordBdd(newData.getPasswordBdd());
    
    // 4️ Sauvegarder les modifications
    return filialeRepo.save(filiale);
}
}