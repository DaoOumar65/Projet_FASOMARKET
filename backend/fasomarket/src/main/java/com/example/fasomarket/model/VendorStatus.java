package com.example.fasomarket.model;

public enum VendorStatus {
    EN_ATTENTE_VALIDATION,  // Après inscription
    COMPTE_VALIDE,          // Validé par admin
    SUSPENDU,               // Compte suspendu
    REFUSE                  // Refusé par admin
}