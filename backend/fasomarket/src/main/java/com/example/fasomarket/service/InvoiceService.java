package com.example.fasomarket.service;

import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Invoice genererFacture(Order order, Payment payment) {
        // Vérifier si facture existe déjà
        if (invoiceRepository.existsByOrderId(order.getId())) {
            return invoiceRepository.findByOrderId(order.getId()).orElse(null);
        }

        Invoice invoice = new Invoice();
        invoice.setOrder(order);
        invoice.setPayment(payment);
        invoice.setInvoiceNumber(genererNumeroFacture());
        invoice.setAmount(order.getTotalAmount());
        invoice.setTaxAmount(calculerTVA(order.getTotalAmount()));
        invoice.setTotalAmount(order.getTotalAmount().add(invoice.getTaxAmount()));
        invoice.setStatus(InvoiceStatus.GENERATED);
        invoice.setGeneratedAt(LocalDateTime.now());

        invoice = invoiceRepository.save(invoice);

        // Générer PDF
        String pdfContent = genererPDFFacture(invoice);
        invoice.setPdfPath("invoices/" + invoice.getInvoiceNumber() + ".pdf");
        
        // Envoyer par email
        try {
            emailService.envoyerFacture(
                order.getClient().getEmail(),
                order.getClient().getFullName(),
                invoice.getInvoiceNumber(),
                pdfContent
            );
            invoice.setEmailSent(true);
        } catch (Exception e) {
            invoice.setEmailSent(false);
        }

        return invoiceRepository.save(invoice);
    }

    private String genererNumeroFacture() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "FAC-" + date + "-" + random;
    }

    private BigDecimal calculerTVA(BigDecimal montant) {
        // TVA 18% au Burkina Faso
        return montant.multiply(new BigDecimal("0.18"));
    }

    private String genererPDFFacture(Invoice invoice) {
        StringBuilder html = new StringBuilder();
        Order order = invoice.getOrder();
        
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 20px; }");
        html.append(".header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }");
        html.append(".info { display: flex; justify-content: space-between; margin: 20px 0; }");
        html.append(".items { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        html.append(".items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        html.append(".items th { background-color: #f2f2f2; }");
        html.append(".total { text-align: right; margin-top: 20px; }");
        html.append("</style></head><body>");

        // En-tête
        html.append("<div class='header'>");
        html.append("<h1>FACTURE</h1>");
        html.append("<h2>FasoMarket</h2>");
        html.append("<p>Plateforme de commerce électronique</p>");
        html.append("</div>");

        // Informations
        html.append("<div class='info'>");
        html.append("<div>");
        html.append("<h3>Facturé à:</h3>");
        html.append("<p>" + order.getClient().getFullName() + "</p>");
        html.append("<p>" + order.getClient().getPhone() + "</p>");
        html.append("<p>" + order.getDeliveryAddress() + "</p>");
        html.append("</div>");
        html.append("<div>");
        html.append("<p><strong>N° Facture:</strong> " + invoice.getInvoiceNumber() + "</p>");
        html.append("<p><strong>Date:</strong> " + invoice.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + "</p>");
        html.append("<p><strong>N° Commande:</strong> #" + order.getId().toString().substring(0, 8) + "</p>");
        html.append("</div>");
        html.append("</div>");

        // Articles
        html.append("<table class='items'>");
        html.append("<tr><th>Article</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr>");
        
        for (OrderItem item : order.getOrderItems()) {
            html.append("<tr>");
            html.append("<td>" + item.getProduct().getName() + "</td>");
            html.append("<td>" + item.getQuantity() + "</td>");
            html.append("<td>" + item.getUnitPrice() + " FCFA</td>");
            html.append("<td>" + item.getTotalPrice() + " FCFA</td>");
            html.append("</tr>");
        }
        html.append("</table>");

        // Totaux
        html.append("<div class='total'>");
        html.append("<p><strong>Sous-total:</strong> " + invoice.getAmount() + " FCFA</p>");
        html.append("<p><strong>TVA (18%):</strong> " + invoice.getTaxAmount() + " FCFA</p>");
        html.append("<p><strong>TOTAL:</strong> " + invoice.getTotalAmount() + " FCFA</p>");
        html.append("</div>");

        html.append("</body></html>");
        
        return html.toString();
    }

    public Invoice obtenirFactureCommande(UUID orderId) {
        return invoiceRepository.findByOrderId(orderId).orElse(null);
    }
}