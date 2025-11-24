package com.gestion_equipment.gestion_equipement.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.gestion_equipment.gestion_equipement.model.Utilisateur;
import com.gestion_equipment.gestion_equipement.repository.Utilisateur_Repo;

import jakarta.servlet.http.HttpServletResponse;

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
                .requestMatchers("/","/session-expired", "/css/**", "/js/**","/images/**","/error","/session/check").permitAll()
                .requestMatchers("/home","/pageAddEquipementAuIT","/auth/**","/AfficheAddUser","/scannerr/**","/detailsRapport/**","/equipement/update","/scanner/**","/pageAddEquipement","/addEquipement","/detailsReport/**","/Equipements","/FicheTechs","/addFichTech","/addProprietaire","/details","/pageAddFicheTech","/pageAddProprietaire","/equipement/**","/equipementFiches","/Proprietaires","/showProprietaires","/*/proprietaire","/*/ficheTechvalue","/showHistory","/historique","/*/updateFiliale","/*/updateFiche" ,"/pageAddFiliale","/NomIdFiliales","/Filiales","/equipement-instance/*","/test-connexion","/showResearchEquipementFiliale","/showFiliales","/showEquipements","/addFiliale","/addEquipement").hasAnyRole("ADMIN", "UTILISATEUR")
                .requestMatchers("/addUser","/Users","/showUsers").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
             .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin()) // ✅ autorise les iframes du même domaine
            )
            .formLogin(form -> form
                .loginPage("/auth") // GET /login pour la vue
                .loginProcessingUrl("/auth") // POST /login pour traitement
                .failureUrl("/auth?error=true") 
                .successHandler((request, response, authentication) -> {
                String username = authentication.getName();
                String role = authentication.getAuthorities().iterator().next().getAuthority();
                System.out.println("✅ Login réussi : " + username + " avec rôle " + role);
                request.getSession().setAttribute("role", role);
             // Peu importe le rôle -> redirige vers /home
             response.sendRedirect(request.getContextPath() +"/home");
            })
        .permitAll()
            )
               .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                // ⚠️ NE PAS mettre invalidSessionUrl ni expiredUrl
                // On va gérer ça avec un handler personnalisé
            )
        .exceptionHandling(exception -> exception
        .authenticationEntryPoint((request, response, authException) -> {
             // Vérifie si c’est une requête AJAX
            String xhrHeader = request.getHeader("X-Requested-With");
            if ("XMLHttpRequest".equalsIgnoreCase(xhrHeader)) {
            // ✅ Si AJAX → renvoyer JSON (ton script le gérera)
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"Session expired\"}");
            } else {
            // 🌐 Sinon → redirige vers page HTML "session-expirée"
            response.sendRedirect("/session-expired");
            }
          })
      )

            .logout(logout -> logout
        .logoutUrl("/logout")
        .logoutSuccessUrl("/auth")   // page de redirection après logout
        .invalidateHttpSession(true)
        .clearAuthentication(true)
        .deleteCookies("JSESSIONID")
        .permitAll()
    );
           // Ça veut dire que tout le monde (même sans être connecté) a le droit d’appeler /logout.Sinon, Spring aurait exigé d’être authentifié avant de pouvoir se déconnecter (ce qui serait un peu contradictoire
           //"Voici la configuration de sécurité que j’ai définie, applique-la sur toutes mes requêtes HTTP."
         return http.build(); 
    }
}
