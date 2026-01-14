package com.example.fasomarket.model;

public enum ShopStatus {
    BROUILLON,                  // En cours de création
    EN_ATTENTE_APPROBATION,     // Soumise pour validation
    ACTIVE,                     // Approuvée et active
    REJETEE,                    // Rejetée par admin
    SUSPENDUE                   // Suspendue par admin
}