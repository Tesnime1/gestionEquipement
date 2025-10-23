package com.gestion_equipment.gestion_equipement.controller;

import org.springframework.http.HttpHeaders;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_equipment.gestion_equipement.dto.EquipementInstDTO;
import com.gestion_equipment.gestion_equipement.model.EquipementInstance;
import com.gestion_equipment.gestion_equipement.model.FicheTech_valeur;
import com.gestion_equipment.gestion_equipement.repository.FicheTechValeur_Repo;
import com.gestion_equipment.gestion_equipement.service.EquipmentInstService;
import com.gestion_equipment.gestion_equipement.service.RapportService;


@RestController
public class Reportcontroller {
@Autowired
 private  FicheTechValeur_Repo ficheTechValeurRepo;

@Autowired
 private  RapportService rapportService;
  
private EquipmentInstService equipmentInstService;
    public Reportcontroller(  EquipmentInstService equipmentInstService)
 {this.equipmentInstService=equipmentInstService;}
       
        @PostMapping(value = "/addProprietaire", consumes = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<byte[]> createAndGetReport(@RequestBody EquipementInstDTO dto, Principal principal) throws Exception {
        String username = principal.getName();
        EquipementInstance saved = equipmentInstService.createProprietaireWithValeurs(dto, username);

        // récupérer les valeurs liées
         List<FicheTech_valeur> valeurs = ficheTechValeurRepo.findByEquipementInstance(saved);

        byte[] pdfBytes = rapportService.generateEquipementInstanceReport(saved, valeurs);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename("rapport_" + saved.getIdEquipementInstance() + ".pdf").build());

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}

