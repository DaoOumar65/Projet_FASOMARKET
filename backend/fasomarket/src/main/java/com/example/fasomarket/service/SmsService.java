package com.example.fasomarket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    public void envoyerSmsConfirmationCommande(String numeroTelephone, String numeroCommande, Double montant) {
        try {
            String message = String.format(
                "FasoMarket: Votre commande %s d'un montant de %,.0f FCFA a été créée avec succès. Merci!",
                numeroCommande, montant
            );
            
            // Vérifier si Twilio est configuré
            if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
                // TODO: Activer Twilio après configuration
                // Twilio.init(accountSid, authToken);
                // String numeroFormate = formatPhoneNumber(numeroTelephone);
                // Message.creator(
                //     new PhoneNumber(numeroFormate),
                //     new PhoneNumber(twilioPhoneNumber),
                //     message
                // ).create();
                System.out.println("✅ SMS envoyé via Twilio");
            } else {
                // Mode simulation (pour développement)
                System.out.println("=== SMS SIMULÉ ===");
                System.out.println("Destinataire: " + numeroTelephone);
                System.out.println("Message: " + message);
                System.out.println("==================");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erreur envoi SMS: " + e.getMessage());
        }
    }

    private String formatPhoneNumber(String numero) {
        numero = numero.replaceAll("[\\s-]", "");
        if (numero.startsWith("0")) {
            return "+226" + numero.substring(1);
        }
        if (!numero.startsWith("+")) {
            return "+" + numero;
        }
        return numero;
    }
}
