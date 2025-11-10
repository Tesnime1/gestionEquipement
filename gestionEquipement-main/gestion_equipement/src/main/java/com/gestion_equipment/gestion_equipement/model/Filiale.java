package com.gestion_equipment.gestion_equipement.model;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "filiales")
public class Filiale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFiliale;

    @Column(nullable = false, unique = true)
    private String nomFiliale;
     @Column(nullable = false)
    private String adresseIp;
     @Column(nullable = false, unique = true)
    private String nomBdd;  
     @Column(nullable = false)
    private String userBdd;
    
    private String passwordBdd;
    private LocalDateTime dateCreation;
    
    // ⚡ Relation One-to-Many avec EquipementInstance
    @OneToMany(mappedBy = "filiale", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EquipementInstance> instances;

    // ⚡ Relation Many-to-One avec Utilisateur
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    private Utilisateur utilisateur;
    
    // Constructeur
    public Filiale() {}
    public Filiale(String nomFiliale) {
        this.nomFiliale = nomFiliale;
        this.dateCreation = LocalDateTime.now();
    }

    // Getters/Setters
    public Long getIdFiliale() { return idFiliale; }
    public void setIdFiliale(Long idFiliale) { this.idFiliale = idFiliale; }

    public String getNomFiliale() { return nomFiliale; }
    public void setNomFiliale(String nomFiliale) { this.nomFiliale = nomFiliale; }

    public String getAdresseIp() { return adresseIp; }
    public void setAdresseIp(String adresseIp) { this.adresseIp = adresseIp; }

    public String getNomBdd() { return nomBdd; }
    public void setNomBdd(String nomBdd) { this.nomBdd = nomBdd; }

    public String getUserBdd() { return userBdd; }
    public void setUserBdd(String userBdd) { this.userBdd = userBdd; }

    public String getPasswordBdd() { return passwordBdd; }
    public void setPasswordBdd(String passwordBdd) { this.passwordBdd = passwordBdd; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public List<EquipementInstance> getInstances() { return instances; }
    public void setInstances(List<EquipementInstance> instances) { this.instances = instances; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
}