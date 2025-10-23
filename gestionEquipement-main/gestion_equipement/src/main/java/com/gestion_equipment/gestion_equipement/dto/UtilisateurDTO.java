package com.gestion_equipment.gestion_equipement.dto;

import com.gestion_equipment.gestion_equipement.model.Utilisateur.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UtilisateurDTO {
    private Long id;
    private String nom;
     private String role;
     
   // ⚡ Constructeur pour la projection JPQL
    public UtilisateurDTO(Long id, String nom, Role role) {
        this.id = id;
        this.nom = nom;
        this.role = role.toString();
    }
}
