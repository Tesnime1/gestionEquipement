package com.gestion_equipment.gestion_equipement.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "historique_filiales")
public class HistoriqueFiliale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistoriqueFl;
    private String ancienNomFl;
    private String ancienneAdrFl; 
    private String ancienNomBddFl;
    private String ancienPswBddFl;
    private String ancienUserBddFl;
    private LocalDateTime ancienneDateCFl;
    private String ancienneFlAjouterPar;

    // ⚡ Relation Many-to-One avec Filiale
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filiale_id", nullable = false)
    @JsonIgnore
    private Filiale filiale;
    
    // ⚡ Relation Many-to-One avec Utilisateur
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    private Utilisateur utilisateur;

    // Constructeur
    public HistoriqueFiliale() {}

    // Getters/Setters
    public Long getIdHistoriqueFl() { return idHistoriqueFl; }
    public void setIdHistoriqueFl(Long idHistoriqueFl) { this.idHistoriqueFl = idHistoriqueFl; }

    public String getAncienNomFl() { return ancienNomFl; }
    public void setAncienNomFl(String ancienNomFl) { this.ancienNomFl = ancienNomFl; }

    public String getAncienneAdrFl() { return ancienneAdrFl; }
    public void setAncienneAdrFl(String ancienneAdrFl) { this.ancienneAdrFl = ancienneAdrFl; }

    public String getAncienNomBddFl() { return ancienNomBddFl; }
    public void setAncienNomBddFl(String ancienNomBddFl) { this.ancienNomBddFl = ancienNomBddFl; }

    public String getAncienPswBddFl() { return ancienPswBddFl; }
    public void setAncienPswBddFl(String ancienPswBddFl) { this.ancienPswBddFl = ancienPswBddFl; }

    public String getAncienUserBddFl() { return ancienUserBddFl; }
    public void setAncienUserBddFl(String ancienUserBddFl) { this.ancienUserBddFl = ancienUserBddFl; }

    public LocalDateTime getAncienneDateCFl() { return ancienneDateCFl; }
    public void setAncienneDateCFl(LocalDateTime ancienneDateCFl) { this.ancienneDateCFl = ancienneDateCFl; }

    public String getAncienneFlAjouterPar() { return ancienneFlAjouterPar; }
    public void setAncienneFlAjouterPar(String ancienneFlAjouterPar) { this.ancienneFlAjouterPar = ancienneFlAjouterPar; }

    public Filiale getFiliale() { return filiale; }
    public void setFiliale(Filiale filiale) { this.filiale = filiale; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
}