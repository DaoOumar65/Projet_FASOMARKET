package com.example.fasomarket.dto;

import jakarta.validation.constraints.NotBlank;

public class CreerAdresseRequest {
    @NotBlank(message = "Le nom est requis")
    private String nom;

    @NotBlank(message = "L'adresse est requise")
    private String adresse;

    @NotBlank(message = "La ville est requise")
    private String ville;

    @NotBlank(message = "Le téléphone est requis")
    private String telephone;

    private Boolean parDefaut = false;

    // Getters and Setters
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public Boolean getParDefaut() {
        return parDefaut;
    }

    public void setParDefaut(Boolean parDefaut) {
        this.parDefaut = parDefaut;
    }
}