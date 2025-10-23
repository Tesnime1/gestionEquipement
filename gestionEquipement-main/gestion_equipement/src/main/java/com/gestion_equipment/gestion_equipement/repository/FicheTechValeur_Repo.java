package com.gestion_equipment.gestion_equipement.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gestion_equipment.gestion_equipement.dto.FicheTechValeurDTO;
import com.gestion_equipment.gestion_equipement.model.EquipementInstance;
import com.gestion_equipment.gestion_equipement.model.FicheTech_valeur;

public interface FicheTechValeur_Repo extends JpaRepository<FicheTech_valeur,Long> {
    List<FicheTech_valeur> findByEquipementInstance(EquipementInstance equipementInstance);
    List<FicheTech_valeur> findByEquipementInstance_Equipement_IdEquipement(Long idEquipement);
    List<FicheTech_valeur> findByValeur(String valeur);
  // Récupérer toutes les valeurs liées à un équipement spécifique
@Query("SELECT DISTINCT fv.equipementInstance " +
       "FROM FicheTech_valeur fv " +
       "WHERE fv.equipementInstance.equipement.id = :equipementId")
List<EquipementInstance> findEquipementInstancesByEquipement(@Param("equipementId") Long equipementId);

       @Query("SELECT v FROM FicheTech_valeur v " +
           "LEFT JOIN FETCH v.ficheTechnique " +
           "WHERE v.equipementInstance.id = :idEquipementInstance")
    List<FicheTech_valeur> findByEquipementInstance_Id(@Param("idEquipementInstance") Long idEquipementInstance);
@Query("""
    SELECT new com.gestion_equipment.gestion_equipement.dto.FicheTechValeurDTO(
        v.idFtvaleur,
        v.valeur,
        ft.libelle
    )
    FROM FicheTech_valeur v
    JOIN v.ficheTechnique ft
    WHERE v.equipementInstance.equipement.idEquipement = :idEquipement
""")
List<FicheTechValeurDTO> findValeursAvecLibelleByEquipement(@Param("idEquipement") Long idEquipement);


    @Query("""
        SELECT new com.gestion_equipment.gestion_equipement.dto.FicheTechValeurDTO(
            v.idFtvaleur,
            v.valeur,
            ft.libelle
        )
        FROM FicheTech_valeur v
        JOIN v.ficheTechnique ft
        WHERE v.equipementInstance.idEquipementInstance = :idEquipementInstance
    """)
    List<FicheTechValeurDTO> findValeursAvecLibelleByEquipementInst(
            @Param("idEquipementInstance") Long idEquipementInstance
    );



}
