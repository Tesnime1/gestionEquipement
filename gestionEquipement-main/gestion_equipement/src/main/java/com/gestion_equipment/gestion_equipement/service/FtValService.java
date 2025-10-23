package com.gestion_equipment.gestion_equipement.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.gestion_equipment.gestion_equipement.dto.FicheTechValeurDTO;
import com.gestion_equipment.gestion_equipement.dto.ProprietaireEquipementDTO;
import com.gestion_equipment.gestion_equipement.model.EquipementInstance;
import com.gestion_equipment.gestion_equipement.model.FicheTech_valeur;
import com.gestion_equipment.gestion_equipement.repository.FicheTechValeur_Repo;


@Service
public class FtValService {
 
    private final FicheTechValeur_Repo ficheValRepo;
    public FtValService(FicheTechValeur_Repo ficheValRepo) {
        this.ficheValRepo = ficheValRepo;
       
    }
public List<FicheTechValeurDTO> getFichesAvecValeurByEquipement(Long idEquipement) {
    return ficheValRepo.findValeursAvecLibelleByEquipement(idEquipement);
}

  

  public List<ProprietaireEquipementDTO> getProprietairesParValeur(Map<String, String> filters) {
    List<FicheTech_valeur> all = ficheValRepo.findAll();

    // Regrouper par instance
    Map<Long, ProprietaireEquipementDTO> map = new HashMap<>();

    for (FicheTech_valeur v : all) {
        EquipementInstance instance = v.getEquipementInstance();
        Long instId = instance.getIdEquipementInstance();

        // Vérifier si l'instance est déjà ajoutée
        ProprietaireEquipementDTO dto = map.get(instId);
        if (dto == null) {
            dto = new ProprietaireEquipementDTO();
            dto.setIdEquipementInst(instId);
            dto.setNomProprietaire(instance.getNom());
            dto.setEquipement(instance.getEquipement().getLibelle());
            dto.setAjouterPar(instance.getUtilisateur().getNom());
            dto.setDateDajout(instance.getDateCreation());
            dto.setValeurs(new ArrayList<>()); // ⚡ liste vide pour remplir ensuite
            map.put(instId, dto);
        }

        // Ajouter la valeur à la liste
        FicheTechValeurDTO dtoV = new FicheTechValeurDTO();
        dtoV.setLibelleFiche(v.getFicheTechnique().getLibelle());
        dtoV.setValeur(v.getValeur());
        dto.getValeurs().add(dtoV);
    }

    return new ArrayList<>(map.values());
}

public List<FicheTechValeurDTO> getFichesByEquipementInstance(Long idEquipementInstance) {
        List<FicheTech_valeur> valeurs = ficheValRepo.findByEquipementInstance_Id(idEquipementInstance);
        
        return valeurs.stream()
            .map(v -> {
                FicheTechValeurDTO dto = new FicheTechValeurDTO();
                dto.setIdValeur(v.getIdFtvaleur());
                dto.setValeur(v.getValeur() != null ? v.getValeur() : "");
                
                // Gérer le cas où ficheTechnique peut être null
                if (v.getFicheTechnique() != null) {
                    dto.setLibelleFiche(v.getFicheTechnique().getLibelle());
                    dto.setFicheTechId(v.getFicheTechnique().getIdFicheTechnique()); // Adaptez selon votre entité
                } else {
                    dto.setLibelleFiche("Non défini");
                    dto.setFicheTechId(null);
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }

}


