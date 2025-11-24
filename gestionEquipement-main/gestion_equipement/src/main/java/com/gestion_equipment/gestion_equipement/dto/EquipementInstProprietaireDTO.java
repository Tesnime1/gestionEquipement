package com.gestion_equipment.gestion_equipement.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipementInstProprietaireDTO {
   private String proprietaire;
   private String ajouterPar;
   private LocalDateTime dateDajout;
   private  String equipement ;
   private Long idEquipementInst;
   private String matricule;
   private String nomFiliale;
   private List<FicheTechValeurDTO> valeurs;
   private boolean scanner;
   private String fonction;
   private String departement;
   private String direction;
 
     public EquipementInstProprietaireDTO(
        String proprietaire,
     
        String ajouterPar,
        LocalDateTime dateDajout,
        String equipement,
        Long idEquipementInst,
        String matricule,
        String nomFiliale,
        boolean scanner,
        String direction,
        String departement,
        String fonction
) {

    this.proprietaire = proprietaire;
    this.ajouterPar = ajouterPar;
    this.dateDajout = dateDajout;
    this.equipement = equipement;
    this.idEquipementInst = idEquipementInst;
    this.matricule = matricule;
    this.nomFiliale = nomFiliale;
    this.scanner = scanner;
    this.direction = direction;
    this.departement = departement;
    this.fonction = fonction; 
    
}


}
