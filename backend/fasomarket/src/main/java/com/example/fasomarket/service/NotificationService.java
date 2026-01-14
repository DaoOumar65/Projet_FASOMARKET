package com.example.fasomarket.service;

import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void creerNotification(User user, String title, String message, String type, UUID referenceId) {
        Notification notification = new Notification(user, title, message, type, referenceId);
        notificationRepository.save(notification);
    }

    @Transactional
    public void creerNotification(UUID userId, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Notification notification = new Notification(user, title, message, "INFO", null);
        notificationRepository.save(notification);
    }

    public List<Notification> obtenirNotifications(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> obtenirNotificationsNonLues(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    public long compterNotificationsNonLues(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void marquerCommeLue(UUID userId, UUID notificationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void marquerToutesCommeLues(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    // Notifications métier
    public void notifierNouvelleCommande(UUID vendeurId, String numeroCommande, UUID commandeId) {
        creerNotification(vendeurId, "Nouvelle commande", 
            "Vous avez reçu une nouvelle commande #" + numeroCommande, 
            "ORDER", commandeId);
    }

    public void notifierCommandeConfirmee(UUID clientId, String numeroCommande, UUID commandeId) {
        creerNotification(clientId, "Commande confirmée", 
            "Votre commande #" + numeroCommande + " a été confirmée", 
            "ORDER", commandeId);
    }

    public void notifierCommandeExpediee(UUID clientId, String numeroCommande, UUID commandeId) {
        creerNotification(clientId, "Commande expédiée", 
            "Votre commande #" + numeroCommande + " a été expédiée", 
            "DELIVERY", commandeId);
    }

    public void notifierCommandeLivree(UUID clientId, String numeroCommande, UUID commandeId) {
        creerNotification(clientId, "Commande livrée", 
            "Votre commande #" + numeroCommande + " a été livrée", 
            "DELIVERY", commandeId);
    }

    public void notifierStockFaible(UUID vendeurId, String nomProduit, int stock, UUID produitId) {
        creerNotification(vendeurId, "Stock faible", 
            "Le stock de \"" + nomProduit + "\" est faible (" + stock + " restants)", 
            "SYSTEM", produitId);
    }

    private void creerNotification(UUID userId, String title, String message, String type, UUID referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Notification notification = new Notification(user, title, message, type, referenceId);
        notificationRepository.save(notification);
    }
}