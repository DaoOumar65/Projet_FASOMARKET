package com.example.fasomarket.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ModifierProfilVendeurRequest {
    
    @NotBlank(message = "Le nom complet est requis")
    private String nomComplet;
    
    @Email(message = "Format email invalide")
    private String email;
    
    // Constructeurs
    public ModifierProfilVendeurRequest() {}
    
    public ModifierProfilVendeurRequest(String nomComplet, String email) {
        this.nomComplet = nomComplet;
        this.email = email;
    }
    
    // Getters et Setters
    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}