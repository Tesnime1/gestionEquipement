package com.gestion_equipment.gestion_equipement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gestion_equipment.gestion_equipement.dto.EquipementFichesDTO;
import com.gestion_equipment.gestion_equipement.model.Equipement;

public interface EquipementRepo extends JpaRepository<Equipement,Long>  {
     @Query("SELECT new com.gestion_equipment.gestion_equipement.dto.EquipementFichesDTO(" +
           "e.idEquipement, " +
           "e.libelle, " +
           "ft) " +
           "FROM Equipement e " +
           "LEFT JOIN e.ficheTechniques ft " +
           "ORDER BY e.idEquipement")
    List<EquipementFichesDTO> findAllWithFiches();
   
}
