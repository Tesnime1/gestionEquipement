package com.gestion_equipment.gestion_equipement.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProprietaireEquipementDTO {
    private Long idEquipementInst;
    private String nomProprietaire;
    private String prenomProprietaire;
    private String matricule;
    private String direction;
    private String departement;
    private String fonction;
    private String unite;
    private String equipement;
    private String ajouterPar;
    private LocalDateTime dateDajout;
    private List<FicheTechValeurDTO> valeurs;
public ProprietaireEquipementDTO(
    Long idEquipementInst,
    String nomProprietaire,
    String prenomProprietaire,
    String matricule,
    String direction,
    String departement,
    String fonction,
    String unite,
    String equipement,
    String ajouterPar,
    LocalDateTime dateDajout
) {
    this.idEquipementInst = idEquipementInst;
    this.nomProprietaire = nomProprietaire;
    this.prenomProprietaire = prenomProprietaire;
    this.matricule = matricule;
    this.direction = direction;
    this.departement = departement;
    this.fonction = fonction;
    this.unite = unite;
    this.equipement = equipement;
    this.ajouterPar = ajouterPar;  // correspond à u.nom
    this.dateDajout = dateDajout;
}

 
}


