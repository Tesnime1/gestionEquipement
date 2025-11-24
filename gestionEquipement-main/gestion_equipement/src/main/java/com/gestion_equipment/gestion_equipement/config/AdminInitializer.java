package com.gestion_equipment.gestion_equipement.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.gestion_equipment.gestion_equipement.model.Utilisateur;
import com.gestion_equipment.gestion_equipement.repository.Utilisateur_Repo;

@Component
public class AdminInitializer implements CommandLineRunner {
    
    private final Utilisateur_Repo utilisateur_Repo;
    private final PasswordEncoder passwordEncoder;
    
    public AdminInitializer(Utilisateur_Repo utilisateur_Repo, PasswordEncoder passwordEncoder) {
        this.utilisateur_Repo = utilisateur_Repo;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void run(String... args) {
        if (!utilisateur_Repo.existsByNom("Admin")) {
            Utilisateur utilisateur = new Utilisateur();
            utilisateur.setNom("Admin");
            utilisateur.setPassword(passwordEncoder.encode("admin"));
            utilisateur.setRole(Utilisateur.Role.ADMIN);
            utilisateur_Repo.save(utilisateur);
        }
    }
}