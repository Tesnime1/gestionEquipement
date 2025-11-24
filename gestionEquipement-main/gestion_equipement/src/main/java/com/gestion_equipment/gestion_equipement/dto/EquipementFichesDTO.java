package com.gestion_equipment.gestion_equipement.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.gestion_equipment.gestion_equipement.model.FicheTechnique;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipementFichesDTO {
    private Long idEquipement;
    private String libelleEquipement;
    private List<FicheTechnique> fiches; 
    private Long idUtilisateur;
    private LocalDateTime date;

     public EquipementFichesDTO(Long idEquipement, String libelle, FicheTechnique fiche) {
        this.idEquipement = idEquipement;
        this.libelleEquipement = libelle;
        
        if (this.fiches == null) {
            this.fiches = new ArrayList<>();
        }
        
        if (fiche != null) {
            this.fiches.add(fiche);
        }
    } 
}
