package com.example.fasomarket.service;

import com.example.fasomarket.dto.PaymentRequest;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PayDunyaService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private OrderNotificationService orderNotificationService;

    @Value("${payment.paydunya.master-key:test-master-key}")
    private String paydunyaMasterKey;

    @Value("${payment.paydunya.private-key:test-private-key}")
    private String paydunyaPrivateKey;

    @Value("${payment.paydunya.token:test-token}")
    private String paydunyaToken;

    @Value("${payment.paydunya.mode:test}")
    private String paymentMode;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> initierPaiementPayDunya(PaymentRequest request) {
        try {
            Order order = orderRepository.findById(UUID.fromString(request.getCommandeId()))
                    .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

            if ("test".equals(paymentMode)) {
                return simulerPaiementTest(request, order);
            }

            // Configuration PayDunya réelle
            String apiUrl = "https://app.paydunya.com/api/v1/checkout-invoice/create";

            Map<String, Object> paydunyaRequest = construireRequetePayDunya(request, order);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("PAYDUNYA-MASTER-KEY", paydunyaMasterKey);
            headers.set("PAYDUNYA-PRIVATE-KEY", paydunyaPrivateKey);
            headers.set("PAYDUNYA-TOKEN", paydunyaToken);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(paydunyaRequest, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                return traiterReponsePayDunya(responseBody, request, order);
            } else {
                throw new RuntimeException("Erreur PayDunya: " + response.getBody());
            }

        } catch (Exception e) {
            throw new RuntimeException("Erreur initialisation paiement: " + e.getMessage());
        }
    }

    private Map<String, Object> construireRequetePayDunya(PaymentRequest request, Order order) {
        Map<String, Object> paydunyaRequest = new HashMap<>();

        // Store info
        Map<String, String> store = new HashMap<>();
        store.put("name", "FasoMarket");
        store.put("tagline", "Marketplace burkinabé");
        store.put("phone", "+22670000000");
        store.put("postal_address", "Ouagadougou, Burkina Faso");
        store.put("website_url", "http://localhost:5173");
        store.put("logo_url", "http://localhost:8081/logo.png");
        paydunyaRequest.put("store", store);

        // Invoice info
        Map<String, Object> invoice = new HashMap<>();
        invoice.put("total_amount", request.getMontant());
        invoice.put("description", "Commande FasoMarket #" + request.getCommandeId().substring(0, 8));
        paydunyaRequest.put("invoice", invoice);

        // Actions URLs
        Map<String, String> actions = new HashMap<>();
        actions.put("cancel_url", "http://localhost:5173/paiement/annule");
        actions.put("return_url", "http://localhost:5173/paiement/succes");
        actions.put("callback_url", "http://localhost:8081/api/paiements/webhook");
        paydunyaRequest.put("actions", actions);

        // Custom data
        Map<String, String> customData = new HashMap<>();
        customData.put("order_id", request.getCommandeId());
        customData.put("user_id", request.getUserId());
        paydunyaRequest.put("custom_data", customData);

        return paydunyaRequest;
    }

    private Map<String, Object> traiterReponsePayDunya(Map<String, Object> responseBody, PaymentRequest request,
            Order order) {
        // Créer enregistrement paiement
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(request.getMontant());
        payment.setPaymentMethod(request.getModePaiement());
        payment.setTransactionId((String) responseBody.get("token"));
        payment.setStatus(PaymentStatus.PENDING);

        paymentRepository.save(payment);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("paymentUrl", responseBody.get("response_text"));
        result.put("transactionId", responseBody.get("token"));
        result.put("commandeId", request.getCommandeId());

        return result;
    }

    private Map<String, Object> simulerPaiementTest(PaymentRequest request, Order order) {
        String transactionId = "test_paydunya_" + System.currentTimeMillis();

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(request.getMontant());
        payment.setPaymentMethod(request.getModePaiement());
        payment.setTransactionId(transactionId);
        payment.setStatus(PaymentStatus.PENDING);

        paymentRepository.save(payment);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("paymentUrl", "http://localhost:5173/paiement/test-paydunya?token=" + transactionId);
        result.put("transactionId", transactionId);
        result.put("commandeId", request.getCommandeId());
        result.put("mode", "test");
        result.put("provider", "PayDunya");

        return result;
    }

    @Transactional
    public void traiterWebhookPayDunya(Map<String, Object> webhookData) {
        try {
            String status = (String) webhookData.get("status");
            String transactionId = (String) webhookData.get("invoice_token");

            Payment payment = paymentRepository.findByTransactionId(transactionId)
                    .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));

            if ("completed".equals(status)) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setPaymentDate(LocalDateTime.now());
                payment.getOrder().setStatus(OrderStatus.PAID);

                // Générer facture
                invoiceService.genererFacture(payment.getOrder(), payment);

                // Notification
                orderNotificationService.notifierPaiementReussi(payment.getOrder(), payment);

            } else if ("cancelled".equals(status) || "failed".equals(status)) {
                payment.setStatus(PaymentStatus.FAILED);
            }

            paymentRepository.save(payment);
            orderRepository.save(payment.getOrder());

        } catch (Exception e) {
            throw new RuntimeException("Erreur traitement webhook PayDunya: " + e.getMessage());
        }
    }

    public Map<String, Object> verifierStatutPayDunya(String transactionId) {
        try {
            Payment payment = paymentRepository.findByTransactionId(transactionId)
                    .orElseThrow(() -> new RuntimeException("Transaction non trouvée"));

            Map<String, Object> result = new HashMap<>();
            result.put("transactionId", transactionId);
            result.put("status", payment.getStatus().name());
            result.put("montant", payment.getAmount());
            result.put("commandeId", payment.getOrder().getId());
            result.put("dateCreation", payment.getCreatedAt());
            result.put("provider", "PayDunya");

            return result;
        } catch (Exception e) {
            throw new RuntimeException("Erreur vérification statut PayDunya: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> obtenirPaiementsUtilisateur(UUID userId) {
        List<Payment> payments = paymentRepository.findByOrderClientIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Payment payment : payments) {
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("id", payment.getId());
            paymentData.put("transactionId", payment.getTransactionId());
            paymentData.put("montant", payment.getAmount());
            paymentData.put("status", payment.getStatus().name());
            paymentData.put("modePaiement", payment.getPaymentMethod());
            paymentData.put("dateCreation", payment.getCreatedAt());
            paymentData.put("commandeId", payment.getOrder().getId());
            result.add(paymentData);
        }

        return result;
    }
}