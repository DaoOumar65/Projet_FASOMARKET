package com.example.fasomarket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.util.UUID;

public class AjouterPanierRequest {
    @NotNull(message = "L'ID du produit est obligatoire")
    private UUID produitId;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantite;

    public AjouterPanierRequest() {}

    public UUID getProduitId() { return produitId; }
    public void setProduitId(UUID produitId) { this.produitId = produitId; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }
}