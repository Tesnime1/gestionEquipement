package com.gestion_equipment.gestion_equipement.dto;

import java.time.LocalDateTime;


public class HistoriqueCompletDTO {
    private String ancienProprietaire;
    private String nouveauProprietaire;
    private String modifiePar;
    private LocalDateTime dateModification;
    private LocalDateTime ancienneDate;
    private Long idEquipementInst;
    private String equipement;
    private String ajouterPar;
    private LocalDateTime dateDajout;
  

    // Constructeur pour JPQL (sans valeurs)
    public HistoriqueCompletDTO(String ancienProprietaire, String nouveauProprietaire,
                                String modifiePar, LocalDateTime dateModification,
                                LocalDateTime ancienneDate, Long idEquipementInst,
                                String equipement, String ajouterPar, LocalDateTime dateDajout) {
        this.ancienProprietaire = ancienProprietaire;
        this.nouveauProprietaire = nouveauProprietaire;
        this.modifiePar = modifiePar;
        this.dateModification = dateModification;
        this.ancienneDate = ancienneDate;
        this.idEquipementInst = idEquipementInst;
        this.equipement = equipement;
        this.ajouterPar = ajouterPar;
        this.dateDajout = dateDajout;
    }

    // Getters et Setters
    public String getAncienProprietaire() { return ancienProprietaire; }
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


}
