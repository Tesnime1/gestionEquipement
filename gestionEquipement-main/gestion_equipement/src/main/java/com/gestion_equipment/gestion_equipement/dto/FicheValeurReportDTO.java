package com.gestion_equipment.gestion_equipement.dto;
public class FicheValeurReportDTO {
    private String attribut; // nom de la fiche technique
    private String valeur;   // valeur saisie

    public FicheValeurReportDTO(String attribut, String valeur) {
        this.attribut = attribut;
        this.valeur = valeur;
    }
    // getters
    public String getAttribut() { return attribut; }
    public String getValeur() { return valeur; }
}
