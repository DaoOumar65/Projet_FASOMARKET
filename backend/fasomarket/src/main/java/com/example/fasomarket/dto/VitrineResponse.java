package com.example.fasomarket.dto;

import java.util.List;

public class VitrineResponse {
    private CategorieResponse categorie;
    private List<BoutiqueResponse> boutiques;
    private List<ProduitResponse> produits;

    // Constructeurs
    public VitrineResponse() {}

    // Getters et Setters
    public CategorieResponse getCategorie() { return categorie; }
    public void setCategorie(CategorieResponse categorie) { this.categorie = categorie; }

    public List<BoutiqueResponse> getBoutiques() { return boutiques; }
    public void setBoutiques(List<BoutiqueResponse> boutiques) { this.boutiques = boutiques; }

    public List<ProduitResponse> getProduits() { return produits; }
    public void setProduits(List<ProduitResponse> produits) { this.produits = produits; }
}