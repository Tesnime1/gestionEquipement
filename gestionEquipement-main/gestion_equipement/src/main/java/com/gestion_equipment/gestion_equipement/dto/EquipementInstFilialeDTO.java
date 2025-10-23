package com.gestion_equipment.gestion_equipement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipementInstFilialeDTO {
    private Long idFiliale;
    private String direction;
    private String departement;
    private String unite;
    private String fonction;
    
}
