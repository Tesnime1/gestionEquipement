package com.gestion_equipment.gestion_equipement.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gestion_equipment.gestion_equipement.dto.HistoriqueCompletDTO;
import com.gestion_equipment.gestion_equipement.repository.HistoriqueEquipementRepo;
@Service
public class HistoriqueService {
    private  HistoriqueEquipementRepo historiqueEquipementRepo;
    public HistoriqueService(HistoriqueEquipementRepo historiqueEquipementRepo){this.historiqueEquipementRepo=historiqueEquipementRepo;}
public List<HistoriqueCompletDTO> getAllHistorique() {
        return historiqueEquipementRepo.findAll()
                .stream()
                .map(h -> new HistoriqueCompletDTO(
                        h.getAncienNomProprietaire(),
                        h.getNouveauProprietaire(),
                        h.getModifiePar(),
                        h.getDateModification(),
                        h.getAncienneDate(),
                        h.getEquipementInstance() != null ? h.getEquipementInstance().getIdEquipementInstance() : null,
                        (h.getEquipementInstance() != null && h.getEquipementInstance().getEquipement() != null) 
                                ? h.getEquipementInstance().getEquipement().getLibelle()
                                : null,
                        h.getUtilisateur() != null ? h.getUtilisateur().getNom() : null,
                        h.getEquipementInstance() != null ? h.getEquipementInstance().getDateCreation() : null
                ))
                .collect(Collectors.toList());
    }
}
