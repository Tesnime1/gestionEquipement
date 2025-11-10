
package com.gestion_equipment.gestion_equipement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "fiche_tech_valeurs")
public class FicheTech_valeur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long idFtvaleur;
     @Column(nullable = false)
    private String valeur;
    
    // ⚡ Relation Many-to-One avec FicheTechnique
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fiche_tech_id", nullable = false)
    @JsonIgnore  // ✅ Évite les boucles
    private FicheTechnique ficheTechnique;

    //  Relation Many-to-One avec EquipementInstance
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_instance_id", nullable = false)
    @JsonBackReference  // ✅ Utilisé avec @JsonManagedReference
    private EquipementInstance equipementInstance;

    // Constructeur
    public FicheTech_valeur() {}
    public FicheTech_valeur(String valeur) {
        this.valeur = valeur;
    }

    // Getters/Setters
    public Long getIdFtvaleur() { return idFtvaleur; }
    public void setIdFtvaleur(Long idFtvaleur) { this.idFtvaleur = idFtvaleur; }

    public String getValeur() { return valeur; }
    public void setValeur(String valeur) { this.valeur = valeur; }

    public FicheTechnique getFicheTechnique() { return ficheTechnique; }
    public void setFicheTechnique(FicheTechnique ficheTechnique) { this.ficheTechnique = ficheTechnique; }

    public EquipementInstance getEquipementInstance() { return equipementInstance; }
    public void setEquipementInstance(EquipementInstance equipementInstance) { this.equipementInstance = equipementInstance; }
}