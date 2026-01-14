package com.example.fasomarket.service;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public String payerCommande(UUID clientId, PayerCommandeRequest request) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Order order = orderRepository.findById(request.getCommandeId())
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if (!order.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Non autorisé à payer cette commande");
        }

        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new RuntimeException("Cette commande ne peut pas être payée");
        }

        // Créer le paiement
        Payment payment = new Payment(order, order.getTotalAmount(), request.getMethodePaiement());
        
        // Simuler le traitement du paiement
        boolean paymentSuccess = simulerPaiement(request);
        
        if (paymentSuccess) {
            payment.setStatus("SUCCESS");
            payment.setTransactionId("TXN_" + UUID.randomUUID().toString().substring(0, 8));
            payment.setProcessedAt(LocalDateTime.now());
            
            // Changer le statut de la commande
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
            
            // Créer la livraison
            Delivery delivery = new Delivery(order, order.getDeliveryAddress());
            delivery.setEstimatedDelivery(LocalDateTime.now().plusDays(2));
            deliveryRepository.save(delivery);
            
            // Notifier le client
            notificationService.creerNotification(
                client,
                "Paiement confirmé",
                "Votre paiement de " + order.getTotalAmount() + " FCFA a été confirmé",
                "PAYMENT",
                order.getId()
            );
            
            // Notifier les vendeurs
            order.getOrderItems().forEach(item -> {
                User vendor = item.getProduct().getShop().getVendor().getUser();
                notificationService.creerNotification(
                    vendor,
                    "Nouvelle commande payée",
                    "Commande #" + order.getId() + " payée - À confirmer",
                    "ORDER",
                    order.getId()
                );
            });
            
        } else {
            payment.setStatus("FAILED");
        }
        
        paymentRepository.save(payment);
        
        return paymentSuccess ? "Paiement réussi" : "Paiement échoué";
    }

    private boolean simulerPaiement(PayerCommandeRequest request) {
        // Simulation simple - toujours réussir sauf si numéro contient "fail"
        return request.getNumeroTelephone() == null || 
               !request.getNumeroTelephone().toLowerCase().contains("fail");
    }
}