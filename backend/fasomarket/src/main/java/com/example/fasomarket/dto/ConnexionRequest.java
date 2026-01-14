package com.example.fasomarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ConnexionRequest {
    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9\\s]{8,20}$", message = "Format de téléphone invalide")
    private String telephone;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;

    public ConnexionRequest() {}

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
}