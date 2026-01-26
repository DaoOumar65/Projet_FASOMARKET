package com.example.fasomarket.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    public void envoyerEmailBienvenue(String destinataire, String nomUtilisateur) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destinataire);
        message.setSubject("Bienvenue sur FasoMarket !");
        message.setText(String.format(
            "Bonjour %s,\n\n" +
            "Bienvenue sur FasoMarket !\n\n" +
            "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et profiter de nos services.\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            nomUtilisateur
        ));
        
        mailSender.send(message);
    }

    public void envoyerEmailValidationVendeur(String destinataire, String nomVendeur) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destinataire);
        message.setSubject("Compte vendeur validé - FasoMarket");
        message.setText(String.format(
            "Bonjour %s,\n\n" +
            "Félicitations ! Votre compte vendeur a été validé par notre équipe.\n\n" +
            "Vous pouvez maintenant créer vos boutiques et commencer à vendre sur FasoMarket.\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            nomVendeur
        ));
        
        mailSender.send(message);
    }

    public void envoyerEmailRejetVendeur(String destinataire, String nomVendeur, String raison) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destinataire);
        message.setSubject("Demande vendeur rejetée - FasoMarket");
        message.setText(String.format(
            "Bonjour %s,\n\n" +
            "Nous regrettons de vous informer que votre demande de compte vendeur n'a pas été approuvée.\n\n" +
            "%s\n\n" +
            "Vous pouvez soumettre une nouvelle demande après avoir corrigé les points mentionnés.\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            nomVendeur,
            raison != null ? "Raison: " + raison : ""
        ));
        
        mailSender.send(message);
    }

    public void envoyerEmailApprobationBoutique(String destinataire, String nomVendeur, String nomBoutique) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destinataire);
        message.setSubject("Boutique approuvée - FasoMarket");
        message.setText(String.format(
            "Bonjour %s,\n\n" +
            "Félicitations ! Votre boutique '%s' a été approuvée et est maintenant active.\n\n" +
            "Vous pouvez commencer à ajouter vos produits et recevoir des commandes.\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            nomVendeur, nomBoutique
        ));
        
        mailSender.send(message);
    }

    public void envoyerEmailRejetBoutique(String destinataire, String nomVendeur, String nomBoutique, String raison) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destinataire);
        message.setSubject("Boutique rejetée - FasoMarket");
        message.setText(String.format(
            "Bonjour %s,\n\n" +
            "Nous regrettons de vous informer que votre boutique '%s' n'a pas été approuvée.\n\n" +
            "%s\n\n" +
            "Vous pouvez soumettre une nouvelle demande après avoir corrigé les points mentionnés.\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            nomVendeur, nomBoutique,
            raison != null ? "Raison: " + raison : ""
        ));
        
        mailSender.send(message);
    }

    public void envoyerEmailNouvelleCommande(String destinataire, String numeroCommande, double montant) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destinataire);
        message.setSubject("Nouvelle commande reçue - FasoMarket");
        message.setText(String.format(
            "Bonjour,\n\n" +
            "Vous avez reçu une nouvelle commande !\n\n" +
            "Numéro de commande : %s\n" +
            "Montant : %.0f FCFA\n\n" +
            "Connectez-vous à votre espace vendeur pour traiter cette commande.\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            numeroCommande, montant
        ));
        
        mailSender.send(message);
    }

    public void envoyerEmailStatutCommande(String destinataire, String numeroCommande, String nouveauStatut) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destinataire);
        message.setSubject("Mise à jour de votre commande - FasoMarket");
        message.setText(String.format(
            "Bonjour,\n\n" +
            "Le statut de votre commande a été mis à jour.\n\n" +
            "Numéro de commande : %s\n" +
            "Nouveau statut : %s\n\n" +
            "Vous pouvez suivre l'évolution de votre commande dans votre espace client.\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            numeroCommande, nouveauStatut
        ));
        
        mailSender.send(message);
    }

    public void envoyerNotificationCommande(String email, String nomClient, String sujet, String message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(fromEmail);
        mailMessage.setTo(email);
        mailMessage.setSubject("FasoMarket - " + sujet);
        mailMessage.setText(String.format(
            "Bonjour %s,\n\n" +
            "%s\n\n" +
            "Vous pouvez suivre l'évolution de vos commandes dans votre espace client.\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            nomClient, message
        ));
        
        mailSender.send(mailMessage);
    }

    public void envoyerFacture(String email, String nomClient, String numeroFacture, String contenuPdf) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Facture FasoMarket - " + numeroFacture);
        message.setText(String.format(
            "Bonjour %s,\n\n" +
            "Veuillez trouver ci-joint votre facture %s.\n\n" +
            "Merci pour votre achat sur FasoMarket !\n\n" +
            "Cordialement,\n" +
            "L'équipe FasoMarket",
            nomClient, numeroFacture
        ));
        
        mailSender.send(message);
    }
}