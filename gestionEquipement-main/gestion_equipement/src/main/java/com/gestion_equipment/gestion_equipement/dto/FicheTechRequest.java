package com.gestion_equipment.gestion_equipement.dto;

import java.time.LocalDateTime;
import java.util.List;

public class FicheTechRequest {
    private Long equipementId;
    private List<String> libelles;
    private LocalDateTime dateCreation ;
    
    public LocalDateTime getDateCreation() {return dateCreation;}
    public void setDateCreation(LocalDateTime dateCreation) {this.dateCreation = dateCreation;}
    public Long getEquipementId() {return equipementId;}
    public void setEquipementId(Long equipementId) {this.equipementId = equipementId;}
    public List<String> getLibelles() {return libelles;}
    public void setLibelles(List<String> libelles) {this.libelles = libelles;}

}
