package com.example.fasomarket.dto;

import jakarta.validation.constraints.NotBlank;

public class CreerCommandeRequest {
    @NotBlank(message = "L'adresse de livraison est obligatoire")
    private String adresseLivraison;

    public CreerCommandeRequest() {}

    public String getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(String adresseLivraison) { this.adresseLivraison = adresseLivraison; }
}