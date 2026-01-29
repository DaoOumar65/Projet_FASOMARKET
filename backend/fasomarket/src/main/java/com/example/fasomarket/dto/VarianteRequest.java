package com.example.fasomarket.dto;

import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

public class VarianteRequest {
    private String couleur;
    private String taille;
    private String modele;
    private BigDecimal poids;
    private String dimensions;
    private String materiau;
    private String finition;
    private String capacite;
    private String puissance;
    private String parfum;
    private String ageCible;
    private String genre;
    private String saison;
    
    private BigDecimal prixAjustement = BigDecimal.ZERO;
    
    @Min(value = 0, message = "Le stock ne peut pas être négatif")
    private Integer stock = 0;
    
    private String sku;

    // Constructeurs
    public VarianteRequest() {}

    // Getters et Setters
    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }

    public String getTaille() { return taille; }
    public void setTaille(String taille) { this.taille = taille; }

    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }

    public BigDecimal getPoids() { return poids; }
    public void setPoids(BigDecimal poids) { this.poids = poids; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public String getMateriau() { return materiau; }
    public void setMateriau(String materiau) { this.materiau = materiau; }

    public String getFinition() { return finition; }
    public void setFinition(String finition) { this.finition = finition; }

    public String getCapacite() { return capacite; }
    public void setCapacite(String capacite) { this.capacite = capacite; }

    public String getPuissance() { return puissance; }
    public void setPuissance(String puissance) { this.puissance = puissance; }

    public String getParfum() { return parfum; }
    public void setParfum(String parfum) { this.parfum = parfum; }

    public String getAgeCible() { return ageCible; }
    public void setAgeCible(String ageCible) { this.ageCible = ageCible; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getSaison() { return saison; }
    public void setSaison(String saison) { this.saison = saison; }

    public BigDecimal getPrixAjustement() { return prixAjustement; }
    public void setPrixAjustement(BigDecimal prixAjustement) { this.prixAjustement = prixAjustement; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
}