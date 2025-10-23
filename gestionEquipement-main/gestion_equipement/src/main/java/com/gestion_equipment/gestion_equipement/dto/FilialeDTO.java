package com.gestion_equipment.gestion_equipement.dto;


public class FilialeDTO {
    private Long idfiliale;
    private String nomFiliale;
 
      public FilialeDTO() {
    }

    public FilialeDTO(Long idfiliale, String nomFiliale ) {
        this.idfiliale = idfiliale;
        this.nomFiliale = nomFiliale;
     
    }
    public Long getIdfiliale() {return idfiliale;}
    public void setIdfiliale(Long idfiliale) {this.idfiliale = idfiliale;}
   
    public String getNomFiliale() {return nomFiliale;}
    public void setNomFiliale(String nomFiliale) {this.nomFiliale = nomFiliale;}
}
