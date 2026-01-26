package com.example.fasomarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;
import java.math.BigDecimal;

public class CreerBoutiqueRequest {
    @NotBlank(message = "Le nom de la boutique est obligatoire")
    private String nom;

    private String description;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Format de téléphone invalide")
    private String telephone;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le numéro CNIB est obligatoire")
    @Pattern(regexp = "^B[0-9]{8}$", message = "Format CNIB invalide (ex: B10802321)")
    private String numeroCnib;

    @NotBlank(message = "Le fichier IFU est obligatoire")
    private String fichierIfu; // Chemin vers le fichier IFU (image ou PDF)

    private String logoUrl;
    private String bannerUrl;
    private String categorie;
    private String horairesOuverture;
    private String liensReseauxSociaux;
    private Boolean livraison = false;
    private BigDecimal fraisLivraison = BigDecimal.ZERO;
    private String tags;

    public CreerBoutiqueRequest() {}

    // Getters et Setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNumeroCnib() { return numeroCnib; }
    public void setNumeroCnib(String numeroCnib) { this.numeroCnib = numeroCnib; }

    public String getFichierIfu() { return fichierIfu; }
    public void setFichierIfu(String fichierIfu) { this.fichierIfu = fichierIfu; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public String getHorairesOuverture() { return horairesOuverture; }
    public void setHorairesOuverture(String horairesOuverture) { this.horairesOuverture = horairesOuverture; }

    public String getLiensReseauxSociaux() { return liensReseauxSociaux; }
    public void setLiensReseauxSociaux(String liensReseauxSociaux) { this.liensReseauxSociaux = liensReseauxSociaux; }

    public Boolean getLivraison() { return livraison; }
    public void setLivraison(Boolean livraison) { this.livraison = livraison; }

    public BigDecimal getFraisLivraison() { return fraisLivraison; }
    public void setFraisLivraison(BigDecimal fraisLivraison) { this.fraisLivraison = fraisLivraison; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}