package com.example.fasomarket.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class CreerProduitRequest {
    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nom;

    private String description;

    private String categorieId;

    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être positif")
    private BigDecimal prix;

    @NotNull(message = "La quantité en stock est obligatoire")
    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private Integer stock;

    // Informations de base
    private List<String> images;
    private BigDecimal poids;
    private String dimensions;
    private String couleur;
    private String marque;
    private String materiau;
    private String taille;
    private List<String> tags;
    
    private String sizes;
    private String colors;
    private String origine;

    // Informations commerciales
    private BigDecimal remise = BigDecimal.ZERO;
    private Integer quantiteMinCommande = 1;
    private Integer quantiteMaxCommande;
    private String periodeGarantie;
    private String politiqueRetour;

    // Informations logistiques
    private BigDecimal poidsExpedition;
    private String dimensionsExpedition;

    // SEO
    private String metaTitre;
    private String metaDescription;
    private String metaMotsCles;

    // Statut
    private Boolean enVedette = false;
    private Boolean actif = true;

    public CreerProduitRequest() {}

    // Getters et Setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategorieId() { return categorieId; }
    
    public void setCategorieId(String categorieId) { 
        this.categorieId = categorieId; 
    }
    
    @JsonAnySetter
    public void handleUnknown(String key, Object value) {
        if ("categorieId".equals(key) && value instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) value;
            if (map.containsKey("id")) {
                this.categorieId = String.valueOf(map.get("id"));
            } else if (map.containsKey("value")) {
                this.categorieId = String.valueOf(map.get("value"));
            }
        }
    }

    public BigDecimal getPrix() { return prix; }
    public void setPrix(BigDecimal prix) { this.prix = prix; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public BigDecimal getPoids() { return poids; }
    public void setPoids(BigDecimal poids) { this.poids = poids; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }

    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }

    public String getMateriau() { return materiau; }
    public void setMateriau(String materiau) { this.materiau = materiau; }

    public String getTaille() { return taille; }
    public void setTaille(String taille) { this.taille = taille; }
    
    public String getSizes() { return sizes; }
    public void setSizes(String sizes) { this.sizes = sizes; }
    
    public String getColors() { return colors; }
    public void setColors(String colors) { this.colors = colors; }
    
    public String getOrigine() { return origine; }
    public void setOrigine(String origine) { this.origine = origine; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public BigDecimal getRemise() { return remise; }
    public void setRemise(BigDecimal remise) { this.remise = remise; }

    public Integer getQuantiteMinCommande() { return quantiteMinCommande; }
    public void setQuantiteMinCommande(Integer quantiteMinCommande) { this.quantiteMinCommande = quantiteMinCommande; }

    public Integer getQuantiteMaxCommande() { return quantiteMaxCommande; }
    public void setQuantiteMaxCommande(Integer quantiteMaxCommande) { this.quantiteMaxCommande = quantiteMaxCommande; }

    public String getPeriodeGarantie() { return periodeGarantie; }
    public void setPeriodeGarantie(String periodeGarantie) { this.periodeGarantie = periodeGarantie; }

    public String getPolitiqueRetour() { return politiqueRetour; }
    public void setPolitiqueRetour(String politiqueRetour) { this.politiqueRetour = politiqueRetour; }

    public BigDecimal getPoidsExpedition() { return poidsExpedition; }
    public void setPoidsExpedition(BigDecimal poidsExpedition) { this.poidsExpedition = poidsExpedition; }

    public String getDimensionsExpedition() { return dimensionsExpedition; }
    public void setDimensionsExpedition(String dimensionsExpedition) { this.dimensionsExpedition = dimensionsExpedition; }

    public String getMetaTitre() { return metaTitre; }
    public void setMetaTitre(String metaTitre) { this.metaTitre = metaTitre; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getMetaMotsCles() { return metaMotsCles; }
    public void setMetaMotsCles(String metaMotsCles) { this.metaMotsCles = metaMotsCles; }

    public Boolean getEnVedette() { return enVedette; }
    public void setEnVedette(Boolean enVedette) { this.enVedette = enVedette; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }
}