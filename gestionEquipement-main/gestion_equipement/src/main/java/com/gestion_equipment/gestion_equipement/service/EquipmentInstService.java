package com.gestion_equipment.gestion_equipement.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.gestion_equipment.gestion_equipement.dto.*;
import com.gestion_equipment.gestion_equipement.model.*;
import com.gestion_equipment.gestion_equipement.repository.*;
import jakarta.transaction.Transactional;



@Service
public class EquipmentInstService {
   private final EquipementInstance_Repo equipementInstrepo;
   private final EquipementRepo equipementRepo;
   private final Utilisateur_Repo utilisateurRepo;
   private final FicheTech_Repo ficheTechRepo;
   private final FicheTechValeur_Repo ficheTechValeurRepo;
   private final HistoriqueEquipementRepo historiqueEquipementRepo;
   private final FilialeRepo filialeRepo;

   public EquipmentInstService(EquipementInstance_Repo equipementInstrepo,EquipementRepo equipementRepo,Utilisateur_Repo utilisateurRepo,
   FicheTechValeur_Repo ficheTechValeurRepo,FicheTech_Repo ficheTechRepo ,HistoriqueEquipementRepo historiqueEquipementRepo,FilialeRepo filialeRepo){
        this.equipementInstrepo=equipementInstrepo;
        this.equipementRepo=equipementRepo;
        this.utilisateurRepo=utilisateurRepo;
        this.ficheTechRepo = ficheTechRepo;
        this.ficheTechValeurRepo = ficheTechValeurRepo;
        this.historiqueEquipementRepo=historiqueEquipementRepo;
        this.filialeRepo=filialeRepo;
    }
@Transactional
public EquipementInstance createProprietaireWithValeurs(EquipementInstDTO dto, String username) {
        // 1) utilisateur connecté
        Utilisateur utilisateur = utilisateurRepo.findByNom(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + username));

        // 2) equipement
        Equipement equipement = equipementRepo.findById(dto.getEquipementId())
                .orElseThrow(() -> new RuntimeException("Equipement introuvable: " + dto.getEquipementId()));

        Filiale filiale = filialeRepo.findById(dto.getFilialeId())
            .orElseThrow(() -> new RuntimeException("Filiale introuvable: " + dto.getFilialeId()));
    
        // 3) créer instance
        EquipementInstance instance = new EquipementInstance();
        instance.setNom(dto.getNom());
        instance.setDateCreation(LocalDateTime.now());
        instance.setEquipement(equipement);
        instance.setUtilisateur(utilisateur);
         instance.setPrenom(dto.getPrenom());
         instance.setMatricule(dto.getMatricule());
         instance.setDirection(dto.getDirection());
         instance.setDepartement(dto.getDepartement());
         instance.setFonction(dto.getFonction());
         instance.setUnite(dto.getUnite());

        instance.setFiliale(filiale);

        EquipementInstance savedInstance = equipementInstrepo.save(instance);

        // 4) créer valeurs
        List<FicheTech_valeur> valeursToSave = new ArrayList<>();
        if (dto.getValeurs() != null) {
            for (FicheTechValeurDTO v : dto.getValeurs()) {
                // lier à la fiche technique (contrôler existence)
                FicheTechnique fiche = ficheTechRepo.findById(v.getFicheTechId())
                        .orElseThrow(() -> new RuntimeException("FicheTechnique introuvable: " + v.getFicheTechId()));

                FicheTech_valeur val = new FicheTech_valeur();
                val.setValeur(v.getValeur());
                val.setFicheTechnique(fiche);
                val.setEquipementInstance(savedInstance);
                valeursToSave.add(val);
            }
  
            ficheTechValeurRepo.saveAll(valeursToSave);
        }

        return savedInstance;
    }

public List<EquipementInstance> getAllEquipementInsts( ) {
        return equipementInstrepo.findAll();
    } 
public List<EquipementInstance> getProprietairebyEquipement(Long equipementId ) {
        return equipementInstrepo.findByEquipement_IdEquipement( equipementId);
    }
    


public List<ProprietaireEquipementDTO> getAllProprietaire() {
    List<EquipementInstance> instances = equipementInstrepo.findAll();

    return instances.stream().map(e -> {
        ProprietaireEquipementDTO dto = new ProprietaireEquipementDTO();

        dto.setIdEquipementInst(e.getIdEquipementInstance());
        dto.setNomProprietaire(e.getNom());
        dto.setDateDajout(e.getDateCreation());
        dto.setEquipement(e.getEquipement() != null ? e.getEquipement().getLibelle() : "—");
        dto.setAjouterPar(e.getUtilisateur() != null ? e.getUtilisateur().getNom() : "—");

        return dto;
    }).collect(Collectors.toList());
}

// ===== SERVICE : updateProprietaire (CORRIGÉ SELON LES ENTITIES) =====
@Transactional
public ProprietaireEquipementDTO updateProprietaire(Long idEquipementInst, ProprietaireEquipementDTO dto) {
    // 1️ Récupérer l'instance
    EquipementInstance instance = equipementInstrepo.findById(idEquipementInst)
            .orElseThrow(() -> new RuntimeException("Instance introuvable"));

    // 2️ Récupérer l'utilisateur connecté
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    Utilisateur utilisateur = utilisateurRepo.findByNom(username)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

    // 3️ Créer l'historique AVANT modification
    HistoriqueEquipement hist = new HistoriqueEquipement();
    hist.setEquipementInstance(instance);
    hist.setUtilisateur(utilisateur);
    hist.setDateModification(LocalDateTime.now());
    
    // Sauvegarder les ANCIENNES valeurs
    hist.setAncienNomProprietaire(instance.getNom());
    hist.setAncienPrenomProprietaire(instance.getPrenom());
    hist.setAncienneMatricule(instance.getMatricule());
    hist.setAncienneDate(instance.getDateCreation());
    if (instance.getFiliale() != null) {
        hist.setAncienNomFiliale(instance.getFiliale().getNomFiliale());
    }
    if (instance.getUtilisateur() != null) {
        hist.setAncienProprietaireAjoutePar(instance.getUtilisateur().getNom());
    }
    
    // Sauvegarder les NOUVELLES valeurs
    hist.setNouveauProprietaire(dto.getNomProprietaire());
    hist.setModifiePar(username);
    
    historiqueEquipementRepo.save(hist);

    // 4️ Mettre à jour l'équipement INSTANCE
    instance.setNom(dto.getNomProprietaire());
    instance.setPrenom(dto.getPrenomProprietaire());
    instance.setMatricule(dto.getMatricule());
    instance.setDepartement(dto.getDepartement());
    instance.setDirection(dto.getDirection());
    instance.setFonction(dto.getFonction());
    instance.setUnite(dto.getUnite());
    
    equipementInstrepo.save(instance);

    // 5️ Retourner le DTO de réponse
    ProprietaireEquipementDTO result = new ProprietaireEquipementDTO();
    result.setIdEquipementInst(instance.getIdEquipementInstance());
    result.setNomProprietaire(instance.getNom());
    result.setPrenomProprietaire(instance.getPrenom());
    result.setMatricule(instance.getMatricule());
    result.setDepartement(instance.getDepartement());
    result.setDirection(instance.getDirection());
    result.setFonction(instance.getFonction());
    result.setUnite(instance.getUnite());
    result.setDateDajout(instance.getDateCreation());
    result.setEquipement(instance.getEquipement().getLibelle());
    result.setAjouterPar(instance.getUtilisateur() != null ? instance.getUtilisateur().getNom() : "N/A");
  
    
    return result;
}

@Transactional
public List<FicheTechValeurDTO> updateFicheTechValeurs(Long idEquipementInst, List<FicheTechValeurDTO> valeurs) {
    List<FicheTechValeurDTO> result = new ArrayList<>();
    if (valeurs != null) {
        for (FicheTechValeurDTO v : valeurs) {
            ficheTechValeurRepo.findById(v.getIdValeur()).ifPresent(val -> {
                val.setValeur(v.getValeur());
                ficheTechValeurRepo.save(val);
                // Reconstruire DTO mis à jour
                FicheTechValeurDTO updated = new FicheTechValeurDTO();
                updated.setIdValeur(val.getIdFtvaleur());
                updated.setValeur(val.getValeur());
                updated.setLibelleFiche(val.getFicheTechnique().getLibelle());
                result.add(updated);
            });
        }}
    return result;
}

public List<EquipementInstFilialeDTO> getDetailsByFiliale(Long filialeId) {
        // Validation optionnelle
        if (filialeId == null) {
            throw new IllegalArgumentException("L'ID de la filiale ne peut pas être null");
        } 
        // Le filtrage est déjà fait en base
        return equipementInstrepo.findDetailsInstByFilialeId(filialeId);
    }

public List<ProprietaireEquipementDTO> getProprietairesAvecValeurs(
            Long equipementId,
            Long filialeId,
            List<String> valeurs,
            String direction,
            String departement,
            String fonction,
            String unite
    ) {
        long nbValeurs = (valeurs == null) ? 0 : valeurs.size();
        if (valeurs != null && valeurs.isEmpty()) {
            valeurs = null; // pour que COALESCE fonctionne dans la requête
        }

        // Étape 1 : récupérer les propriétaires selon ta requête principale
        List<ProprietaireEquipementDTO> proprietaires = equipementInstrepo.findProprietairesAvecFiltrageValeurs(
                equipementId,
                filialeId,
                direction,
                departement,
                fonction,
                unite,
                valeurs,
                nbValeurs
        );

        if (proprietaires.isEmpty()) {
            return proprietaires;
        }

        // Étape 2 : récupérer les valeurs techniques pour chaque propriétaire
        for (ProprietaireEquipementDTO p : proprietaires) {
            List<FicheTechValeurDTO> valeursFiche =
                    ficheTechValeurRepo.findValeursAvecLibelleByEquipementInst(p.getIdEquipementInst());
            p.setValeurs(valeursFiche);
        }

        return proprietaires;
    }


public List<EquipementInstProprietaireDTO> getDetailsInstances() {
        try {
           
            List<EquipementInstProprietaireDTO> result = equipementInstrepo.findDetailsInst();
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération des instances", e);
        }
    }

}

