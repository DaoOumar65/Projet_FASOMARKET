package com.example.fasomarket.dto;

import com.example.fasomarket.model.*;
import java.util.List;

public class AdminDashboardResponse {
    private AdminStats statistiques;
    private List<Vendor> vendeursEnAttente;
    private List<Order> commandesRecentes;

    // Constructeurs
    public AdminDashboardResponse() {}

    // Getters et Setters
    public AdminStats getStatistiques() { return statistiques; }
    public void setStatistiques(AdminStats statistiques) { this.statistiques = statistiques; }

    public List<Vendor> getVendeursEnAttente() { return vendeursEnAttente; }
    public void setVendeursEnAttente(List<Vendor> vendeursEnAttente) { this.vendeursEnAttente = vendeursEnAttente; }

    public List<Order> getCommandesRecentes() { return commandesRecentes; }
    public void setCommandesRecentes(List<Order> commandesRecentes) { this.commandesRecentes = commandesRecentes; }
}

class AdminStats {
    private long totalUtilisateurs;
    private long totalClients;
    private long totalVendeurs;
    private long totalBoutiques;
    private long totalProduits;
    private long totalCommandes;
    private long totalCategories;
    private long vendeursEnAttente;

    // Getters et Setters
    public long getTotalUtilisateurs() { return totalUtilisateurs; }
    public void setTotalUtilisateurs(long totalUtilisateurs) { this.totalUtilisateurs = totalUtilisateurs; }

    public long getTotalClients() { return totalClients; }
    public void setTotalClients(long totalClients) { this.totalClients = totalClients; }

    public long getTotalVendeurs() { return totalVendeurs; }
    public void setTotalVendeurs(long totalVendeurs) { this.totalVendeurs = totalVendeurs; }

    public long getTotalBoutiques() { return totalBoutiques; }
    public void setTotalBoutiques(long totalBoutiques) { this.totalBoutiques = totalBoutiques; }

    public long getTotalProduits() { return totalProduits; }
    public void setTotalProduits(long totalProduits) { this.totalProduits = totalProduits; }

    public long getTotalCommandes() { return totalCommandes; }
    public void setTotalCommandes(long totalCommandes) { this.totalCommandes = totalCommandes; }

    public long getTotalCategories() { return totalCategories; }
    public void setTotalCategories(long totalCategories) { this.totalCategories = totalCategories; }

    public long getVendeursEnAttente() { return vendeursEnAttente; }
    public void setVendeursEnAttente(long vendeursEnAttente) { this.vendeursEnAttente = vendeursEnAttente; }
}

class GestionUtilisateursResponse {
    private List<User> utilisateurs;
    private int total;
    private int page;
    private int size;

    // Getters et Setters
    public List<User> getUtilisateurs() { return utilisateurs; }
    public void setUtilisateurs(List<User> utilisateurs) { this.utilisateurs = utilisateurs; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}

class ValidationsResponse {
    private List<Vendor> vendeursEnAttente;
    private List<Shop> boutiquesEnAttente;

    // Getters et Setters
    public List<Vendor> getVendeursEnAttente() { return vendeursEnAttente; }
    public void setVendeursEnAttente(List<Vendor> vendeursEnAttente) { this.vendeursEnAttente = vendeursEnAttente; }

    public List<Shop> getBoutiquesEnAttente() { return boutiquesEnAttente; }
    public void setBoutiquesEnAttente(List<Shop> boutiquesEnAttente) { this.boutiquesEnAttente = boutiquesEnAttente; }
}