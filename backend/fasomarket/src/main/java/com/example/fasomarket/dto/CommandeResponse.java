package com.example.fasomarket.dto;

import com.example.fasomarket.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CommandeResponse {
    private UUID id;
    private String numeroCommande;
    private OrderStatus statut;
    private BigDecimal totalAmount;
    private LocalDateTime dateCommande;
    private String adresseLivraison;
    private Boolean needsDelivery;
    private String telephoneLivraison;
    private String nomClient;
    private List<Object> articles;

    public CommandeResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNumeroCommande() { return numeroCommande; }
    public void setNumeroCommande(String numeroCommande) { this.numeroCommande = numeroCommande; }

    public OrderStatus getStatut() { return statut; }
    public void setStatut(OrderStatus statut) { this.statut = statut; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getDateCommande() { return dateCommande; }
    public void setDateCommande(LocalDateTime dateCommande) { this.dateCommande = dateCommande; }

    public String getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(String adresseLivraison) { this.adresseLivraison = adresseLivraison; }

    public Boolean getNeedsDelivery() { return needsDelivery; }
    public void setNeedsDelivery(Boolean needsDelivery) { this.needsDelivery = needsDelivery; }

    public String getTelephoneLivraison() { return telephoneLivraison; }
    public void setTelephoneLivraison(String telephoneLivraison) { this.telephoneLivraison = telephoneLivraison; }

    // Alias methods for VendeurController compatibility
    public BigDecimal getMontantTotal() { return totalAmount; }
    public LocalDateTime getDateCreation() { return dateCommande; }
    public String getNomClient() { return nomClient; }
    public void setNomClient(String nomClient) { this.nomClient = nomClient; }
    public List<Object> getArticles() { return articles; }
    public void setArticles(List<Object> articles) { this.articles = articles; }
}