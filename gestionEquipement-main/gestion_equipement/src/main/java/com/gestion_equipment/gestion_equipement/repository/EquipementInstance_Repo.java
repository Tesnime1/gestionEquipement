package com.gestion_equipment.gestion_equipement.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gestion_equipment.gestion_equipement.dto.EquipementInstFilialeDTO;
import com.gestion_equipment.gestion_equipement.dto.EquipementInstProprietaireDTO;
import com.gestion_equipment.gestion_equipement.dto.ProprietaireEquipementDTO;
import com.gestion_equipment.gestion_equipement.model.EquipementInstance;

public interface EquipementInstance_Repo extends JpaRepository<EquipementInstance,Long> {
        Optional<EquipementInstance> findByNom(String Nom);
        List<EquipementInstance> findByEquipement_IdEquipement(Long equipementId);

@Query("SELECT new com.gestion_equipment.gestion_equipement.dto.EquipementInstFilialeDTO(" +
       "i.filiale.idFiliale, i.direction, i.departement, i.fonction) " +
       "FROM EquipementInstance i " +
       "WHERE i.filiale.idFiliale = :filialeId")
List<EquipementInstFilialeDTO> findDetailsInstByFilialeId(@Param("filialeId") Long filialeId);

@Query("""
    SELECT DISTINCT new com.gestion_equipment.gestion_equipement.dto.ProprietaireEquipementDTO(
        ei.idEquipementInstance,
        ei.nom,
        ei.prenom,
        ei.matricule,
        ei.direction,
        ei.departement,
        ei.fonction,
        ei.unite,
        e.libelle,
        u.nom,
        ei.dateCreation,
        ei.scanner,
        null
      
    )
    FROM EquipementInstance ei
    JOIN ei.equipement e
    JOIN ei.utilisateur u
    LEFT JOIN ei.valeurs v
    WHERE (:equipementId IS NULL OR e.id = :equipementId)
    AND (:filialeId IS NULL OR ei.filiale.id = :filialeId)
    AND (:direction IS NULL OR ei.direction = :direction)
    AND (:departement IS NULL OR ei.departement = :departement)
    AND (:fonction IS NULL OR ei.fonction = :fonction)
    AND (:unite IS NULL OR ei.unite = :unite)
    AND (COALESCE(:valeurs, NULL) IS NULL OR v.valeur IN :valeurs)
    GROUP BY ei.idEquipementInstance, ei.nom, ei.prenom, ei.matricule,
             ei.direction, ei.departement, ei.fonction, ei.unite,
             e.libelle, u.nom, ei.dateCreation
    HAVING (COALESCE(:valeurs, NULL) IS NULL OR COUNT(DISTINCT v.valeur) = :nbValeurs)
""")
List<ProprietaireEquipementDTO> findProprietairesAvecFiltrageValeurs(
        @Param("equipementId") Long equipementId,
        @Param("filialeId") Long filialeId,
        @Param("direction") String direction,
        @Param("departement") String departement,
        @Param("fonction") String fonction,
        @Param("unite") String unite,
        @Param("valeurs") List<String> valeurs,
        @Param("nbValeurs") long nbValeurs
);
@Query("SELECT new com.gestion_equipment.gestion_equipement.dto.EquipementInstProprietaireDTO(" +
       "CONCAT(i.nom, ' ', i.prenom), " +
       "i.utilisateur.nom, " +
       "i.dateCreation, " +
       "i.equipement.libelle, " +
       "i.idEquipementInstance, " +
       "i.matricule, " +
       "i.filiale.nomFiliale, " +
       "null, " +  
       "i.scanner, " +
       "i.fonction, " +
       "i.departement, " +
       "i.direction) " +
       "FROM EquipementInstance i")
List<EquipementInstProprietaireDTO> findDetailsInst();



}

