package com.gestion_equipment.gestion_equipement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeDTO {
    private String matricule;
    private String nom;
    private String prenom;
    private String direction;
    private String departement;
    private String fonction;
    private String unite;
}
