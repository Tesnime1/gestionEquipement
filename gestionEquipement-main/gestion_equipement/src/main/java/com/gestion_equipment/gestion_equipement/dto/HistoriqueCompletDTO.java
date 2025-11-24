package com.gestion_equipment.gestion_equipement.dto;

import java.time.LocalDateTime;
import java.util.List;



public class HistoriqueCompletDTO {
    private String ancienProprietaire;
   
    private String ancienneMatricule;
    private String nouveauProprietaire;
    private String modifiePar;
    private LocalDateTime dateModification;
    private LocalDateTime ancienneDate;
    private Long idEquipementInst;
    private String equipement;
    private String ajouterPar;
    private LocalDateTime dateDajout;
    private Long idHistoriqueEquipement;
    private List<FicheTechValeurDTO> valeurs;
  

    public HistoriqueCompletDTO(String ancienProprietaire,
                           
                            String ancienneMatricule,
                            String nouveauProprietaire,
                            String modifiePar,
                            LocalDateTime dateModification,
                            LocalDateTime ancienneDate,
                            Long idEquipementInst,
                            String equipement,
                            String ajouterPar,
                            LocalDateTime dateDajout,
                            Long idHistoriqueEquipement,
                            List<FicheTechValeurDTO> valeurs) {
                                
;
    this.ancienProprietaire = ancienProprietaire;
    this.ancienneMatricule= ancienneMatricule;
    this.nouveauProprietaire = nouveauProprietaire;
    this.modifiePar = modifiePar;
    this.dateModification = dateModification;
    this.ancienneDate = ancienneDate;
    this.idEquipementInst = idEquipementInst;
    this.equipement = equipement;
    this.ajouterPar = ajouterPar;
    this.dateDajout = dateDajout;
    this.idHistoriqueEquipement = idHistoriqueEquipement;
    this.valeurs = valeurs;
}


    
    public HistoriqueCompletDTO(String ancienProprietaire2,
            String nouveauProprietaire2, String modifiePar2, LocalDateTime dateModification2,
            LocalDateTime ancienneDate2, Long idEquipementInst2, String ajouterPar2, Long idHistoriqueEquipement2, String equipement2,
            LocalDateTime dateDajout2) {
                this.ancienProprietaire=ancienProprietaire2;
        this.nouveauProprietaire = nouveauProprietaire2;
        this.modifiePar = modifiePar2;
        this.dateModification = dateModification2;
        this.ancienneDate = ancienneDate2;
        this.idEquipementInst = idEquipementInst2;
        this.equipement = equipement2;
        this.ajouterPar = ajouterPar2;
        this.dateDajout = dateDajout2;
        this.idHistoriqueEquipement=idHistoriqueEquipement2;
      


        
    }

     public String getAncienneMatricule() {
        return ancienneMatricule;
    }
    public void setAncienneMatricule(String ancienneMatricule) {
        this.ancienneMatricule = ancienneMatricule;
    }
    public List<FicheTechValeurDTO> getValeurs() {
        return valeurs;
    }
    public void setValeurs(List<FicheTechValeurDTO> valeurs) {
        this.valeurs = valeurs;
    }
 public String getAncienProprietaire() {
        return ancienProprietaire;
    }
    public void setAncienProprietaire(String ancienProprietaire) {
        this.ancienProprietaire = ancienProprietaire;
    }
    public String getNouveauProprietaire() { return nouveauProprietaire; }
    public void setNouveauProprietaire(String nouveauProprietaire) { 
        this.nouveauProprietaire = nouveauProprietaire; 
    }

    public String getModifiePar() { return modifiePar; }
    public void setModifiePar(String modifiePar) { 
        this.modifiePar = modifiePar; 
    }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { 
        this.dateModification = dateModification; 
    }

    public LocalDateTime getAncienneDate() { return ancienneDate; }
    public void setAncienneDate(LocalDateTime ancienneDate) { 
        this.ancienneDate = ancienneDate; 
    }

    public Long getIdEquipementInst() { return idEquipementInst; }
    public void setIdEquipementInst(Long idEquipementInst) { 
        this.idEquipementInst = idEquipementInst; 
    }

    public String getEquipement() { return equipement; }
    public void setEquipement(String equipement) { 
        this.equipement = equipement; 
    }

    public String getAjouterPar() { return ajouterPar; }
    public void setAjouterPar(String ajouterPar) { 
        this.ajouterPar = ajouterPar; 
    }

    public LocalDateTime getDateDajout() { return dateDajout; }
    public void setDateDajout(LocalDateTime dateDajout) { 
        this.dateDajout = dateDajout; 
    }

    public Long getIdHistoriqueEquipement() {
        return idHistoriqueEquipement;
    }
    public void setIdHistoriqueEquipement(Long idHistoriqueEquipement) {
        this.idHistoriqueEquipement = idHistoriqueEquipement;
    }

}
