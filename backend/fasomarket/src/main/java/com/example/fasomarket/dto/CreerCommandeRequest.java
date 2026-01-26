package com.example.fasomarket.dto;

public class CreerCommandeRequest {
    private String adresseLivraison;
    private Boolean needsDelivery;
    private String numeroTelephone;

    public CreerCommandeRequest() {}

    public String getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(String adresseLivraison) { this.adresseLivraison = adresseLivraison; }

    public Boolean getNeedsDelivery() { return needsDelivery; }
    public void setNeedsDelivery(Boolean needsDelivery) { this.needsDelivery = needsDelivery; }

    public String getNumeroTelephone() { return numeroTelephone; }
    public void setNumeroTelephone(String numeroTelephone) { this.numeroTelephone = numeroTelephone; }
}