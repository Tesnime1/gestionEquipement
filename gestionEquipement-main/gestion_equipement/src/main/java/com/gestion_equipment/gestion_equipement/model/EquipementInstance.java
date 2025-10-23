//  EQUIPEMENT INSTANCE - Instance physique d'un équipement
package com.gestion_equipment.gestion_equipement.model;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
@Table(name = "equipement_instances")
public class EquipementInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEquipementInstance;

    @Column(nullable = false)
    private String nom;

    private LocalDateTime dateCreation;
    private String matricule;
    private String prenom;
    private String direction;
    private String departement;
    private String fonction;
    private String unite;

    // ⚡ Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_id", nullable = false)
    @JsonIgnore  // ✅ Le type d'équipement n'est pas sérialisé
    private Equipement equipement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @OneToMany(mappedBy = "equipementInstance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<FicheTech_valeur> valeurs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filiale_id")
    private Filiale filiale;

    // Constructeur
    public EquipementInstance() {}

    // Getters/Setters
    public Long getIdEquipementInstance() { return idEquipementInstance; }
    public void setIdEquipementInstance(Long idEquipementInstance) { this.idEquipementInstance = idEquipementInstance; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }

    public String getDepartement() { return departement; }
    public void setDepartement(String departement) { this.departement = departement; }

    public String getFonction() { return fonction; }
    public void setFonction(String fonction) { this.fonction = fonction; }

    public String getUnite() { return unite; }
    public void setUnite(String unite) { this.unite = unite; }

    public Equipement getEquipement() { return equipement; }
    public void setEquipement(Equipement equipement) { this.equipement = equipement; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }

    public List<FicheTech_valeur> getValeurs() { return valeurs; }
    public void setValeurs(List<FicheTech_valeur> valeurs) { this.valeurs = valeurs; }

    public Filiale getFiliale() { return filiale; }
    public void setFiliale(Filiale filiale) { this.filiale = filiale; }
}