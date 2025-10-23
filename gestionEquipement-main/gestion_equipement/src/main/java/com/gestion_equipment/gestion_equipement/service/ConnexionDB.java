package com.gestion_equipment.gestion_equipement.service;

import com.gestion_equipment.gestion_equipement.dto.EmployeDTO;
import com.gestion_equipment.gestion_equipement.model.Filiale;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConnexionDB {

    public DataSource createDataSource(Filiale filiale) {
        HikariConfig config = new HikariConfig();

        String adresseIp = filiale.getAdresseIp();
        String host;
        int port = 5432;

        if (adresseIp != null && adresseIp.contains(":")) {
            String[] parts = adresseIp.split(":");
            host = parts[0];
            port = Integer.parseInt(parts[1]);
        } else {
            host = adresseIp;
        }

        String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, filiale.getNomBdd());
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(filiale.getUserBdd());
        config.setPassword(filiale.getPasswordBdd());
        config.setDriverClassName("org.postgresql.Driver");

        // Pool Hikari (adapter selon charge)
        config.setMaximumPoolSize(5);
        config.setConnectionTimeout(30000);

        // Optimisations PostgreSQL
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");

        return new HikariDataSource(config);
    }

    /**
     * Retourne la liste des employés avec toutes les infos demandées.
     */
    public List<EmployeDTO> getEmployes(Filiale filiale) {
        DataSource dataSource = null;
        List<EmployeDTO> employes = new ArrayList<>();

        final String SQL = """
            select 
                x.matricule,
                x.nom,
                x.prenom,
                direction.designation as direction,
                dep.designation as departement,
                fonction.designation as fonction,
                unitname.designation as unitname
            from fonction.poste a
            join employee.employee x on x.fonction = a.id
            join fonction.departement_fonction b on a.id_df = b.id_df
            join fonction.fonction fonction on b.id_fonction = fonction.id_fonction
            join fonction.departement dep on b.id_dep = dep.id_dep
            join fonction.direction direction on dep.id_direction = direction.id_direction
            left join fonction.df_unite unit on a.id_dfu = unit.id
            left join fonction.unite unitname on unit.id_unite = unitname.id_unite
            where etat = 'true'
            order by x.nom, x.prenom
        """;

        try {
            dataSource = createDataSource(filiale);
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(SQL)) {

                while (rs.next()) {
                    EmployeDTO e = new EmployeDTO();
                    e.setMatricule(rs.getString("matricule"));
                    e.setNom(rs.getString("nom"));
                    e.setPrenom(rs.getString("prenom"));
                    e.setDirection(rs.getString("direction"));
                    e.setDepartement(rs.getString("departement"));
                    e.setFonction(rs.getString("fonction"));
                    e.setUnite(rs.getString("unitname"));
                    employes.add(e);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(
                "Erreur lors de la connexion à la base de la filiale '" + filiale.getNomFiliale() + "': " + e.getMessage(), e
            );
        } finally {
            if (dataSource instanceof HikariDataSource ds) {
                ds.close();
            }
        }
        return employes;
    }

    /**
     * Test basique de connexion (inchangé).
     */
    public boolean testerConnexion(Filiale filiale) {
        DataSource dataSource = null;
        try {
            dataSource = createDataSource(filiale);
            try (Connection conn = dataSource.getConnection()) {
                return conn.isValid(5);
            }
        } catch (SQLException e) {
            return false;
        } finally {
            if (dataSource instanceof HikariDataSource ds) {
                ds.close();
            }
        }
    }
}
