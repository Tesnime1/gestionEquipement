package com.gestion_equipment.gestion_equipement.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.servlet.http.HttpSession;

@Controller
public class pageController {
 
    @GetMapping("/session/check")
    public ResponseEntity<Map<String, Object>> checkSession(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        // Vérifier l'authentification Spring Security
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            response.put("valid", false);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Vérifier la session
        if (session == null) {
            response.put("valid", false);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        response.put("valid", true);
        response.put("user", auth.getName());
        return ResponseEntity.ok(response);
    }
   
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
    if (session != null) {
            session.invalidate();}
             return ResponseEntity.ok().build();
        }
     @GetMapping("/home")
     public String homepage() {
     return "sideBarMenu";
     }

    @GetMapping("/auth")
    public String loginpage(@RequestParam(value = "error", required = false) String error,
                        @RequestParam(value = "logout", required = false) String logout,
                        Model model) {
  
    if (error != null) {
        model.addAttribute("error", true);
        System.out.println("⚠️ Erreur de connexion détectée");
    }
    if (logout != null) {
        model.addAttribute("logout", true);
    }
    return "auth";
}
    @GetMapping("/session-expired")
    public String showSessionExpiredPage() {
    return "sessionExpired"; // Un template Thymeleaf simple avec ton message ou un script pour afficher le popup
    }
    
    @GetMapping("/showFiliales")
    public String getPageshowFiliales() {
    return "afficheFiliale";
    }

    @GetMapping("/showEquipements")
    public String getPageshowEquipements() {    
    return "afficheEquipement";
    }
    
    @GetMapping("/showProprietaires")
    public String getPageshowProprietaires() {    
    return "afficheProprietaire";
    }
    @GetMapping("/showUsers")
    public String getPageshowUsers() {
      return "afficheUser";
    }
    @GetMapping("/pageAddEquipement")
    public String getPageAddequipement() {
    return "addEquipement";
    }
   @GetMapping("/AfficheAddUser")
    public String getPageAfficheAddUser() {
      return "addUser";
    }
    @GetMapping("/pageAddFiliale")
    public String getPageAddfiliale() {
    return "addFiliale";
    }
    @GetMapping("/pageAddFicheTech")
    public String getPageAddFicheTech() {
      return "addFicheTech";
    }
    @GetMapping("/pageAddProprietaire")
    public String getPageAddProprietaire() {
    return "addProprietaire";
    }
        @GetMapping("/pageAddEquipementAuIT")
    public String getPageAddEquipementAuIT() {
    return "addEquipementAuIT";
    }

    @GetMapping("/showHistory")
    public String getPageAfficheHistorique() {
      return "afficheHistorique";
    }
    @GetMapping("/showResearchEquipement")
    public String getPageResearchEquipement() {
    return "rechercheParEquipement";
    }
   @GetMapping("/showResearchEquipementFiliale")
    public String getPageResearchFiliale() {
    return "rechercheParFiliale";
  }
}
