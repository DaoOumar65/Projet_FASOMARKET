package com.example.fasomarket.dto;

import java.math.BigDecimal;

public class PaymentRequest {
    private String commandeId;
    private String userId;
    private BigDecimal montant;
    private String modePaiement; // ORANGE_MONEY, MOOV_MONEY, CORIS_MONEY
    private String numeroTelephone;
    private String email;
    private String nomClient;
    private String description;

    public PaymentRequest() {}

    // Getters et Setters
    public String getCommandeId() { return commandeId; }
    public void setCommandeId(String commandeId) { this.commandeId = commandeId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal montant) { this.montant = montant; }

    public String getModePaiement() { return modePaiement; }
    public void setModePaiement(String modePaiement) { this.modePaiement = modePaiement; }

    public String getNumeroTelephone() { return numeroTelephone; }
    public void setNumeroTelephone(String numeroTelephone) { this.numeroTelephone = numeroTelephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNomClient() { return nomClient; }
    public void setNomClient(String nomClient) { this.nomClient = nomClient; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}