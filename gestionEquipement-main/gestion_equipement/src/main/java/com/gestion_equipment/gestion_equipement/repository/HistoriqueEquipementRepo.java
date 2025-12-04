package com.gestion_equipment.gestion_equipement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gestion_equipment.gestion_equipement.dto.HistoriqueCompletDTO;
import com.gestion_equipment.gestion_equipement.model.HistoriqueEquipement;

public interface HistoriqueEquipementRepo  extends JpaRepository<HistoriqueEquipement,Long>{  
    List<HistoriqueEquipement> findByEquipementInstance_IdEquipementInstanceOrderByDateModificationDesc(Long idEquipementInstance);
       @Query("""
        SELECT new com.gestion_equipment.gestion_equipement.dto.HistoriqueCompletDTO(
            CONCAT(h.ancienNomProprietaire, ' ', h.ancienPrenomProprietaire),
            h.nouveauProprietaire,
            h.modifiePar,
            h.dateModification,
            h.ancienneDate,
            ei.idEquipementInstance,
            e.libelle,
            h.idHistoriqueEquipement,
            u.nom,
            ei.dateCreation,
            h.motif
        )
        FROM HistoriqueEquipement h
        LEFT JOIN h.equipementInstance ei
        LEFT JOIN ei.equipement e
        LEFT JOIN h.utilisateur u
    """)
    List<HistoriqueCompletDTO> getAllHistoriqueDTO();
}


