package com.gestion_equipment.gestion_equipement.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.gestion_equipment.gestion_equipement.dto.FilialeDetailDTO;
import com.gestion_equipment.gestion_equipement.model.Filiale;

public interface FilialeRepo extends JpaRepository<Filiale,Long> {
      @Query("""
        SELECT new com.gestion_equipment.gestion_equipement.dto.FilialeDetailDTO(
        f.idFiliale,
        f.nomFiliale,
       null,
        null,
        null,
        null,
        null  )
        FROM Filiale f
       
    """)
    List<FilialeDetailDTO> findFilialeDetail();
     @Query("""
    SELECT new com.gestion_equipment.gestion_equipement.dto.FilialeDetailDTO(
        f.idFiliale,
        f.nomFiliale,
        f.adresseIp,
        f.nomBdd,
        f.userBdd,
        f.passwordBdd,
        f.dateCreation
      
    )
    FROM Filiale f
""")
    List<FilialeDetailDTO> findAllFiliales();

}
