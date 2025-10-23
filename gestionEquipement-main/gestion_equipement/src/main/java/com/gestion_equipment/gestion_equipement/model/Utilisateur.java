package com.gestion_equipment.gestion_equipement.model;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nom;
    private String password;
    
    private LocalDateTime dateCreation;

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role {
        ADMIN, UTILISATEUR
    }

    // ⚡ Relations
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Equipement> equipements;

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EquipementInstance> instances;

    // Constructeurs
    public Utilisateur() {}
    public Utilisateur(String nom, String password, Role role) {
        this.nom = nom;
        this.password = password;
        this.role = role;
        this.dateCreation = LocalDateTime.now();
    }

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public List<Equipement> getEquipements() { return equipements; }
    public void setEquipements(List<Equipement> equipements) { this.equipements = equipements; }

    public List<EquipementInstance> getInstances() { return instances; }
    public void setInstances(List<EquipementInstance> instances) { this.instances = instances; }
}