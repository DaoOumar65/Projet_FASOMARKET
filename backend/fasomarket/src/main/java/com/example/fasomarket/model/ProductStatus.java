package com.example.fasomarket.model;

public enum ProductStatus {
    ACTIVE,     // Produit actif et visible
    HIDDEN,     // Produit masqué par l'admin
    PENDING,    // En attente de validation
    REJECTED    // Rejeté par l'admin
}