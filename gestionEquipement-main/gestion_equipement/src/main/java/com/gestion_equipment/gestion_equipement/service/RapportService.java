package com.gestion_equipment.gestion_equipement.service;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import com.gestion_equipment.gestion_equipement.dto.FicheValeurReportDTO;
import com.gestion_equipment.gestion_equipement.model.EquipementInstance;
import com.gestion_equipment.gestion_equipement.model.FicheTech_valeur;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;

@Service
public class RapportService {

    public byte[] generateEquipementInstanceReport(EquipementInstance instance, List<FicheTech_valeur> valeurs) throws JRException, IOException {
        // 1) Charger le .jrxml (place-le dans resources/reports/)
        Resource resource = new ClassPathResource("/reports/rapportProprietaire.jrxml");
        JasperReport jasperReport = JasperCompileManager.compileReport(resource.getInputStream());

        // 2) Préparer les paramètres
        Map<String, Object> params = new HashMap<>();
        params.put("nom", instance.getNom());
        params.put("prenom", instance.getPrenom());
        params.put("equipement", instance.getEquipement().getLibelle());
        params.put("direction", instance.getDirection());
        params.put("departement", instance.getDepartement());
        params.put("fonction", instance.getFonction());
        params.put("unite", instance.getUnite());
        params.put("filiale", instance.getFiliale() != null ? instance.getFiliale().getNomFiliale() : "");
        params.put("dateCreation", instance.getDateCreation() != null ? instance.getDateCreation().toString() : "");

        // 3) Préparer la datasource (mapper vers DTO simple)
        List<FicheValeurReportDTO> rows = valeurs.stream()
            .map(v -> new FicheValeurReportDTO(v.getFicheTechnique().getLibelle(), v.getValeur()))
            .collect(Collectors.toList());
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(rows);

        // 4) Remplir et exporter en bytes
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }
}
