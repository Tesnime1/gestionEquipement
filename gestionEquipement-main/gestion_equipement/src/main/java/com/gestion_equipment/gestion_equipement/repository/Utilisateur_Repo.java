package com.gestion_equipment.gestion_equipement.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gestion_equipment.gestion_equipement.dto.UtilisateurDTO;
import com.gestion_equipment.gestion_equipement.model.Utilisateur;

public interface Utilisateur_Repo extends JpaRepository<Utilisateur,Long> {
      Optional<Utilisateur> findByNom(String nom);
      boolean existsByNom(String nom);

   @Query("SELECT new com.gestion_equipment.gestion_equipement.dto.UtilisateurDTO(u.id, u.nom, u.role) FROM Utilisateur u")
   List<UtilisateurDTO> findAllUtilisateurs();   

}
