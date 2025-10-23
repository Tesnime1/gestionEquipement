package com.gestion_equipment.gestion_equipement.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "historique_equipements")
public class HistoriqueEquipement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistoriqueEquipement;   
    
    private LocalDateTime dateModification;
    private LocalDateTime ancienneDate; 
    private String ancienNomProprietaire;
     private String ancienPrenomProprietaire;
    private String ancienneMatricule;
    private String ancienNomFiliale;
    private String nouveauProprietaire;
    private String modifiePar;
    private String ancienProprietaireAjoutePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_instance_id", nullable = false)
    @JsonIgnore
    private EquipementInstance equipementInstance;
    
  
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    private Utilisateur utilisateur;

    // Constructeur
    public HistoriqueEquipement() {}

    // Getters/Setters
    public Long getIdHistoriqueEquipement() { return idHistoriqueEquipement; }
    public void setIdHistoriqueEquipement(Long idHistoriqueEquipement) { this.idHistoriqueEquipement = idHistoriqueEquipement; }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }

    public LocalDateTime getAncienneDate() { return ancienneDate; }
    public void setAncienneDate(LocalDateTime ancienneDate) { this.ancienneDate = ancienneDate; }
    
    public String getAncienNomProprietaire() { return ancienNomProprietaire;}
    public void setAncienNomProprietaire(String ancienNomProprietaire) {this.ancienNomProprietaire = ancienNomProprietaire;}
    
    public String getAncienPrenomProprietaire() {   return ancienPrenomProprietaire; }
    public void setAncienPrenomProprietaire(String ancienPrenomProprietaire) {this.ancienPrenomProprietaire = ancienPrenomProprietaire;}
 
    public String getAncienneMatricule() { return ancienneMatricule;}
    public void setAncienneMatricule(String ancienneMatricule) { this.ancienneMatricule = ancienneMatricule;}
  
    public String getAncienNomFiliale() { return ancienNomFiliale; }
    public void setAncienNomFiliale(String ancienNomFiliale) {this.ancienNomFiliale = ancienNomFiliale; }
 
    public String getNouveauProprietaire() { return nouveauProprietaire; }
    public void setNouveauProprietaire(String nouveauProprietaire) { this.nouveauProprietaire = nouveauProprietaire; }

    public String getModifiePar() { return modifiePar; }
    public void setModifiePar(String modifiePar) { this.modifiePar = modifiePar; }

    public String getAncienProprietaireAjoutePar() { return ancienProprietaireAjoutePar; }
    public void setAncienProprietaireAjoutePar(String ancienProprietaireAjoutePar) { this.ancienProprietaireAjoutePar = ancienProprietaireAjoutePar; }

    public EquipementInstance getEquipementInstance() { return equipementInstance; }
    public void setEquipementInstance(EquipementInstance equipementInstance) { this.equipementInstance = equipementInstance; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
    
 
}
