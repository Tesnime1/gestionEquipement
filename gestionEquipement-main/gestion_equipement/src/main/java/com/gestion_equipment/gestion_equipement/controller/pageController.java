package com.gestion_equipment.gestion_equipement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


import jakarta.servlet.http.HttpSession;

@Controller
public class pageController {
  // @GetMapping("/home")
  // public String homepage() {
  //   System.out.println("✅ Appel de home"); 
  //     return "home";
  // }
@GetMapping("/home")
public String homepage(HttpSession session, Model model) {
    String role = (String) session.getAttribute("role");  // récupéré depuis successHandler
    model.addAttribute("role", role);                     // injecté dans Thymeleaf
    return "home";
}

  @GetMapping("/auth")
  public String loginpage() {
      System.out.println("✅ Appel de /login"); 
      return "auth";
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
