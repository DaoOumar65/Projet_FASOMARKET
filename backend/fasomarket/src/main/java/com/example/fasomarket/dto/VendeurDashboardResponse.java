package com.example.fasomarket.dto;

import java.util.List;

public class VendeurDashboardResponse {
    private List<BoutiqueResponse> boutiques;
    private List<ProduitResponse> produitsRecents;
    private List<CommandeResponse> commandesRecentes;
    private List<NotificationResponse> notificationsNonLues;
    private VendeurStats statistiques;

    // Constructeurs
    public VendeurDashboardResponse() {}

    // Getters et Setters
    public List<BoutiqueResponse> getBoutiques() { return boutiques; }
    public void setBoutiques(List<BoutiqueResponse> boutiques) { this.boutiques = boutiques; }

    public List<ProduitResponse> getProduitsRecents() { return produitsRecents; }
    public void setProduitsRecents(List<ProduitResponse> produitsRecents) { this.produitsRecents = produitsRecents; }

    public List<CommandeResponse> getCommandesRecentes() { return commandesRecentes; }
    public void setCommandesRecentes(List<CommandeResponse> commandesRecentes) { this.commandesRecentes = commandesRecentes; }

    public List<NotificationResponse> getNotificationsNonLues() { return notificationsNonLues; }
    public void setNotificationsNonLues(List<NotificationResponse> notificationsNonLues) { this.notificationsNonLues = notificationsNonLues; }

    public VendeurStats getStatistiques() { return statistiques; }
    public void setStatistiques(VendeurStats statistiques) { this.statistiques = statistiques; }
}