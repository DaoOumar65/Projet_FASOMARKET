package com.example.fasomarket.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class EmailService {

    public void envoyerEmailApprobationVendeur(String email, String nomComplet, String motDePasseTemporaire) {
        // Simulation d'envoi d'email
        System.out.println("=== EMAIL APPROBATION VENDEUR ===");
        System.out.println("À: " + email);
        System.out.println(
                "Sujet: Votre compte vendeur FasoMarket a été approuvé. Vous pouvez vous connecter et creer une boutique!");
        System.out.println("Message:");
        System.out.println("Bonjour " + nomComplet + ",");
        System.out.println("Félicitations ! Votre compte vendeur a été approuvé par notre équipe.");
        System.out.println("Vous pouvez maintenant vous connecter avec vos identifiants:");
        System.out.println("- Téléphone: " + email);
        System.out.println("- Mot de passe temporaire: " + motDePasseTemporaire);
        System.out.println("IMPORTANT: Changez votre mot de passe lors de votre première connexion.");
        System.out.println("Vous pouvez maintenant créer vos boutiques et commencer à vendre !");
        System.out.println("=====================================");
    }

    public void envoyerEmailRejetVendeur(String email, String nomComplet, String raison) {
        System.out.println("=== EMAIL REJET VENDEUR ===");
        System.out.println("À: " + email);
        System.out.println("Sujet: Votre demande vendeur FasoMarket");
        System.out.println("Message:");
        System.out.println("Bonjour " + nomComplet + ",");
        System.out
                .println("Nous regrettons de vous informer que votre demande de compte vendeur n'a pas été approuvée.");
        System.out.println("Raison: " + (raison != null ? raison : "Documents incomplets ou non conformes"));
        System.out.println("Vous pouvez soumettre une nouvelle demande avec les documents requis.");
        System.out.println("===============================");
    }

    public void envoyerEmailApprobationBoutique(String email, String nomComplet, String nomBoutique) {
        System.out.println("=== EMAIL APPROBATION BOUTIQUE ===");
        System.out.println("À: " + email);
        System.out.println("Sujet: Votre boutique " + nomBoutique + " a été approuvée");
        System.out.println("Message:");
        System.out.println("Bonjour " + nomComplet + ",");
        System.out.println("Excellente nouvelle ! Votre boutique '" + nomBoutique + "' a été approuvée.");
        System.out.println("Elle est maintenant visible sur FasoMarket et vous pouvez commencer à vendre.");
        System.out.println("Ajoutez vos produits et commencez à recevoir des commandes !");
        System.out.println("===================================");
    }

    public void envoyerEmailRejetBoutique(String email, String nomComplet, String nomBoutique, String raison) {
        System.out.println("=== EMAIL REJET BOUTIQUE ===");
        System.out.println("À: " + email);
        System.out.println("Sujet: Votre boutique " + nomBoutique);
        System.out.println("Message:");
        System.out.println("Bonjour " + nomComplet + ",");
        System.out.println("Votre boutique '" + nomBoutique + "' n'a pas été approuvée.");
        System.out.println("Raison: " + (raison != null ? raison : "Informations incomplètes ou non conformes"));
        System.out.println("Modifiez les informations et soumettez à nouveau votre boutique.");
        System.out.println("===============================");
    }
}