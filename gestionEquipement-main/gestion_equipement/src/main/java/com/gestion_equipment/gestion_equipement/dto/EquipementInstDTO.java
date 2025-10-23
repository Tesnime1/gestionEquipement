package com.gestion_equipment.gestion_equipement.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipementInstDTO {
    private String nom;
    private Long equipementId;
    private Long filialeId;
    private List<FicheTechValeurDTO> valeurs;
    private String matricule ;
    private String prenom;
    private String direction;
    private String departement;
    private String fonction;
    private String unite;
}
