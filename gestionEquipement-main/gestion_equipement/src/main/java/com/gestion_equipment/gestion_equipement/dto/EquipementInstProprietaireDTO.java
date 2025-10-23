package com.gestion_equipment.gestion_equipement.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipementInstProprietaireDTO {
   private String nomProprietaire;
   private String prenomProprietaire;
   private String ajouterPar;
   private LocalDateTime dateDajout;
   private  String equipement ;
   private Long idEquipementInst;
   private String matricule;
   private String nomFiliale;
}
