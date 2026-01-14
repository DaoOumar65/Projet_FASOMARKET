package com.example.fasomarket.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ClientProfilResponse {
    private UUID id;
    private String nomComplet;
    private String telephone;
    private String email;
    private LocalDateTime dateInscription;
    private Boolean estVerifie;

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getDateInscription() { return dateInscription; }
    public void setDateInscription(LocalDateTime dateInscription) { this.dateInscription = dateInscription; }

    public Boolean getEstVerifie() { return estVerifie; }
    public void setEstVerifie(Boolean estVerifie) { this.estVerifie = estVerifie; }
}

class HistoriqueCommandesResponse {
    private List<CommandeResponse> commandes;
    private int total;
    private int page;
    private int size;

    // Getters et Setters
    public List<CommandeResponse> getCommandes() { return commandes; }
    public void setCommandes(List<CommandeResponse> commandes) { this.commandes = commandes; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}

class ClientStats {
    private int nombreCommandes;
    private int articlesPanier;
    private int notificationsNonLues;

    // Getters et Setters
    public int getNombreCommandes() { return nombreCommandes; }
    public void setNombreCommandes(int nombreCommandes) { this.nombreCommandes = nombreCommandes; }

    public int getArticlesPanier() { return articlesPanier; }
    public void setArticlesPanier(int articlesPanier) { this.articlesPanier = articlesPanier; }

    public int getNotificationsNonLues() { return notificationsNonLues; }
    public void setNotificationsNonLues(int notificationsNonLues) { this.notificationsNonLues = notificationsNonLues; }
}