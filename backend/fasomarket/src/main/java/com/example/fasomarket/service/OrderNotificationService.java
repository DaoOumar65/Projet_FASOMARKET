package com.example.fasomarket.service;

import com.example.fasomarket.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OrderNotificationService {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Value("${notifications.order.enabled:true}")
    private boolean orderNotificationsEnabled;

    @Value("${notifications.email.enabled:true}")
    private boolean emailNotificationsEnabled;

    public void notifierCreationCommande(Order order) {
        if (!orderNotificationsEnabled) return;

        String orderNumber = "#" + order.getId().toString().substring(0, 8);
        
        // Notification client
        notificationService.creerNotification(
            order.getClient().getId(),
            "🛒 Commande créée",
            "Votre commande " + orderNumber + " a été créée avec succès. Montant: " + order.getTotalAmount() + " FCFA"
        );

        // Email client
        if (emailNotificationsEnabled && order.getClient().getEmail() != null) {
            try {
                emailService.envoyerNotificationCommande(
                    order.getClient().getEmail(),
                    order.getClient().getFullName(),
                    "Commande créée",
                    "Votre commande " + orderNumber + " a été créée. Procédez au paiement pour confirmer votre commande."
                );
            } catch (Exception e) {
                System.err.println("Erreur envoi email création commande: " + e.getMessage());
            }
        }
    }

    public void notifierPaiementConfirme(Order order) {
        if (!orderNotificationsEnabled) return;

        String orderNumber = "#" + order.getId().toString().substring(0, 8);
        
        // Notification client
        notificationService.creerNotification(
            order.getClient().getId(),
            "💳 Paiement confirmé",
            "Le paiement de votre commande " + orderNumber + " a été confirmé. Votre commande est en cours de traitement."
        );

        // Email client
        if (emailNotificationsEnabled && order.getClient().getEmail() != null) {
            try {
                emailService.envoyerNotificationCommande(
                    order.getClient().getEmail(),
                    order.getClient().getFullName(),
                    "Paiement confirmé",
                    "Votre paiement pour la commande " + orderNumber + " a été confirmé. Nous préparons votre commande."
                );
            } catch (Exception e) {
                System.err.println("Erreur envoi email paiement confirmé: " + e.getMessage());
            }
        }
    }

    public void notifierCommandeConfirmee(Order order) {
        if (!orderNotificationsEnabled) return;

        String orderNumber = "#" + order.getId().toString().substring(0, 8);
        
        // Notification client
        notificationService.creerNotification(
            order.getClient().getId(),
            "✅ Commande confirmée",
            "Votre commande " + orderNumber + " a été confirmée par le vendeur et est en cours de préparation."
        );

        // Email client
        if (emailNotificationsEnabled && order.getClient().getEmail() != null) {
            try {
                emailService.envoyerNotificationCommande(
                    order.getClient().getEmail(),
                    order.getClient().getFullName(),
                    "Commande confirmée par le vendeur",
                    "Bonne nouvelle ! Votre commande " + orderNumber + " a été confirmée et est en cours de préparation."
                );
            } catch (Exception e) {
                System.err.println("Erreur envoi email commande confirmée: " + e.getMessage());
            }
        }
    }

    public void notifierCommandeExpediee(Order order) {
        if (!orderNotificationsEnabled) return;

        String orderNumber = "#" + order.getId().toString().substring(0, 8);
        
        // Notification client
        notificationService.creerNotification(
            order.getClient().getId(),
            "🚚 Commande expédiée",
            "Votre commande " + orderNumber + " a été expédiée et est en route vers vous !"
        );

        // Email client
        if (emailNotificationsEnabled && order.getClient().getEmail() != null) {
            try {
                emailService.envoyerNotificationCommande(
                    order.getClient().getEmail(),
                    order.getClient().getFullName(),
                    "Commande en route",
                    "Votre commande " + orderNumber + " a été expédiée ! Elle arrivera bientôt à l'adresse: " + order.getDeliveryAddress()
                );
            } catch (Exception e) {
                System.err.println("Erreur envoi email commande expédiée: " + e.getMessage());
            }
        }
    }

    public void notifierCommandeLivree(Order order) {
        if (!orderNotificationsEnabled) return;

        String orderNumber = "#" + order.getId().toString().substring(0, 8);
        
        // Notification client
        notificationService.creerNotification(
            order.getClient().getId(),
            "📦 Commande livrée",
            "Votre commande " + orderNumber + " a été livrée avec succès ! Merci pour votre achat."
        );

        // Email client
        if (emailNotificationsEnabled && order.getClient().getEmail() != null) {
            try {
                emailService.envoyerNotificationCommande(
                    order.getClient().getEmail(),
                    order.getClient().getFullName(),
                    "Commande livrée",
                    "Votre commande " + orderNumber + " a été livrée ! Nous espérons que vous êtes satisfait(e) de votre achat."
                );
            } catch (Exception e) {
                System.err.println("Erreur envoi email commande livrée: " + e.getMessage());
            }
        }
    }

    public void notifierCommandeAnnulee(Order order, String raison) {
        if (!orderNotificationsEnabled) return;

        String orderNumber = "#" + order.getId().toString().substring(0, 8);
        String message = "Votre commande " + orderNumber + " a été annulée.";
        if (raison != null && !raison.isEmpty()) {
            message += " Raison: " + raison;
        }
        
        // Notification client
        notificationService.creerNotification(
            order.getClient().getId(),
            "❌ Commande annulée",
            message
        );

        // Email client
        if (emailNotificationsEnabled && order.getClient().getEmail() != null) {
            try {
                emailService.envoyerNotificationCommande(
                    order.getClient().getEmail(),
                    order.getClient().getFullName(),
                    "Commande annulée",
                    message + " Si vous avez des questions, contactez-nous."
                );
            } catch (Exception e) {
                System.err.println("Erreur envoi email commande annulée: " + e.getMessage());
            }
        }
    }
    
    public void notifierChangementStatut(Order order, OrderStatus ancienStatut) {
        if (!orderNotificationsEnabled) return;
        
        switch (order.getStatus()) {
            case CONFIRMED:
                notifierCommandeConfirmee(order);
                break;
            case SHIPPED:
                notifierCommandeExpediee(order);
                break;
            case DELIVERED:
                notifierCommandeLivree(order);
                break;
            case CANCELLED:
                notifierCommandeAnnulee(order, null);
                break;
            case PAID:
                notifierPaiementConfirme(order);
                break;
            default:
                // Notification générique pour autres statuts
                String orderNumber = "#" + order.getId().toString().substring(0, 8);
                notificationService.creerNotification(
                    order.getClient().getId(),
                    "📋 Mise à jour commande",
                    "Le statut de votre commande " + orderNumber + " a été mis à jour: " + getStatusLabel(order.getStatus())
                );
                break;
        }
    }
    
    public void notifierPaiementReussi(Order order, Payment payment) {
        if (!orderNotificationsEnabled) return;
        
        String orderNumber = "#" + order.getId().toString().substring(0, 8);
        
        notificationService.creerNotification(
            order.getClient().getId(),
            "💰 Paiement réussi",
            "Votre paiement de " + payment.getAmount() + " FCFA pour la commande " + orderNumber + " a été traité avec succès."
        );
    }
    
    private String getStatusLabel(OrderStatus status) {
        switch (status) {
            case PENDING: return "En attente";
            case CONFIRMED: return "Confirmée";
            case PAID: return "Payée";
            case SHIPPED: return "Expédiée";
            case DELIVERED: return "Livrée";
            case CANCELLED: return "Annulée";
            default: return status.name();
        }
    }
}