package com.example.fasomarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreerCategorieRequest {
    
    @NotBlank(message = "Le nom de la catégorie est requis")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String nom;
    
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;
    
    private String icone;
    
    // Constructeurs
    public CreerCategorieRequest() {}
    
    public CreerCategorieRequest(String nom, String description, String icone) {
        this.nom = nom;
        this.description = description;
        this.icone = icone;
    }
    
    // Getters et Setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }
}