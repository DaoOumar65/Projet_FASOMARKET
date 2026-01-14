package com.example.fasomarket.dto;

import java.util.List;

public class GestionStockResponse {
    private List<ProduitResponse> produits;
    private List<ProduitResponse> produitsEnRupture;
    private List<ProduitResponse> produitsStockFaible;

    // Getters et Setters
    public List<ProduitResponse> getProduits() { return produits; }
    public void setProduits(List<ProduitResponse> produits) { this.produits = produits; }

    public List<ProduitResponse> getProduitsEnRupture() { return produitsEnRupture; }
    public void setProduitsEnRupture(List<ProduitResponse> produitsEnRupture) { this.produitsEnRupture = produitsEnRupture; }

    public List<ProduitResponse> getProduitsStockFaible() { return produitsStockFaible; }
    public void setProduitsStockFaible(List<ProduitResponse> produitsStockFaible) { this.produitsStockFaible = produitsStockFaible; }
}