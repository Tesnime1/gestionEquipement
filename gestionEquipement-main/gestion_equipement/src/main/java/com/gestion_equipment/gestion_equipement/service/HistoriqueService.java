package com.gestion_equipment.gestion_equipement.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.gestion_equipment.gestion_equipement.dto.FicheTechValeurDTO;
import com.gestion_equipment.gestion_equipement.dto.HistoriqueCompletDTO;
import com.gestion_equipment.gestion_equipement.repository.FicheTechValeur_Repo;
import com.gestion_equipment.gestion_equipement.repository.HistoriqueEquipementRepo;
@Service
public class HistoriqueService {
    private  HistoriqueEquipementRepo historiqueEquipementRepo;
    private FicheTechValeur_Repo ficheTechValeurRepo;
    public HistoriqueService(HistoriqueEquipementRepo historiqueEquipementRepo, FicheTechValeur_Repo ficheTechValeurRepo){
        this.historiqueEquipementRepo=historiqueEquipementRepo;
        this.ficheTechValeurRepo=ficheTechValeurRepo;
    }
public List<HistoriqueCompletDTO> getAllHistorique() {
    return historiqueEquipementRepo.findAll()
            .stream()
            .map(h -> new HistoriqueCompletDTO(
                    h.getAncienNomProprietaire()+" "+h.getAncienPrenomProprietaire(),
                   
                    h.getNouveauProprietaire(),
                    h.getModifiePar(),
                    h.getDateModification(),
                    h.getAncienneDate(),
                    h.getEquipementInstance() != null ? h.getEquipementInstance().getIdEquipementInstance() : null,
                    (h.getEquipementInstance() != null && h.getEquipementInstance().getEquipement() != null)
                            ? h.getEquipementInstance().getEquipement().getLibelle()
                            : null,
                    h.getIdHistoriqueEquipement(),
                    h.getUtilisateur() != null ? h.getUtilisateur().getNom() : null,
                    h.getEquipementInstance() != null ? h.getEquipementInstance().getDateCreation() : null,
                    h.getMotif()
            ))
            .collect(Collectors.toList());
}

public HistoriqueCompletDTO getHistoryById(Long id) {
    return historiqueEquipementRepo.findById(id)
            .map(h ->{
                  
                // 🔥 Récupérer les valeurs techniques
                List<FicheTechValeurDTO> valeurs = ficheTechValeurRepo
                        .findValeursAvecLibelleByEquipementInst(
                                h.getEquipementInstance() != null ?
                                        h.getEquipementInstance().getIdEquipementInstance() : null
                        ).stream()
                             .map(v -> new FicheTechValeurDTO(
                                v.getIdValeur(),
                                v.getValeur(),
                                v.getLibelleFiche()
                             
                        ))
                        .toList();

               return new HistoriqueCompletDTO(
                        h.getAncienNomProprietaire()+" "+h.getAncienPrenomProprietaire(),
                       
                        null,
                        h.getNouveauProprietaire(),
                        h.getModifiePar(),
                        h.getDateModification(),
                        h.getAncienneDate(),
                        h.getEquipementInstance() != null ? h.getEquipementInstance().getIdEquipementInstance() : null,
                        h.getEquipementInstance() != null && h.getEquipementInstance().getEquipement() != null
                                ? h.getEquipementInstance().getEquipement().getLibelle()
                                : null,
                      
                        h.getUtilisateur() != null ? h.getUtilisateur().getNom() : null,
                        h.getEquipementInstance() != null ? h.getEquipementInstance().getDateCreation() : null,
                         h.getIdHistoriqueEquipement(),
                          valeurs             // ⬅️ Important !
                );
            })
            .orElse(null);
}

public List<HistoriqueCompletDTO> getHistoriqueByEquipementInstance(Long idEquipementInstance) {

        return historiqueEquipementRepo
                .findByEquipementInstance_IdEquipementInstanceOrderByDateModificationDesc(idEquipementInstance)
                .stream()
                .map(h -> new HistoriqueCompletDTO(
                        h.getAncienNomProprietaire()+" "+h.getAncienPrenomProprietaire(),
                      
                        h.getAncienneMatricule(),
                        h.getNouveauProprietaire(),
                        h.getModifiePar(),
                        h.getDateModification(),
                        h.getAncienneDate(),
                        h.getEquipementInstance() != null 
                                ? h.getEquipementInstance().getIdEquipementInstance()
                                : null,
                        (h.getEquipementInstance() != null 
                            && h.getEquipementInstance().getEquipement() != null)
                                ? h.getEquipementInstance().getEquipement().getLibelle()
                                : null,
                        h.getUtilisateur() != null ? h.getUtilisateur().getNom() : null,
                        h.getEquipementInstance() != null 
                                ? h.getEquipementInstance().getDateCreation()
                                : null,
                        h.getIdHistoriqueEquipement(),
                        null // valeurs si tu veux plus tard
                ))
                .collect(Collectors.toList());
    }


}
