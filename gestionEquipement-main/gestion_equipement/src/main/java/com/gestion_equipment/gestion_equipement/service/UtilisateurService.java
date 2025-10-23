package com.gestion_equipment.gestion_equipement.service;

import java.util.List;
import java.util.Optional;
import com.gestion_equipment.gestion_equipement.dto.UtilisateurDTO;
import com.gestion_equipment.gestion_equipement.model.Utilisateur;
import com.gestion_equipment.gestion_equipement.repository.Utilisateur_Repo;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class UtilisateurService {
    private Utilisateur_Repo utilisateur_Repo;
    private PasswordEncoder passwordEncoder;
      public UtilisateurService( Utilisateur_Repo utilisateur_Repo,PasswordEncoder passwordEncoder){
        this.utilisateur_Repo=utilisateur_Repo;
        this.passwordEncoder=passwordEncoder;
      }
    
    public Utilisateur creatUtilisateur(Utilisateur utilisateur ) {
      String hashedPassword = passwordEncoder.encode(utilisateur.getPassword());
        utilisateur.setPassword(hashedPassword);
        return utilisateur_Repo.save(utilisateur);
    }
     public boolean updatePassword(Long userId, String newPassword) {
        Optional<Utilisateur> optionalUser = utilisateur_Repo.findById(userId);

        if (optionalUser.isPresent()) {
            Utilisateur user = optionalUser.get();
            String hashedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(hashedPassword);
            utilisateur_Repo.save(user);
            return true;
        }
        return false;
    }

 // Service (simplifié !)
public List<UtilisateurDTO> getAllUtilisateurs() {
    return utilisateur_Repo.findAllUtilisateurs(); // ✅ Pas besoin de .map()
}

}
