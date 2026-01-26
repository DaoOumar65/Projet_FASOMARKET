package com.example.fasomarket.service;

import org.springframework.stereotype.Service;

@Service
public class PaiementService {
    
    public String initierPaiement(String commandeId, String userId) {
        // Logique de paiement FedaPay ici
        return "https://checkout.fedapay.com/test-payment-url";
    }
}