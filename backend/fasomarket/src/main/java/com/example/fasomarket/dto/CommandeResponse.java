package com.example.fasomarket.dto;

import com.example.fasomarket.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CommandeResponse {
    private UUID id;
    private UUID clientId;
    private String nomClient;
    private OrderStatus statut;
    private BigDecimal montantTotal;
    private String adresseLivraison;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private List<CommandeItemResponse> articles;

    public CommandeResponse() {}

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }

    public String getNomClient() { return nomClient; }
    public void setNomClient(String nomClient) { this.nomClient = nomClient; }

    public OrderStatus getStatut() { return statut; }
    public void setStatut(OrderStatus statut) { this.statut = statut; }

    public BigDecimal getMontantTotal() { return montantTotal; }
    public void setMontantTotal(BigDecimal montantTotal) { this.montantTotal = montantTotal; }

    public String getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(String adresseLivraison) { this.adresseLivraison = adresseLivraison; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }

    public List<CommandeItemResponse> getArticles() { return articles; }
    public void setArticles(List<CommandeItemResponse> articles) { this.articles = articles; }
}