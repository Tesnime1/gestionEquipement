package com.gestion_equipment.gestion_equipement.service;

import com.gestion_equipment.gestion_equipement.dto.EquipementFichesDTO;
import com.gestion_equipment.gestion_equipement.model.Equipement;
import com.gestion_equipment.gestion_equipement.model.Utilisateur;
import com.gestion_equipment.gestion_equipement.repository.EquipementRepo;
import com.gestion_equipment.gestion_equipement.repository.Utilisateur_Repo;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class EquipementService {
private final EquipementRepo equipementrepo;
private final Utilisateur_Repo utilisateurRepo;

    public EquipementService(EquipementRepo equipementrepo, Utilisateur_Repo utilisateurRepo){
        this.equipementrepo=equipementrepo;
        this.utilisateurRepo=utilisateurRepo;
    }
    public Equipement creatEquipement(Equipement equipement ) {
          equipement.setDateCreation(LocalDateTime.now());
        // 👤 Récupérer l'utilisateur connecté
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        //  Chercher l'utilisateur en base
        Utilisateur user = utilisateurRepo.findByNom(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + username));
         equipement.setUtilisateur(user);
        return equipementrepo.save(equipement);
    }
    public List<Equipement> getAllEquipements( ) {
        return equipementrepo.findAll();
    }
    public List<EquipementFichesDTO> getAllEquipementsWithFiches() {
        // La requête retourne déjà les DTOs groupés ! 
        List<EquipementFichesDTO> result = equipementrepo.findAllWithFiches();
        
        // Grouper par idEquipement pour éviter les doublons
        return result.stream()
                .collect(Collectors.toMap(
                    EquipementFichesDTO::getIdEquipement,
                    dto -> dto,
                    (dto1, dto2) -> {
                        dto1.getFiches().addAll(dto2.getFiches());
                        return dto1;
                    }
                ))
                .values()
                .stream()
                .toList();
    }
    public Equipement updateEquipement(Long id, String newEquipement) {
        Equipement equipement = equipementrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("equipement introuvable avec id " + id));

        equipement.setLibelle(newEquipement);
        return equipementrepo.save(equipement);
    }
}
