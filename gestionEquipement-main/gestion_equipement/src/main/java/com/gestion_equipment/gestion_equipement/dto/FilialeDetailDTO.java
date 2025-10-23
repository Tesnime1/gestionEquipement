package com.gestion_equipment.gestion_equipement.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilialeDetailDTO {
      private Long idFiliale;
    private String nomFiliale;
    private String adresseIp;
    private String nomBdd;
    private String userBdd;
    private String passwordBdd;
    private LocalDateTime dateCreation;
    // private UtilisateurDTO utilisateur;  // DTO allégé de l'utilisateur


}
