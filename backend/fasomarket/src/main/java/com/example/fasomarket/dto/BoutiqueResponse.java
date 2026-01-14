package com.example.fasomarket.dto;

import com.example.fasomarket.model.ShopStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class BoutiqueResponse {
    private UUID id;
    private String nom;
    private String description;
    private String logoUrl;
    private String bannerUrl;
    private String email;
    private String telephone;
    private String adresse;
    private ShopStatus statut;
    private String categorie;
    private String horairesOuverture;
    private BigDecimal note;
    private Integer nombreAvis;
    private String liensReseauxSociaux;
    private Boolean livraison;
    private BigDecimal fraisLivraison;
    private String tags;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    public BoutiqueResponse() {}

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public ShopStatus getStatut() { return statut; }
    public void setStatut(ShopStatus statut) { this.statut = statut; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public String getHorairesOuverture() { return horairesOuverture; }
    public void setHorairesOuverture(String horairesOuverture) { this.horairesOuverture = horairesOuverture; }

    public BigDecimal getNote() { return note; }
    public void setNote(BigDecimal note) { this.note = note; }

    public Integer getNombreAvis() { return nombreAvis; }
    public void setNombreAvis(Integer nombreAvis) { this.nombreAvis = nombreAvis; }

    public String getLiensReseauxSociaux() { return liensReseauxSociaux; }
    public void setLiensReseauxSociaux(String liensReseauxSociaux) { this.liensReseauxSociaux = liensReseauxSociaux; }

    public Boolean getLivraison() { return livraison; }
    public void setLivraison(Boolean livraison) { this.livraison = livraison; }

    public BigDecimal getFraisLivraison() { return fraisLivraison; }
    public void setFraisLivraison(BigDecimal fraisLivraison) { this.fraisLivraison = fraisLivraison; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }
}