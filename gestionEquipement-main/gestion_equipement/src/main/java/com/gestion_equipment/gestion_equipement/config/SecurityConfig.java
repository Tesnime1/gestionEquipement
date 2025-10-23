package com.gestion_equipment.gestion_equipement.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.gestion_equipment.gestion_equipement.model.Utilisateur;
import com.gestion_equipment.gestion_equipement.repository.Utilisateur_Repo;

@Configuration
public class SecurityConfig {

   @Autowired
   private Utilisateur_Repo utilisateur_Repo;
    // 1. Encoder de mots de passe
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    // 2. Chargement de l'utilisateur depuis la base
    @Bean
    public UserDetailsService userDetailsService() {
    return nom -> {
        Utilisateur utilisateur = utilisateur_Repo.findByNom(nom)
        .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
          System.out.println("Tentative de login avec : " + nom);

        return org.springframework.security.core.userdetails.User
                .withUsername(utilisateur.getNom())
                .password(utilisateur.getPassword())
                .roles(utilisateur.getRole().name())
                .build();
    };
}
    // 3. Configuration sécurité
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/css/**", "/js/**","/images/**").permitAll()
                .requestMatchers("/home","/AfficheAddUser","/pageAddEquipement","/addEquipement","/Equipements","/FicheTechs","/addFichTech","/addProprietaire","/details","/pageAddFicheTech","/pageAddProprietaire","/equipement/**","/equipementFiches","/Proprietaires","/showProprietaires","/*/proprietaire","/*/ficheTechvalue","/showHistory","/historique","/*/updateFiliale","/*/updateFiche" ,"/pageAddFiliale","/NomIdFiliales","/Filiales","/equipement-instance/*","/test-connexion","/showResearchEquipementFiliale","/showFiliales","/showEquipements","/addFiliale","/addEquipement").hasAnyRole("ADMIN", "UTILISATEUR")
                .requestMatchers("/addUser","/Users","/showUsers").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/auth") // GET /login pour la vue
                .loginProcessingUrl("/login") // POST /login pour traitement
                .failureUrl("/login?error=true") 
                .successHandler((request, response, authentication) -> {
                String username = authentication.getName();
                String role = authentication.getAuthorities().iterator().next().getAuthority();
                System.out.println("✅ Login réussi : " + username + " avec rôle " + role);
                request.getSession().setAttribute("role", role);
             // Peu importe le rôle -> redirige vers /home
             response.sendRedirect("/home");
            })
        .permitAll()
            )
            .logout(logout -> logout.permitAll());
           // Ça veut dire que tout le monde (même sans être connecté) a le droit d’appeler /logout.Sinon, Spring aurait exigé d’être authentifié avant de pouvoir se déconnecter (ce qui serait un peu contradictoire
           //"Voici la configuration de sécurité que j’ai définie, applique-la sur toutes mes requêtes HTTP."
         return http.build(); 
    }
}
