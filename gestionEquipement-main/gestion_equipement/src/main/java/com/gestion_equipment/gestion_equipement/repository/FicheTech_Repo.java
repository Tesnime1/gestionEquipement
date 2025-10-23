package com.gestion_equipment.gestion_equipement.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gestion_equipment.gestion_equipement.model.FicheTechnique;

public interface FicheTech_Repo extends JpaRepository<FicheTechnique,Long> {
    List<FicheTechnique> findByEquipement_IdEquipement(Long idEquipement);


}
