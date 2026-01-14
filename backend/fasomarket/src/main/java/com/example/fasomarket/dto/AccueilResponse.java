package com.example.fasomarket.dto;

import java.util.List;

public class AccueilResponse {
    private List<CategorieResponse> categories;
    private List<BoutiqueResponse> boutiquesPopulaires;
    private List<ProduitResponse> nouveauxProduits;

    // Constructeurs
    public AccueilResponse() {}

    // Getters et Setters
    public List<CategorieResponse> getCategories() { return categories; }
    public void setCategories(List<CategorieResponse> categories) { this.categories = categories; }

    public List<BoutiqueResponse> getBoutiquesPopulaires() { return boutiquesPopulaires; }
    public void setBoutiquesPopulaires(List<BoutiqueResponse> boutiquesPopulaires) { this.boutiquesPopulaires = boutiquesPopulaires; }

    public List<ProduitResponse> getNouveauxProduits() { return nouveauxProduits; }
    public void setNouveauxProduits(List<ProduitResponse> nouveauxProduits) { this.nouveauxProduits = nouveauxProduits; }
}