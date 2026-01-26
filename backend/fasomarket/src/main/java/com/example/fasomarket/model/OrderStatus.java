package com.example.fasomarket.model;

public enum OrderStatus {
    PENDING,     // En attente
    CONFIRMED,   // Confirmée
    SHIPPED,     // Expédiée
    DELIVERED,   // Livrée
    CANCELLED,   // Annulée
    RETURNED,    // Retournée
    PAID         // Payée (optionnel)
}