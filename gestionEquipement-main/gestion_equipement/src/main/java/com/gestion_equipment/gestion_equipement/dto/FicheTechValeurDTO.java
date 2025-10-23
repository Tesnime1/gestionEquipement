package com.gestion_equipment.gestion_equipement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FicheTechValeurDTO{
    private Long idValeur;  
    private String valeur;
private String libelleFiche;  // ex: "marque"  
private Long ficheTechId;


 public FicheTechValeurDTO(Long idValeur, String valeur, String libelleFiche) {
        this.idValeur = idValeur;
        this.valeur = valeur;
        this.libelleFiche = libelleFiche;
    }
 // Ajoutez toString() pour debug
    // @Override
    // public String toString() {
    //     return "FicheTechValeurDTO{ficheTechId=" + ficheTechId + ", valeur='" + valeur + "'}";
    // }
}

