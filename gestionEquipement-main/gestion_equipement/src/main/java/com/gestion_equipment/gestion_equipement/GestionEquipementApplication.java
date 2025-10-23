package com.gestion_equipment.gestion_equipement;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gestion_equipment.gestion_equipement.model.Utilisateur;
import com.gestion_equipment.gestion_equipement.repository.Utilisateur_Repo;

@SpringBootApplication
public class GestionEquipementApplication implements CommandLineRunner {
private final Utilisateur_Repo utilisateur_Repo;
private final PasswordEncoder passwordEncoder;

  public GestionEquipementApplication (Utilisateur_Repo utilisateur_Repo ,PasswordEncoder passwordEncoder) {
        this.utilisateur_Repo = utilisateur_Repo;
           this.passwordEncoder = passwordEncoder;
    }
	public static void main(String[] args) {
		SpringApplication.run(GestionEquipementApplication.class, args);
	}
 @Override
    public void run(String... args) {
    if (!utilisateur_Repo.existsByNom("Admin")) {
           Utilisateur utilisateur = new Utilisateur();
  utilisateur.setNom("Admin");
  utilisateur.setPassword(passwordEncoder.encode("admin")); // encodage ici
  utilisateur.setRole(Utilisateur.Role.ADMIN);
  utilisateur_Repo.save(utilisateur);
        }

}
}