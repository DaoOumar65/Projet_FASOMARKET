package com.example.fasomarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;

public class InscriptionVendeurRequest {
    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomComplet;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Format de téléphone invalide")
    private String telephone;

    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;

    @NotBlank(message = "La carte d'identité est obligatoire")
    @Pattern(regexp = "^B[0-9]{8}$", message = "Format de carte d'identité invalide (ex: B10802321)")
    private String carteIdentite;

    public InscriptionVendeurRequest() {}

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public String getCarteIdentite() { return carteIdentite; }
    public void setCarteIdentite(String carteIdentite) { this.carteIdentite = carteIdentite; }
}