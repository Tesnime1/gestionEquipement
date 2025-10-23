
package com.gestion_equipment.gestion_equipement.model;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "equipements")
public class Equipement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEquipement;

    @Column(unique = true, nullable = false)
    private String libelle;

    private LocalDateTime dateCreation;

    // ⚡ Relations
    @OneToMany(mappedBy = "equipement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<FicheTechnique> ficheTechniques;

    @OneToMany(mappedBy = "equipement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EquipementInstance> instances;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    private Utilisateur utilisateur;

    // Constructeurs
    public Equipement() {}
    public Equipement(String libelle) {
        this.libelle = libelle;
        this.dateCreation = LocalDateTime.now();
    }

    // Getters/Setters
    public Long getIdEquipement() { return idEquipement; }
    public void setIdEquipement(Long idEquipement) { this.idEquipement = idEquipement; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public List<FicheTechnique> getFicheTechniques() { return ficheTechniques; }
    public void setFicheTechniques(List<FicheTechnique> ficheTechniques) { this.ficheTechniques = ficheTechniques; }

    public List<EquipementInstance> getInstances() { return instances; }
    public void setInstances(List<EquipementInstance> instances) { this.instances = instances; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
}