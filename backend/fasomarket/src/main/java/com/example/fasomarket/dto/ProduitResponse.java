package com.example.fasomarket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ProduitResponse {
    private UUID id;
    private UUID boutiqueId;
    private String nomBoutique;
    private String nom;
    private String description;
    private String categorie;
    private BigDecimal prix;
    private Integer quantiteStock;
    private Boolean actif;
    private String images;
    private String sku;
    private BigDecimal poids;
    private String dimensions;
    private String tags;
    private BigDecimal remise;
    private BigDecimal note;
    private Integer nombreAvis;
    private Boolean disponible;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    public ProduitResponse() {}

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBoutiqueId() { return boutiqueId; }
    public void setBoutiqueId(UUID boutiqueId) { this.boutiqueId = boutiqueId; }

    public String getNomBoutique() { return nomBoutique; }
    public void setNomBoutique(String nomBoutique) { this.nomBoutique = nomBoutique; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public BigDecimal getPrix() { return prix; }
    public void setPrix(BigDecimal prix) { this.prix = prix; }

    public Integer getQuantiteStock() { return quantiteStock; }
    public void setQuantiteStock(Integer quantiteStock) { this.quantiteStock = quantiteStock; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public BigDecimal getPoids() { return poids; }
    public void setPoids(BigDecimal poids) { this.poids = poids; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public BigDecimal getRemise() { return remise; }
    public void setRemise(BigDecimal remise) { this.remise = remise; }

    public BigDecimal getNote() { return note; }
    public void setNote(BigDecimal note) { this.note = note; }

    public Integer getNombreAvis() { return nombreAvis; }
    public void setNombreAvis(Integer nombreAvis) { this.nombreAvis = nombreAvis; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }
}