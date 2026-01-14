package com.example.fasomarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class PayerCommandeRequest {
    @NotNull(message = "L'ID de la commande est obligatoire")
    private UUID commandeId;

    @NotBlank(message = "La méthode de paiement est obligatoire")
    private String methodePaiement; // MOBILE_MONEY, CARD, CASH

    private String numeroTelephone; // Pour mobile money
    private String numeroCompte; // Pour autres méthodes

    public PayerCommandeRequest() {}

    public UUID getCommandeId() { return commandeId; }
    public void setCommandeId(UUID commandeId) { this.commandeId = commandeId; }

    public String getMethodePaiement() { return methodePaiement; }
    public void setMethodePaiement(String methodePaiement) { this.methodePaiement = methodePaiement; }

    public String getNumeroTelephone() { return numeroTelephone; }
    public void setNumeroTelephone(String numeroTelephone) { this.numeroTelephone = numeroTelephone; }

    public String getNumeroCompte() { return numeroCompte; }
    public void setNumeroCompte(String numeroCompte) { this.numeroCompte = numeroCompte; }
}