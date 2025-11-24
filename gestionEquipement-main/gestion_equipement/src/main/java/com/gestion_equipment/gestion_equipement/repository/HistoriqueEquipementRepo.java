package com.gestion_equipment.gestion_equipement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gestion_equipment.gestion_equipement.model.HistoriqueEquipement;

public interface HistoriqueEquipementRepo  extends JpaRepository<HistoriqueEquipement,Long>{  
    List<HistoriqueEquipement> findByEquipementInstance_IdEquipementInstanceOrderByDateModificationDesc(Long idEquipementInstance);
}

