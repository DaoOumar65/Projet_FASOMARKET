package com.example.fasomarket.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class CategorieResponse {
    private UUID id;
    private String nom;
    private String description;
    private String icone;
    private Boolean active;
    private LocalDateTime dateCreation;
    private Long nombreBoutiques;
    private Long nombreProduits;

    public CategorieResponse() {}

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public Long getNombreBoutiques() { return nombreBoutiques; }
    public void setNombreBoutiques(Long nombreBoutiques) { this.nombreBoutiques = nombreBoutiques; }

    public Long getNombreProduits() { return nombreProduits; }
    public void setNombreProduits(Long nombreProduits) { this.nombreProduits = nombreProduits; }
}