package com.example.fasomarket.dto;

import java.util.List;

public class RechercheGlobaleResponse {
    private List<BoutiqueResponse> boutiques;
    private List<ProduitResponse> produits;
    private int totalBoutiques;
    private int totalProduits;

    // Constructeurs
    public RechercheGlobaleResponse() {}

    // Getters et Setters
    public List<BoutiqueResponse> getBoutiques() { return boutiques; }
    public void setBoutiques(List<BoutiqueResponse> boutiques) { 
        this.boutiques = boutiques;
        this.totalBoutiques = boutiques != null ? boutiques.size() : 0;
    }

    public List<ProduitResponse> getProduits() { return produits; }
    public void setProduits(List<ProduitResponse> produits) { 
        this.produits = produits;
        this.totalProduits = produits != null ? produits.size() : 0;
    }

    public int getTotalBoutiques() { return totalBoutiques; }
    public void setTotalBoutiques(int totalBoutiques) { this.totalBoutiques = totalBoutiques; }

    public int getTotalProduits() { return totalProduits; }
    public void setTotalProduits(int totalProduits) { this.totalProduits = totalProduits; }
}