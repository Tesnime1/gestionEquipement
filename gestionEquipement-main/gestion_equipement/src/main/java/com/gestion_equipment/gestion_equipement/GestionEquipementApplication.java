package com.gestion_equipment.gestion_equipement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class GestionEquipementApplication extends SpringBootServletInitializer {
    
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(GestionEquipementApplication.class);
    }
   
    public static void main(String[] args) {
        SpringApplication.run(GestionEquipementApplication.class, args);
    }
}