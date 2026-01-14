package com.example.fasomarket.dto;

public class VendeurStats {
    private int nombreBoutiques;
    private int nombreProduits;
    private int commandesEnAttente;
    private int notificationsNonLues;

    public VendeurStats() {}

    // Getters et Setters
    public int getNombreBoutiques() { return nombreBoutiques; }
    public void setNombreBoutiques(int nombreBoutiques) { this.nombreBoutiques = nombreBoutiques; }

    public int getNombreProduits() { return nombreProduits; }
    public void setNombreProduits(int nombreProduits) { this.nombreProduits = nombreProduits; }

    public int getCommandesEnAttente() { return commandesEnAttente; }
    public void setCommandesEnAttente(int commandesEnAttente) { this.commandesEnAttente = commandesEnAttente; }

    public int getNotificationsNonLues() { return notificationsNonLues; }
    public void setNotificationsNonLues(int notificationsNonLues) { this.notificationsNonLues = notificationsNonLues; }
}