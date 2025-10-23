
package com.gestion_equipment.gestion_equipement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "fiches_techniques")
public class FicheTechnique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFicheTechnique;
    
    @Column(unique = true, nullable = false)
    private String libelle;
    private LocalDateTime dateCreation;
    
    // ⚡ Relation Many-to-One avec Equipement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_id", nullable = false)
    @JsonIgnore  // ✅ Évite la boucle circulaire
    private Equipement equipement;

    // ⚡ Relation One-to-Many avec FicheTech_valeur
    @OneToMany(mappedBy = "ficheTechnique", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore 
    private List<FicheTech_valeur> valeurs;

    // ⚡ Relation Many-to-One avec Utilisateur (qui a créé cette fiche)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    @JsonIgnore  // ✅ Évite la sérialisation de l'utilisateur
    private Utilisateur utilisateur;
    
    // Constructeurs
    public FicheTechnique() {}
    public FicheTechnique(String libelle) {
        this.libelle = libelle;
        this.dateCreation = LocalDateTime.now();
    }

    // Getters/Setters
    public Long getIdFicheTechnique() { return idFicheTechnique; }
    public void setIdFicheTechnique(Long idFicheTechnique) { this.idFicheTechnique = idFicheTechnique; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public Equipement getEquipement() { return equipement; }
    public void setEquipement(Equipement equipement) { this.equipement = equipement; }

    public List<FicheTech_valeur> getValeurs() { return valeurs; }
    public void setValeurs(List<FicheTech_valeur> valeurs) { this.valeurs = valeurs; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
}