package com.example.fasomarket.dto;

import java.util.List;

public class VendeurAnalyticsResponse {
    private int totalCommandes;
    private double revenuTotal;
    private List<ProduitResponse> produitsPlusVendus;

    // Getters et Setters
    public int getTotalCommandes() { return totalCommandes; }
    public void setTotalCommandes(int totalCommandes) { this.totalCommandes = totalCommandes; }

    public double getRevenuTotal() { return revenuTotal; }
    public void setRevenuTotal(double revenuTotal) { this.revenuTotal = revenuTotal; }

    public List<ProduitResponse> getProduitsPlusVendus() { return produitsPlusVendus; }
    public void setProduitsPlusVendus(List<ProduitResponse> produitsPlusVendus) { this.produitsPlusVendus = produitsPlusVendus; }
}