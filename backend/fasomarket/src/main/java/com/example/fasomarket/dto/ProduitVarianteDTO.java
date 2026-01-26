package com.example.fasomarket.dto;

import java.math.BigDecimal;

public class ProduitVarianteDTO {
    private String id;
    private String produitId;
    private String couleur;
    private String taille;
    private String modele;
    private BigDecimal prixAjustement;
    private Integer stock;
    private String sku;

    // Constructeurs
    public ProduitVarianteDTO() {}

    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProduitId() { return produitId; }
    public void setProduitId(String produitId) { this.produitId = produitId; }

    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }

    public String getTaille() { return taille; }
    public void setTaille(String taille) { this.taille = taille; }

    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }

    public BigDecimal getPrixAjustement() { return prixAjustement; }
    public void setPrixAjustement(BigDecimal prixAjustement) { this.prixAjustement = prixAjustement; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
}