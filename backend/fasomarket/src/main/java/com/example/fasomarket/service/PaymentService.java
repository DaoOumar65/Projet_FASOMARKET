package com.example.fasomarket.service;

import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private OrderNotificationService orderNotificationService;

    @Value("${payment.test.public-key}")
    private String testPublicKey;

    @Value("${payment.test.private-key}")
    private String testPrivateKey;

    @Value("${payment.test.token}")
    private String testToken;

    @Value("${payment.enabled:true}")
    private boolean paymentEnabled;

    private final String paymentMode = "test"; // Forcé en mode test

    @Value("${payment.success.url}")
    private String successUrl;

    @Value("${payment.cancel.url}")
    private String cancelUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String FEDAPAY_API_URL = "https://sandbox-api.fedapay.com/v1";

    @Transactional
    public Map<String, Object> initierPaiement(UUID commandeId, UUID clientId) {
        if (!paymentEnabled) {
            throw new RuntimeException("Les paiements sont temporairement désactivés");
        }

        Order order = orderRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if (!order.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Non autorisé");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Cette commande ne peut pas être payée");
        }

        // MODE TEST UNIQUEMENT - Créer transaction FedaPay
        Map<String, Object> transactionData = new HashMap<>();
        transactionData.put("description", "[TEST] Commande FasoMarket #" + order.getId().toString().substring(0, 8));
        transactionData.put("amount", order.getTotalAmount().multiply(new BigDecimal("100")).intValue());
        transactionData.put("currency", Map.of("iso", "XOF"));
        transactionData.put("callback_url", successUrl + "?order=" + order.getId());
        transactionData.put("cancel_url", cancelUrl + "?order=" + order.getId());

        // Informations client
        Map<String, Object> customer = new HashMap<>();
        customer.put("firstname", order.getClient().getFullName().split(" ")[0]);
        customer.put("lastname", order.getClient().getFullName().contains(" ") ? 
            order.getClient().getFullName().substring(order.getClient().getFullName().indexOf(" ") + 1) : "");
        customer.put("email", order.getClient().getEmail());
        customer.put("phone_number", Map.of("number", order.getClient().getPhone(), "country", "bj"));
        transactionData.put("customer", customer);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(testPrivateKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(transactionData, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                FEDAPAY_API_URL + "/transactions", request, Map.class);

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("token")) {
                // Créer enregistrement paiement
                Payment payment = new Payment();
                payment.setOrder(order);
                payment.setAmount(order.getTotalAmount());
                payment.setPaymentMethod("FEDAPAY");
                payment.setTransactionId(responseBody.get("token").toString());
                payment.setStatus(PaymentStatus.PENDING);
                paymentRepository.save(payment);

                return Map.of(
                    "success", true,
                    "paymentUrl", "https://checkout.fedapay.com/" + responseBody.get("token"),
                    "transactionId", responseBody.get("token")
                );
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'initialisation du paiement: " + e.getMessage());
        }

        throw new RuntimeException("Erreur lors de la création de la transaction");
    }

    @Transactional
    public void confirmerPaiement(String transactionId, Map<String, Object> ipnData) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));

        String status = ipnData.get("status").toString();
        
        if ("approved".equals(status)) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaymentDate(LocalDateTime.now());
            
            Order order = payment.getOrder();
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);

            // Générer facture
            invoiceService.genererFacture(order, payment);

            // Notification paiement confirmé
            orderNotificationService.notifierPaiementConfirme(order);

        } else if ("declined".equals(status)) {
            payment.setStatus(PaymentStatus.FAILED);
            
            notificationService.creerNotification(
                payment.getOrder().getClient().getId(),
                "Paiement échoué",
                "Votre paiement a échoué. Veuillez réessayer."
            );
        }

        paymentRepository.save(payment);
    }

    public List<Payment> obtenirPaiementsClient(UUID clientId) {
        return paymentRepository.findByOrderClientIdOrderByCreatedAtDesc(clientId);
    }
}