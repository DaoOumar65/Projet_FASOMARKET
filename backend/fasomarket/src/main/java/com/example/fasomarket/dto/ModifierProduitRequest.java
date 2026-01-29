package com.example.fasomarket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

public class ModifierProduitRequest {
    private String nom;
    private String description;
    private String categorie;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être positif")
    private BigDecimal prix;
    
    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private Integer quantiteStock;
    
    private String images;
    private java.util.List<String> imagesList;
    private String sku;
    private BigDecimal poids;
    private String dimensions;
    private String tags;
    private BigDecimal remise;
    private Boolean actif;
    private String status; // ACTIVE, HIDDEN
    private String colors;
    private String sizes;

    public ModifierProduitRequest() {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private ModifierProduitRequest request = new ModifierProduitRequest();

        public Builder nom(String nom) {
            request.nom = nom;
            return this;
        }

        public Builder quantiteStock(Integer quantiteStock) {
            request.quantiteStock = quantiteStock;
            return this;
        }

        public ModifierProduitRequest build() {
            return request;
        }
    }

    // Getters et Setters
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

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public java.util.List<String> getImagesList() { return imagesList; }
    public void setImagesList(java.util.List<String> imagesList) { 
        this.imagesList = imagesList;
        if (imagesList != null && !imagesList.isEmpty()) {
            this.images = String.join(",", imagesList);
        }
    }

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

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getColors() { return colors; }
    public void setColors(String colors) { this.colors = colors; }

    public String getSizes() { return sizes; }
    public void setSizes(String sizes) { this.sizes = sizes; }
}